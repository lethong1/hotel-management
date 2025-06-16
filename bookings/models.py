from django.db import models
from customers.models import Customer
from rooms.models import Room
from users.models import User
# Create your models here.
class Booking(models.Model):
    id_booking = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE)
    room_id = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_status = models.CharField(max_length=100)
    booking_created_at = models.DateTimeField(auto_now_add=True)
    created_by_user_id = models.ForeignKey(User, on_delete=models.CASCADE)

class Service(models.Model):
    id_service = models.AutoField(primary_key=True)
    service_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)

class BookingService(models.Model):
    id_booking_service = models.AutoField(primary_key=True)
    booking_id = models.ForeignKey(Booking, on_delete=models.CASCADE)
    service_id = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_service_created_at = models.DateTimeField(auto_now_add=True)