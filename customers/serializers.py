from rest_framework import serializers
from .models import Customer
from rooms.serializers import RoomSerializer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'full_name',
            'email',
            'phone_number',
            'address',
            'id_card_number',
            'created_at',
        ]
        read_only_fields = ['created_at']


