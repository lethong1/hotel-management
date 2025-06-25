from django.shortcuts import render
from rest_framework import viewsets
from .models import Invoice
from .serializers import InvoiceSerializer
from users.permissions import IsManagerOrAdmin
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
        
