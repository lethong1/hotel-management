from django.db import models

# Create your models here.

class Amenity(models.Model):
    name = models.CharField(max_length=255, verbose_name="Tên tiện ích")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    icon_class = models.CharField(max_length=255, blank=True, verbose_name="Lớp icon")

    def __str__(self):
        return self.name

    class Meta: 
        verbose_name_plural = "Amenities"