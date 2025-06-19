from rest_framework import serializers
from .models import Booking
from users.serializers import UserSerializer
from customers.serializers import CustomerSerializer
from rooms.serializers import RoomSerializer
from customers.models import Customer
from rooms.models import Room
from django.utils import timezone
from datetime import date

class BookingSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    customer_id = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), source='customer', write_only=True)
    room_id = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all(), source='room', write_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'customer',
            'customer_id',
            'room',
            'room_id',
            'created_by',
            'check_in_date',
            'check_out_date',
            'status',
            'total_price',
            'notes',
            'created_at',
        ]
        read_only_fields = ['created_at', 'total_price', 'created_by']

    def validate(self, data):
        check_in_date =data.get('check_in_date')
        check_out_date = data.get('check_out_date')
        room = data.get('room')
        if check_in_date and check_out_date:
            if check_in_date > check_out_date:
                raise serializers.ValidationError("Ngày check-in phải trước ngày check-out.")
            if check_in_date < timezone.now():
                raise serializers.ValidationError("Ngày check-in không thể trước ngày hiện tại.")
            if room:
                conflicts = Booking.objects.filter(
                    room=room,
                    status__in=['confirmed', 'checked_in'],
                    check_in_date__lt=check_out_date,
                    check_out_date__gt=check_in_date
                )
                if self.instance:
                    conflicts = conflicts.exclude(pk=self.instance.pk)

                if conflicts.exists():
                    raise serializers.ValidationError("Phòng đã được đặt trong khoảng thời gian này.")
                
        return data
    