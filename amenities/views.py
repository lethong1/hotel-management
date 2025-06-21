from django.shortcuts import render
from rest_framework import viewsets
from .models import Amenity
from .serializers import AmenitySerializer
from users.permissions import IsManagerOrAdmin
from rest_framework.permissions import IsAuthenticated
class AmenityViewSet(viewsets.ModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [IsManagerOrAdmin]
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return super().get_permissions()

