from django.shortcuts import render
from .models import Booking
from .serializers import BookingSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsManagerOrAdmin
from .permissions import IsBookingOwnerOrManagerOrAdmin
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from utils.vnpay import Vnpay
from django.conf import settings
from datetime import datetime
from rest_framework.decorators import action
from invoices.models import Invoice

@api_view(['GET'])
def vnpay_return_view(request):
    params = request.query_params
    print("[VNPAY VERIFY RETURN] Params nhận được:", dict(params))
    txn_ref = params.get('vnp_TxnRef')  # Booking ID
    response_code = params.get('vnp_ResponseCode')
    transaction_status = params.get('vnp_TransactionStatus')

    if not txn_ref or response_code != '00' or transaction_status != '00':
        return Response({"detail": "Giao dịch không thành công."}, status=400)

    booking = get_object_or_404(Booking, pk=txn_ref)
    invoice = get_object_or_404(Invoice, booking=booking)

    # Kiểm tra trạng thái hiện tại
    if invoice.status == 'paid':
        return Response({
            "detail": "Hóa đơn đã được thanh toán trước đó.",
            "invoice_id": invoice.id
        })

    # Cập nhật trạng thái hóa đơn thành đã thanh toán
    invoice.status = 'paid'
    invoice.save()

    # Cập nhật trạng thái booking thành đã trả phòng
    booking.status = 'checked_out'
    booking.save()

    # Cập nhật trạng thái phòng thành available
    room = booking.room
    room.status = 'available'
    room.save()

    return Response({
        "message": "Thanh toán thành công",
        "booking_id": booking.id,
        "invoice_id": invoice.id,
        "room_id": room.id
    })

@action(detail=False, methods=["post"])
def create_vnpay_url(self, request):
    booking_id = request.data.get("booking_id")

    if not booking_id:
        return Response({"detail": "Thiếu booking_id"}, status=400)

    try:
        booking = Booking.objects.get(pk=booking_id)
    except Booking.DoesNotExist:
        return Response({"detail": "Không tìm thấy booking"}, status=404)

    if booking.status != "pending":
        return Response({"detail": "Booking không ở trạng thái chờ thanh toán"}, status=400)

    vnp = Vnpay()
    vnp.requestData = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': settings.VNPAY_TMN_CODE,
        'vnp_Amount': int(booking.total_price * 100),  # VNĐ x 100
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': str(booking.id),
        'vnp_OrderInfo': f"Thanh toán booking #{booking.id}",
        'vnp_OrderType': 'other',
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
        'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
        'vnp_IpAddr': request.META.get('REMOTE_ADDR', '127.0.0.1'),
    }

    payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET_KEY)
    return Response({'vnpay_url': payment_url})

    
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]

    def get_permissions(self):
        if self.action in ['list','create']:
            return [IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'retrieve']:
            return [IsBookingOwnerOrManagerOrAdmin()]
        if self.action in ['destroy']:
            return [IsManagerOrAdmin()] 
        return super().get_permissions()
    
    def perform_create(self, serializer):
        room = serializer.validated_data.get('room')
        check_in_date = serializer.validated_data.get('check_in_date')
        check_out_date = serializer.validated_data.get('check_out_date')
        duration = (check_out_date - check_in_date).days
        
        if (duration == 0):
            duration = 1
        total_price = room.room_type.price_per_night * duration
        instance = serializer.save(total_price=total_price, created_by=self.request.user)
        if instance.status in ['confirmed', 'checked_in']:
            room.status = 'occupied'
            room.save() 

    def perform_update(self, serializer):
        original_booking = self.get_object()
        new_room = serializer.validated_data.get('room', original_booking.room)
        new_check_in_date = serializer.validated_data.get('check_in_date', original_booking.check_in_date)
        new_check_out_date = serializer.validated_data.get('check_out_date', original_booking.check_out_date)
        duration = (new_check_out_date - new_check_in_date).days

        if (duration == 0):
            duration = 1
        
        total_price = new_room.room_type.price_per_night * duration 
        
        if original_booking.room != new_room:
            original_booking.room.status = 'available'
            original_booking.room.save()

        instance = serializer.save(total_price=total_price)
        
        if instance.status in ['cancelled', 'checked_out']:
            new_room.status = 'available'
            new_room.save()
        elif instance.status in ['confirmed', 'checked_in']:
            new_room.status = 'occupied'
            new_room.save()

    @action(detail=False, methods=["post"])
    def create_vnpay_url(self, request):
        booking_id = request.data.get("booking_id")

        if not booking_id:
            return Response({"detail": "Thiếu booking_id"}, status=400)

        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response({"detail": "Không tìm thấy booking"}, status=404)

        # Kiểm tra booking phải ở trạng thái checked_in để thanh toán
        if booking.status != "checked_in":
            return Response({"detail": "Booking phải ở trạng thái đã nhận phòng để thanh toán"}, status=400)

        # Kiểm tra hóa đơn chưa được thanh toán
        try:
            invoice = Invoice.objects.get(booking=booking)
            if invoice.status == 'paid':
                return Response({"detail": "Hóa đơn đã được thanh toán"}, status=400)
        except Invoice.DoesNotExist:
            return Response({"detail": "Không tìm thấy hóa đơn cho booking này"}, status=404)

        vnp = Vnpay()
        vnp.requestData = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': settings.VNPAY_TMN_CODE,
            'vnp_Amount': int(booking.total_price * 100),  # VNĐ x 100
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': str(booking.id),
            'vnp_OrderInfo': f"Thanh toán booking #{booking.id}",
            'vnp_OrderType': 'other',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_IpAddr': request.META.get('REMOTE_ADDR', '127.0.0.1'),
        }

        payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET_KEY)
        return Response({'vnpay_url': payment_url})
    