from django.shortcuts import render
from rest_framework import viewsets
from .models import Invoice
from .serializers import InvoiceSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils.dateparse import parse_datetime
from django.db.models.functions import TruncDate
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .permissions import IsInvoiceBookingOwnerOrManagerOrAdmin
from datetime import datetime, timedelta
from django.utils import timezone




# Create your views here.
@method_decorator(csrf_exempt, name='dispatch')
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related(
        'booking__customer',
        'booking__room__room_type',
        'booking__created_by',
        'created_by'
    ).prefetch_related(
        'booking__room__room_type__amenities'
    ).all().order_by('-issue_date')
    serializer_class = InvoiceSerializer
    permission_classes = [IsInvoiceBookingOwnerOrManagerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        original_invoice_status = self.get_object().status

        instance = serializer.save()

        new_status = instance.status
        if original_invoice_status != new_status:
            booking = instance.booking
            if new_status == 'paid':
                booking.status = 'checked_out'
                booking.save(update_fields=['status'])
                booking.room.status = 'available'
                booking.room.save(update_fields=['status'])
            elif new_status == 'cancelled':
                booking.status = 'cancelled'
                booking.save(update_fields=['status'])
                booking.room.status = 'available'
                booking.room.save(update_fields=['status'])
        
    @action(detail=False, methods=['get'], url_path='revenue-report')
    def revenue_report(self, request):
        # Lọc theo ngày nếu có
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        group_by = request.query_params.get('group_by')
        
        invoices = Invoice.objects.filter(status='paid')
        
        # Xử lý filter theo ngày
        if start_date:
            try:
                start_datetime = parse_datetime(start_date)
                if start_datetime:
                    invoices = invoices.filter(issue_date__gte=start_datetime)
            except (ValueError, TypeError):
                pass  # Bỏ qua nếu ngày không hợp lệ
                
        if end_date:
            try:
                end_datetime = parse_datetime(end_date)
                if end_datetime:
                    # Thêm 1 ngày để bao gồm cả ngày cuối
                    end_datetime = end_datetime + timedelta(days=1)
                    invoices = invoices.filter(issue_date__lt=end_datetime)
            except (ValueError, TypeError):
                pass  # Bỏ qua nếu ngày không hợp lệ
        
        # Nếu không có filter ngày, lấy dữ liệu 30 ngày gần nhất
        if not start_date and not end_date:
            thirty_days_ago = timezone.now() - timedelta(days=30)
            invoices = invoices.filter(issue_date__gte=thirty_days_ago)
        
        total_revenue = invoices.aggregate(total=Sum('total_amount'))['total'] or 0
        count = invoices.count()
        
        result = {
            'total_revenue': total_revenue,
            'invoice_count': count,
            'start_date': start_date,
            'end_date': end_date,
        }
        
        if group_by == 'day':
            daily = (
                invoices
                .annotate(date=TruncDate('issue_date'))
                .values('date')
                .annotate(revenue=Sum('total_amount'))
                .order_by('date')
            )
            # Định dạng lại cho frontend - đảm bảo ngày hợp lệ
            result['daily'] = []
            for d in daily:
                if d['date']:  # Kiểm tra ngày không null
                    try:
                        formatted_date = d['date'].strftime('%d/%m/%Y')
                        result['daily'].append({
                            'date': formatted_date,
                            'revenue': d['revenue'] or 0
                        })
                    except (AttributeError, ValueError):
                        continue  # Bỏ qua nếu có lỗi format ngày
        
        return Response(result)
