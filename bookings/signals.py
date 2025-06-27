from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from invoices.models import Invoice
from django.utils import timezone
from datetime import timedelta

@receiver(post_save, sender=Booking)
def create_invoice_for_booking(sender, instance, created, **kwargs):
    """
    Signal này sẽ tự động được gọi mỗi khi một đối tượng Booking được lưu.
    """
    # Chúng ta chỉ muốn tạo Invoice khi một Booking được TẠO MỚI
    if created:
        # Kiểm tra xem hóa đơn đã tồn tại chưa để tránh tạo trùng lặp
        if not hasattr(instance, 'invoice'):
            # Mặc định hạn thanh toán là ngày check-in
            due_date = instance.check_in_date

            Invoice.objects.create(
                booking=instance,
                due_date=due_date,
                created_by=instance.created_by  # Set created_by từ booking
                # Các trường khác như invoice_number, total_amount
                # sẽ được tự động điền bởi hàm save() của model Invoice.
            )
            print(f"Signal đã tự động tạo Invoice cho Booking ID: {instance.id}")