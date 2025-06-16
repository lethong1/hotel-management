from django.db import models
from bookings.models import Booking

# Create your models here.
class Invoice(models.Model):
    id_invoice = models.AutoField(primary_key=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=100)
    issued_at = models.DateTimeField(auto_now_add=True)
    booking_id = models.ForeignKey(Booking, on_delete=models.CASCADE)
