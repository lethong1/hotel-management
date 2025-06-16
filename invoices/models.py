from django.db import models
from bookings.models import Booking
from users.models import User

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=20, unique=True)
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.booking}"

    class Meta:
        ordering = ['-created_at']
