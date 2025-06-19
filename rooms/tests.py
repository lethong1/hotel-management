
# Create your tests here.
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from users.models import Role
from .models import RoomType, Room

User = get_user_model()

class RoomAPITests(APITestCase):
    """
    Bộ test cập nhật cho API của ứng dụng Rooms,
    yêu cầu đăng nhập để xem.
    """

    @classmethod
    def setUpTestData(cls):
        """
        Thiết lập dữ liệu ban đầu một lần cho cả lớp Test.
        """
        # 1. Tạo các vai trò
        role_admin = Role.objects.create(role='admin')
        role_manager = Role.objects.create(role='manager')
        role_user = Role.objects.create(role='user')

        # 2. Tạo các người dùng
        cls.admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'password123', role=role_admin)
        cls.manager_user = User.objects.create_user('manager', 'manager@example.com', 'password123', role=role_manager)
        cls.normal_user = User.objects.create_user('user', 'user@example.com', 'password123', role=role_user)

        # 3. Tạo dữ liệu cho Rooms
        cls.room_type_standard = RoomType.objects.create(
            name='Standard',
            description='Phòng tiêu chuẩn',
            price_per_night=1000000,
            capacity=2
        )
        cls.room_101 = Room.objects.create(
            room_number='101',
            room_type=cls.room_type_standard,
            floor=1
        )
        
        # 4. Định nghĩa sẵn các URL để tái sử dụng
        cls.rooms_url = reverse('room-list')
        cls.room_detail_url = reverse('room-detail', kwargs={'pk': cls.room_101.pk})

    def test_unauthenticated_user_cannot_read_rooms(self):
        """
        Kiểm tra người dùng CHƯA đăng nhập KHÔNG THỂ xem danh sách phòng.
        """
        response = self.client.get(self.rooms_url)
        # Kỳ vọng lỗi 401 Unauthorized vì chưa đăng nhập
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_normal_user_can_read_but_cannot_write(self):
        """
        Kiểm tra người dùng thường ('user') có thể xem nhưng không thể chỉnh sửa.
        """
        # Giả lập đăng nhập với vai trò 'user'
        self.client.force_authenticate(user=self.normal_user)
        
        # 1. CÓ THỂ xem danh sách phòng
        response_list = self.client.get(self.rooms_url)
        self.assertEqual(response_list.status_code, status.HTTP_200_OK)
        
        # 2. CÓ THỂ xem chi tiết phòng
        response_detail = self.client.get(self.room_detail_url)
        self.assertEqual(response_detail.status_code, status.HTTP_200_OK)

        # 3. KHÔNG THỂ tạo phòng mới
        new_room_data = {
            "room_number": "202",
            "floor": 2,
            "status": "available",
            "room_type_id": self.room_type_standard.pk
        }
        response_create = self.client.post(self.rooms_url, new_room_data, format='json')
        self.assertEqual(response_create.status_code, status.HTTP_403_FORBIDDEN)
        
        # 4. KHÔNG THỂ xóa phòng
        response_delete = self.client.delete(self.room_detail_url)
        self.assertEqual(response_delete.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_read_and_write(self):
        """
        Kiểm tra người dùng 'manager' có thể thực hiện mọi thao tác.
        """
        self.client.force_authenticate(user=self.manager_user)
        
        # 1. CÓ THỂ xem danh sách
        response_list = self.client.get(self.rooms_url)
        self.assertEqual(response_list.status_code, status.HTTP_200_OK)

        # 2. CÓ THỂ tạo phòng mới
        new_room_data = {
            "room_number": "M301",
            "floor": 3,
            "room_type_id": self.room_type_standard.pk
        }
        response_create = self.client.post(self.rooms_url, new_room_data, format='json')
        self.assertEqual(response_create.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_create.data['room_number'], 'M301')

    def test_admin_can_read_and_write(self):
        """
        Kiểm tra người dùng 'admin' có thể thực hiện mọi thao tác.
        """
        self.client.force_authenticate(user=self.admin_user)
        
        # 1. CÓ THỂ xem danh sách
        response_list = self.client.get(self.rooms_url)
        self.assertEqual(response_list.status_code, status.HTTP_200_OK)
        
        # 2. CÓ THỂ xóa phòng
        response_delete = self.client.delete(self.room_detail_url)
        self.assertEqual(response_delete.status_code, status.HTTP_204_NO_CONTENT)