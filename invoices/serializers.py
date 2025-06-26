from rest_framework import serializers
from .models import Invoice
from bookings.serializers import BookingSerializer
from users.serializers import UserSerializer
from django.utils import timezone
from bookings.models import Booking

class InvoiceBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'status']

class InvoiceSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    booking_id = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all(), source='booking', write_only=True)
    class Meta:
        model = Invoice
        fields = [
            'id',
            'booking',
            'booking_id',
            'invoice_number',
            'issue_date',
            'due_date',
            'total_amount',
            'status',
            'created_by',
            'notes',
        ]
        read_only_fields = ['invoice_number', 'issue_date', 'created_by', 'total_amount']

    def validate_booking_id(self,booking):
        if Invoice.objects.filter(booking=booking).exists():
            if not self.instance or self.instance.booking != booking:
                raise serializers.ValidationError("Đã tồn tại hóa đơn cho đơn đặt phòng này.")
        return booking
    
    def validate(self, data):
        booking = data.get('booking')
        if booking:
            if booking.status in ['cancelled', 'checked_out']:
                raise serializers.ValidationError("Không thể tạo hóa đơn cho đơn đặt phòng đã bị hủy.")
            if booking.total_price <= 0:
                raise serializers.ValidationError("Tổng giá trị đơn đặt phòng phải lớn hơn 0.")
        return data
    
class InvoiceBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'status']
