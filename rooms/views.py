from django.shortcuts import render
from .models import Room, RoomType
from .serializers import RoomSerializer, RoomTypeSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsManagerOrAdmin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by('floor', 'room_number')
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return super().get_permissions()

@method_decorator(csrf_exempt, name='dispatch')
class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return super().get_permissions()

    