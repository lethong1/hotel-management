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
from invoices.models import Invoice # Import Invoice model

User = get_user_model()

class FinalWorkflowTests(APITestCase):
    """
    Test toàn bộ luồng nghiệp vụ từ Booking đến Invoice.
    """

    @classmethod
    def setUpTestData(cls):
        """
        Thiết lập dữ liệu dùng chung cho tất cả các bài test.
        """
        # Tạo Roles và Users
        role_manager = Role.objects.create(role='manager')
        role_user = Role.objects.create(role='user')
        cls.manager_user = User.objects.create_user('manager', 'manager@test.com', 'pw123', role=role_manager)
        cls.staff_user = User.objects.create_user('staff', 'staff@test.com', 'pw123', role=role_user)

        # Tạo Customer và Room
        cls.customer = Customer.objects.create(full_name='Khách hàng VIP', email='vip@test.com', id_card_number='987654321')
        room_type = RoomType.objects.create(name='VIP', price_per_night=5000000, capacity=2)
        cls.room = Room.objects.create(room_number='V101', room_type=room_type, floor=10)

        # Định nghĩa sẵn URL
        cls.bookings_url = reverse('booking-list')

    def test_booking_creation_and_invoice_generation_flow(self):
        """
        Kiểm tra luồng: Tạo Booking -> Tự động tạo Invoice -> Thanh toán Invoice -> Tự động cập nhật Booking.
        """
        # --- BƯỚC 1: NHÂN VIÊN TẠO MỘT BOOKING MỚI ---
        self.client.force_authenticate(user=self.staff_user)

        check_in = timezone.now() + timedelta(days=5)
        check_out = timezone.now() + timedelta(days=7)

        booking_payload = {
            'customer_id': self.customer.pk,
            'room_id': self.room.pk,
            'check_in_date': check_in.isoformat(),
            'check_out_date': check_out.isoformat(),
            'status': 'pending', # Tạo với trạng thái pending
        }

        # Gửi request tạo booking
        response_create_booking = self.client.post(self.bookings_url, booking_payload, format='json')
        
        # Kiểm tra tạo booking thành công
        self.assertEqual(response_create_booking.status_code, status.HTTP_201_CREATED)
        new_booking_id = response_create_booking.data['id']
        
        # Kiểm tra xem Booking có đúng trạng thái 'pending' không
        booking_instance = Booking.objects.get(pk=new_booking_id)
        self.assertEqual(booking_instance.status, 'pending')

        # --- BƯỚC 2: KIỂM TRA INVOICE ĐÃ ĐƯỢC TỰ ĐỘNG TẠO ---
        # Hàm save() của model Invoice đã được kích hoạt sau khi booking được tạo
        self.assertTrue(Invoice.objects.filter(booking=booking_instance).exists())
        invoice_instance = Invoice.objects.get(booking=booking_instance)
        
        # Kiểm tra thông tin invoice có chính xác không
        self.assertEqual(invoice_instance.status, 'pending')
        self.assertEqual(invoice_instance.total_amount, booking_instance.total_price)
        print(f"Hóa đơn {invoice_instance.invoice_number} đã được tạo tự động.")

        # --- BƯỚC 3: MANAGER THANH TOÁN HÓA ĐƠN ---
        self.client.force_authenticate(user=self.manager_user) # Đăng nhập với quyền manager
        
        invoice_detail_url = reverse('invoice-detail', kwargs={'pk': invoice_instance.pk})
        
        # Gửi request cập nhật trạng thái hóa đơn thành 'paid'
        response_pay_invoice = self.client.patch(invoice_detail_url, {'status': 'paid'}, format='json')
        
        self.assertEqual(response_pay_invoice.status_code, status.HTTP_200_OK)
        
        # Kiểm tra lại trạng thái hóa đơn trong database
        invoice_instance.refresh_from_db()
        self.assertEqual(invoice_instance.status, 'paid')
        print(f"Hóa đơn {invoice_instance.invoice_number} đã được thanh toán.")
        
        # --- BƯỚC 4: KIỂM TRA TRẠNG THÁI BOOKING ĐÃ ĐƯỢC TỰ ĐỘNG CẬP NHẬT ---
        # Logic trong InvoiceViewSet.perform_update sẽ thực hiện việc này
        booking_instance.refresh_from_db()
        self.assertEqual(booking_instance.status, 'confirmed')
        print(f"Booking {booking_instance.id} đã được tự động chuyển sang 'confirmed'.")

        # Kiểm tra trạng thái phòng cũng đã được cập nhật
        self.room.refresh_from_db()
        self.assertEqual(self.room.status, 'occupied')
        print(f"Phòng {self.room.room_number} đã được chuyển sang 'occupied'.")