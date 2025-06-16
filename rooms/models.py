from django.db import models

# Create your models here.
class RoomTypes(models.Model):
    id_type = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=100)
    description = models.TextField()

class Room(models.Model):
    id_room = models.AutoField(primary_key=True)
    room_number = models.CharField(max_length=100)
    room_type = models.ForeignKey(RoomTypes, on_delete=models.CASCADE)
    room_price = models.DecimalField(max_digits=10, decimal_places=2)
    room_status = models.CharField(max_length=100)