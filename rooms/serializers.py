from rest_framework import serializers
from .models import RoomType, Room

class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    room_type = RoomTypeSerializer(read_only=True)
    
    room_type_id = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.all(), source='room_type', write_only=True)
    
    class Meta:
        model = Room
        fields = [
            'id',
            'room_number',
            'room_type',
            'room_type_id',
            'status',
            'floor',
            'created_at',
        ]
        read_only_fields = ['created_at']


