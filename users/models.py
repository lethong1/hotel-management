from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Vai trò")
    description = models.TextField(blank=True, verbose_name="Mô tả")

    def __str__(self):
        return self.name
    
class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=100, verbose_name="Họ và tên")
    phone_number = models.CharField(max_length=15, blank=True, verbose_name="Số điện thoại")
    address = models.TextField(blank=True, verbose_name="Địa chỉ")
    email = models.EmailField(unique=True, verbose_name="Email")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.full_name if self.full_name else self.email