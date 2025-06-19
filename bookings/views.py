from django.shortcuts import render
from .models import Booking
from .serializers import BookingSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsManagerOrAdmin
from .permissions import IsBookingOwnerOrManagerOrAdmin

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
        
