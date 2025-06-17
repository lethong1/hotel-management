from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Role

# Lấy model User đang hoạt động
User = get_user_model()

class UserAPITests(APITestCase):
    """
    Bộ test đã được cập nhật cho API của ứng dụng Users.
    """

    @classmethod
    def setUpTestData(cls):
        """
        Sử dụng setUpTestData để thiết lập dữ liệu một lần cho cả lớp Test.
        Hiệu quả hơn setUp khi dữ liệu không thay đổi giữa các bài test.
        """
        # 1. Tạo các vai trò (Roles) đúng với model mới (không có description)
        cls.role_admin = Role.objects.create(role='admin')
        cls.role_manager = Role.objects.create(role='manager')
        cls.role_user = Role.objects.create(role='user')

        # 2. Tạo các người dùng với các vai trò khác nhau
        cls.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='password123',
            full_name='Admin User'
        )
        cls.admin_user.role = cls.role_admin
        cls.admin_user.save()

        cls.manager_user = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            password='password123',
            full_name='Manager User',
            role=cls.role_manager
        )

        cls.normal_user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='password123',
            full_name='Normal User',
            role=cls.role_user
        )

        # URL cho việc lấy token
        cls.token_url = reverse('token_obtain_pair')
        cls.users_url = reverse('user-list')

    def test_login_and_get_token(self):
        """
        Kiểm tra người dùng có thể đăng nhập và nhận token thành công.
        """
        data = {'username': 'testuser', 'password': 'password123'}
        response = self.client.post(self.token_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)

    def test_unauthenticated_user_cannot_access_users_list(self):
        """
        Kiểm tra người dùng chưa đăng nhập không thể xem danh sách users.
        """
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_normal_user_permissions(self):
        """
        Kiểm tra quyền của người dùng có vai trò 'user'.
        """
        self.client.force_authenticate(user=self.normal_user)

        # User không thể xem danh sách tất cả người dùng
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User có thể xem thông tin của chính mình
        user_detail_url = reverse('user-detail', kwargs={'pk': self.normal_user.pk})
        response = self.client.get(user_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.normal_user.username)

        # User không thể xem thông tin của người khác
        other_user_detail_url = reverse('user-detail', kwargs={'pk': self.manager_user.pk})
        response = self.client.get(other_user_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_permissions_and_default_role_assignment(self):
        """
        Kiểm tra quyền của 'manager' và chức năng gán vai trò mặc định.
        """
        self.client.force_authenticate(user=self.manager_user)

        # Manager có thể xem danh sách người dùng
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Manager có thể tạo một user mới (không cần truyền role)
        new_user_data = {
            'username': 'newuserbymanager',
            'email': 'new@example.com',
            'password': 'password123',
            'full_name': 'New User'
        }
        response = self.client.post(self.users_url, new_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Kiểm tra vai trò mặc định ('user') đã được gán thành công
        self.assertEqual(response.data['role'], self.role_user.pk)

        # Manager không thể truy cập API quản lý Role
        roles_list_url = reverse('role-list-create')
        response = self.client.get(roles_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_permissions(self):
        """
        Kiểm tra quyền của 'admin'.
        """
        self.client.force_authenticate(user=self.admin_user)

        # Admin có thể truy cập API quản lý Role
        roles_list_url = reverse('role-list-create')
        response = self.client.get(roles_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Vì thiết kế model Role là cố định, chúng ta không test tạo Role mới,
        # mà test quyền admin có thể xóa một Role.
        role_to_delete_pk = self.role_user.pk
        role_detail_url = reverse('role-detail', kwargs={'pk': role_to_delete_pk})
        
        response = self.client.delete(role_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Kiểm tra xem role đã thực sự bị xóa khỏi database chưa
        with self.assertRaises(Role.DoesNotExist):
            Role.objects.get(pk=role_to_delete_pk)