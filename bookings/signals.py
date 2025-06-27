from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking
from invoices.models import Invoice
from django.utils import timezone
from datetime import timedelta

@receiver(post_save, sender=Booking)
def create_invoice_for_booking(sender, instance, created, **kwargs):
    if created:
        if not hasattr(instance, 'invoice'):
            due_date = instance.check_in_date

            Invoice.objects.create(
                booking=instance,
                due_date=due_date,
                created_by=instance.created_by
            )
            print(f"Signal đã tự động tạo Invoice cho Booking ID: {instance.id}")