from django.db import models
from amenities.models import Amenity

# Create your models here.

class RoomType(models.Model):
    name = models.CharField(max_length=50, verbose_name="Tên loại phòng")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Giá một đêm")
    amenities = models.ManyToManyField(Amenity, blank=True, verbose_name="Tiện ích")
    capacity = models.IntegerField(help_text="Số lượng khách tối đa")

    def __str__(self):
        return self.name

class Room(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('cleaning', 'Cleaning'),
        ('maintenance', 'Maintenance'), 
    ]

    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    floor = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.room_number} - {self.room_type.name}"
