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
from utils.momo import create_momo_payment
from django.conf import settings
from datetime import datetime
from rest_framework.decorators import action
from invoices.models import Invoice
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse

# @method_decorator(csrf_exempt, name='dispatch')
# @api_view(['GET'])
# def vnpay_return_view(request):
#     params = request.query_params
#     print("[VNPAY VERIFY RETURN] Params nhận được:", dict(params))
#     txn_ref = params.get('vnp_TxnRef')  # Booking ID
#     response_code = params.get('vnp_ResponseCode')
#     transaction_status = params.get('vnp_TransactionStatus')

#     if not txn_ref or response_code != '00' or transaction_status != '00':
#         return Response({"detail": "Giao dịch không thành công."}, status=400)

#     booking = get_object_or_404(Booking, pk=txn_ref)
#     invoice = get_object_or_404(Invoice, booking=booking)

#     # Kiểm tra trạng thái hiện tại
#     if invoice.status == 'paid':
#         return Response({
#             "detail": "Hóa đơn đã được thanh toán trước đó.",
#             "invoice_id": invoice.id
#         })

#     # Cập nhật trạng thái hóa đơn thành đã thanh toán
#     invoice.status = 'paid'
#     invoice.save()

#     # Cập nhật trạng thái booking thành đã trả phòng
#     booking.status = 'checked_out'
#     booking.save()

#     # Cập nhật trạng thái phòng thành available
#     room = booking.room
#     room.status = 'available'
#     room.save()

#     return Response({
#         "message": "Thanh toán thành công",
#         "booking_id": booking.id,
#         "invoice_id": invoice.id,
#         "room_id": room.id
#     })

@csrf_exempt
def momo_verify_return(request):
    """Xử lý xác nhận thanh toán MOMO khi redirect về"""
    print("[MOMO VERIFY] Nhận request:", request.method)
    print("[MOMO VERIFY] Headers:", dict(request.headers))
    
    if request.method == "POST":
        data = json.loads(request.body)
        order_id = data.get("orderId")
        result_code = str(data.get("resultCode"))
        if result_code == "0":
            booking_id = order_id.split("-")[0]
            try:
                booking = Booking.objects.get(pk=booking_id)
                invoice = Invoice.objects.get(booking=booking)
                if invoice.status != "paid":
                    invoice.status = "paid"
                    invoice.save()
                if booking.status != "checked_out":
                    booking.status = "checked_out"
                    booking.save()
                    
                    room = booking.room
                    room.status = 'available'
                    room.save()
                
                return JsonResponse({"message": "success", "invoice_id": invoice.id})
            except (Booking.DoesNotExist, Invoice.DoesNotExist):
                return JsonResponse({"message": "Không tìm thấy booking hoặc hóa đơn"}, status=404)
        else:
            return JsonResponse({"message": "Thanh toán thất bại"}, status=400)
    return JsonResponse({"message": "method not allowed"}, status=405)

@method_decorator(csrf_exempt, name='dispatch')
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
        if instance.status in ['checked_in']:
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
        elif instance.status in ['checked_in']:
            new_room.status = 'occupied'
            new_room.save()

    # @action(detail=False, methods=["post"])
    # def create_vnpay_url(self, request, pk=None):
    #     booking_id = pk

    #     if not booking_id:
    #         return Response({"detail": "Thiếu booking_id"}, status=400)

    #     try:
    #         booking = Booking.objects.get(pk=booking_id)
    #     except Booking.DoesNotExist:
    #         return Response({"detail": "Không tìm thấy booking"}, status=404)

    #     # Kiểm tra booking phải ở trạng thái checked_in để thanh toán
    #     if booking.status != "checked_in":
    #         return Response({"detail": "Booking phải ở trạng thái đã nhận phòng để thanh toán"}, status=400)

    #     # Kiểm tra hóa đơn chưa được thanh toán
    #     try:
    #         invoice = Invoice.objects.get(booking=booking)
    #         if invoice.status == 'paid':
    #             return Response({"detail": "Hóa đơn đã được thanh toán"}, status=400)
    #     except Invoice.DoesNotExist:
    #         return Response({"detail": "Không tìm thấy hóa đơn cho booking này"}, status=404)

    #     vnp = Vnpay()
    #     vnp.requestData = {
    #         'vnp_Version': '2.1.0',
    #         'vnp_Command': 'pay',
    #         'vnp_TmnCode': settings.VNPAY_TMN_CODE,
    #         'vnp_Amount': int(booking.total_price * 100),  # VNĐ x 100
    #         'vnp_CurrCode': 'VND',
    #         'vnp_TxnRef': str(booking.id),
    #         'vnp_OrderInfo': f'Pay for #{booking.id}',
    #         'vnp_OrderType': 'other',
    #         'vnp_Locale': 'vn',
    #         'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
    #         'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
    #         'vnp_IpAddr': request.META.get('REMOTE_ADDR', '127.0.0.1'),
    #     }
    #     print("🔍 VNPAY Settings:")
    #     print(f"  TMN_CODE: {settings.VNPAY_TMN_CODE}")
    #     print(f"  HASH_SECRET: {settings.VNPAY_HASH_SECRET}")  # Chỉ hiện 10 ký tự đầu
    #     print(f"  API_URL: {settings.VNPAY_API_URL}")
    #     print(f"  RETURN_URL: {settings.VNPAY_RETURN_URL}")

    #     print("🔍 Request data to VNPAY:", vnp.requestData)
    #     payment_url = vnp.get_payment_url(settings.VNPAY_API_URL, settings.VNPAY_HASH_SECRET)
    #     return Response({'vnpay_url': payment_url})

    @action(detail=True, methods=["post"])
    def create_momo_url(self, request, pk=None):
        booking = get_object_or_404(Booking, pk=pk)
        
        payment_type = request.data.get('payment_type', 'qr') 
        
        redirect_url = settings.MOMO_RETURN_URL
        ipn_url = settings.MOMO_NOTIFY_URL 

        # print("[MOMO] Request data:")
        # print(f"  booking_id: {booking.id}")
        # print(f"  total_price: {booking.total_price}")
        # print(f"  payment_type: {payment_type}")
        # print(f"  redirect_url: {redirect_url}")
        # print(f"  ipn_url: {ipn_url}")

        momo_response = create_momo_payment(booking, redirect_url, ipn_url, payment_type)

        # print("[MOMO] Response:")
        # print(momo_response)

        if momo_response.get("payUrl"):
            return Response({"pay_url": momo_response["payUrl"]})
        else:
            return Response({"detail": momo_response.get("message", "Không thể tạo link thanh toán.")}, status=400)

    @action(detail=True, methods=["post"])
    def create_cash_payment(self, request, pk=None):

        booking = get_object_or_404(Booking, pk=pk)
        
        if booking.status != "checked_in":
            return Response({"detail": "Booking phải ở trạng thái đã nhận phòng để thanh toán"}, status=400)

        try:
            invoice = Invoice.objects.get(booking=booking)
            if invoice.status == 'paid':
                return Response({"detail": "Hóa đơn đã được thanh toán"}, status=400)
        except Invoice.DoesNotExist:
            return Response({"detail": "Không tìm thấy hóa đơn cho booking này"}, status=404)

        try:
            invoice.status = 'paid'
            invoice.save()

            booking.status = 'checked_out'
            booking.save()

            room = booking.room
            room.status = 'available'
            room.save()

            return Response({
                "message": "Thanh toán tiền mặt thành công",
                "booking_id": booking.id,
                "invoice_id": invoice.id,
                "room_id": room.id
            })
        except Exception as e:
            return Response({"detail": f"Lỗi khi cập nhật trạng thái: {str(e)}"}, status=500)

    
