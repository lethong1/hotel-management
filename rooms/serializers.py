from rest_framework import serializers
from .models import RoomType, Room
from amenities.serializers import AmenitySerializer
from amenities.models import Amenity
class RoomTypeSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    amenities_id = serializers.PrimaryKeyRelatedField(queryset=Amenity.objects.all(), source='amenities', write_only=True)

    class Meta:
        model = RoomType
        fields = [
            'id',
            'name',
            'description',
            'price_per_night',
            'amenities',
            'amenities_id',
            'capacity',
        ]

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


