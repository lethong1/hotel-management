from django.db import models

# Create your models here.

class Customer(models.Model):
    full_name = models.CharField(max_length=100, verbose_name="Họ và tên")
    email = models.EmailField(unique=True, verbose_name="Email")
    phone_number = models.CharField(max_length=15, verbose_name="Số điện thoại")
    address = models.TextField()
    id_card_number = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
