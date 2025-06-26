from django.shortcuts import render
from rest_framework import viewsets
from .models import Invoice
from .serializers import InvoiceSerializer
from users.permissions import IsManagerOrAdmin
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.utils.dateparse import parse_datetime
from django.db.models.functions import TruncDate
# Create your views here.

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-issue_date')
    serializer_class = InvoiceSerializer
    permission_classes = [IsManagerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        original_invoice_status = self.get_object().status

        instance = serializer.save()

        new_status = instance.status
        if original_invoice_status != new_status:
            booking = instance.booking
            if new_status == 'paid':
                booking.status = 'confirmed'
                booking.save(update_fields=['status'])
                booking.room.status = 'occupied'
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
        if start_date:
            invoices = invoices.filter(issue_date__gte=parse_datetime(start_date))
        if end_date:
            invoices = invoices.filter(issue_date__lte=parse_datetime(end_date))
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
            # Định dạng lại cho frontend
            result['daily'] = [
                {'date': d['date'].strftime('%d/%m/%Y'), 'revenue': d['revenue']} for d in daily
            ]
        return Response(result)
