from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from users.models import Role
from customers.models import Customer
from rooms.models import Room, RoomType
from .models import Booking

User = get_user_model()

class BookingAPITests(APITestCase):
    """
    Bộ test toàn diện cho API của ứng dụng Bookings.
    """

    @classmethod
    def setUpTestData(cls):
        """
        Thiết lập dữ liệu ban đầu một lần cho toàn bộ lớp Test.
        """
        # 1. Tạo Roles và Users
        role_admin = Role.objects.create(role='admin')
        role_manager = Role.objects.create(role='manager')
        role_user = Role.objects.create(role='user')
        
        cls.admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'pw123', role=role_admin)
        cls.manager_user = User.objects.create_user('manager', 'manager@example.com', 'pw123', role=role_manager)
        cls.staff_user_1 = User.objects.create_user('staff1', 'staff1@example.com', 'pw123', role=role_user)
        cls.staff_user_2 = User.objects.create_user('staff2', 'staff2@example.com', 'pw123', role=role_user)

        # 2. Tạo Customer
        cls.customer = Customer.objects.create(
            full_name='Nguyễn Văn A', email='nguyenvana@test.com',
            phone_number='0987654321', id_card_number='123456789'
        )

        # 3. Tạo RoomType và Rooms
        room_type = RoomType.objects.create(name='Deluxe', price_per_night=1500000, capacity=2)
        cls.room_101 = Room.objects.create(room_number='101', room_type=room_type, floor=1, status='available')
        cls.room_102 = Room.objects.create(room_number='102', room_type=room_type, floor=1, status='available')
        
        # 4. Tạo một Booking đã có sẵn để test các trường hợp update và xung đột
        # Booking này cho phòng 101, từ 10 đến 15 ngày nữa
        start_date = timezone.now() + timedelta(days=10)
        end_date = timezone.now() + timedelta(days=15)
        cls.existing_booking = Booking.objects.create(
            customer=cls.customer,
            room=cls.room_101,
            check_in_date=start_date,
            check_out_date=end_date,
            status='confirmed',
            created_by=cls.staff_user_1,
            total_price=7500000 # 1.5M * 5 đêm
        )
        # Cập nhật trạng thái phòng 101
        cls.room_101.status = 'occupied'
        cls.room_101.save()

        # 5. URL
        cls.bookings_url = reverse('booking-list')
    
    def test_create_booking_success(self):
        """
        Kiểm tra tạo booking thành công với dữ liệu hợp lệ.
        """
        self.client.force_authenticate(user=self.staff_user_1)
        
        # Đặt phòng 102 (đang trống) trong 2 đêm, bắt đầu từ 20 ngày nữa
        check_in = timezone.now() + timedelta(days=20)
        check_out = timezone.now() + timedelta(days=22)
        
        booking_data = {
            'customer_id': self.customer.pk,
            'room_id': self.room_102.pk,
            'check_in_date': check_in.isoformat(),
            'check_out_date': check_out.isoformat(),
            'status': 'confirmed'
        }
        
        response = self.client.post(self.bookings_url, booking_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Kiểm tra giá tiền được tính tự động (1.5M * 2 đêm = 3M)
        self.assertEqual(float(response.data['total_price']), 3000000.0)
        # Kiểm tra người tạo được gán tự động
        self.assertEqual(response.data['created_by']['id'], self.staff_user_1.pk)
        
        # Kiểm tra trạng thái phòng 102 đã được cập nhật thành 'occupied'
        self.room_102.refresh_from_db()
        self.assertEqual(self.room_102.status, 'occupied')

    def test_create_booking_conflict(self):
        """
        Kiểm tra không thể tạo booking nếu bị trùng lịch với booking đã có.
        """
        self.client.force_authenticate(user=self.staff_user_2)

        # Cố gắng đặt phòng 101 vào ngày 12 (trùng với existing_booking)
        check_in = timezone.now() + timedelta(days=12)
        check_out = timezone.now() + timedelta(days=14)
        
        booking_data = {
            'customer_id': self.customer.pk,
            'room_id': self.room_101.pk,
            'check_in_date': check_in.isoformat(),
            'check_out_date': check_out.isoformat(),
            'status': 'confirmed'
        }

        response = self.client.post(self.bookings_url, booking_data, format='json')
        # Kỳ vọng lỗi 400 Bad Request do validation
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("đã được đặt trong khoảng thời gian này", str(response.data))

    def test_permission_update_booking(self):
        """
        Kiểm tra chỉ chủ sở hữu hoặc quản lý mới được sửa booking.
        """
        booking_detail_url = reverse('booking-detail', kwargs={'pk': self.existing_booking.pk})
        update_data = {'notes': 'Khách VIP'}

        # 1. staff_user_2 (không phải người tạo) không được sửa
        self.client.force_authenticate(user=self.staff_user_2)
        response_fail = self.client.patch(booking_detail_url, update_data, format='json')
        self.assertEqual(response_fail.status_code, status.HTTP_403_FORBIDDEN)
        
        # 2. staff_user_1 (người tạo) được phép sửa
        self.client.force_authenticate(user=self.staff_user_1)
        response_success = self.client.patch(booking_detail_url, update_data, format='json')
        self.assertEqual(response_success.status_code, status.HTTP_200_OK)
        self.assertEqual(response_success.data['notes'], 'Khách VIP')
        
        # 3. manager (quản lý) được phép sửa
        self.client.force_authenticate(user=self.manager_user)
        update_data_2 = {'notes': 'Khách VIP - Quản lý duyệt'}
        response_manager = self.client.patch(booking_detail_url, update_data_2, format='json')
        self.assertEqual(response_manager.status_code, status.HTTP_200_OK)

    def test_permission_delete_booking(self):
        """
        Kiểm tra chỉ quản lý/admin mới được xóa booking.
        """
        booking_detail_url = reverse('booking-detail', kwargs={'pk': self.existing_booking.pk})

        # 1. staff_user_1 (người tạo) không được xóa
        self.client.force_authenticate(user=self.staff_user_1)
        response_fail = self.client.delete(booking_detail_url)
        self.assertEqual(response_fail.status_code, status.HTTP_403_FORBIDDEN)
        
        # 2. admin được phép xóa
        self.client.force_authenticate(user=self.admin_user)
        response_success = self.client.delete(booking_detail_url)
        self.assertEqual(response_success.status_code, status.HTTP_204_NO_CONTENT)

    def test_room_status_update_on_booking_status_change(self):
        """
        Kiểm tra trạng thái phòng được cập nhật khi trạng thái booking thay đổi.
        """
        self.client.force_authenticate(user=self.manager_user)
        booking_detail_url = reverse('booking-detail', kwargs={'pk': self.existing_booking.pk})
        
        # Ban đầu phòng 101 đang 'occupied'
        self.room_101.refresh_from_db()
        self.assertEqual(self.room_101.status, 'occupied')

        # Cập nhật booking thành 'checked_out'
        update_data = {'status': 'checked_out'}
        response = self.client.patch(booking_detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Kiểm tra lại trạng thái phòng 101, giờ phải là 'available'
        self.room_101.refresh_from_db()
        self.assertEqual(self.room_101.status, 'available')