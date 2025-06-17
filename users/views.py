from .models import User, Role
from .serializers import UserSerializer, RoleSerializer, UserCreateSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework import generics, viewsets
from django.contrib.auth import get_user_model
from .permissions import IsManagerOrAdmin, IsOwnerOrManagerOrAdmin

User = get_user_model()


# View liệt kê và tạo vai trò
class RoleListCreateView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]  

#View xem update xóa vai trò
class RoleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManagerOrAdmin]

    def get_permissions(self):
        if self.action in ['list','create', 'destroy']:
            return [IsAuthenticated(), IsManagerOrAdmin()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        if 'role' in self.request.data:
            serializer.save()
        else:
            try:
                default_role = Role.objects.get(role='user')
                serializer.save(role=default_role) 
            except Role.DoesNotExist:
                serializer.save()
         