from django.db import models
from bookings.models import Booking
from users.models import User
from django.utils import timezone

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=40, unique=True, blank=True)
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.booking}"

    class Meta:
        ordering = ['-issue_date']

    def save(self, *args, **kwargs):
        if self.booking:
            self.total_amount = self.booking.total_price
        
        if not self.invoice_number and self.booking:
            self.invoice_number = f"INV-{self.booking.id}-{timezone.now().strftime('%Y%m%d')}"
        
        super().save(*args, **kwargs)