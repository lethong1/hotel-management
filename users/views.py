from .models import User, Role
from .serializers import UserSerializer, RoleSerializer, UserCreateSerializer, SetPasswordSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework import generics, viewsets
from django.contrib.auth import get_user_model
from .permissions import IsManagerOrAdmin, IsOwnerOrManagerOrAdmin
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

User = get_user_model()


# View liệt kê và tạo vai trò
@method_decorator(csrf_exempt, name='dispatch')
class RoleListCreateView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]  

#View xem update xóa vai trò
@method_decorator(csrf_exempt, name='dispatch')
class RoleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]


@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrManagerOrAdmin]

    #Show only user info   
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list','create', 'destroy']:
            return [IsAuthenticated(), IsManagerOrAdmin()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        try:
            # Nếu có role trong validated_data, sử dụng role đó
            # Nếu không có, serializer sẽ tự động gán None (do role field có blank=True)
            serializer.save()
        except Exception as e:
            # Log lỗi để debug
            print(f"Error creating user: {e}")
            raise

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def set_password(self, request, pk=None):
        user  = self.get_object()
        serializer = SetPasswordSerializer(user, data= request.data)
        if serializer.is_valid():
            serializer.save(user)
            return Response({"message": "Mật khẩu đã được thay đổi thành công"})
        return Response(serializer.errors)