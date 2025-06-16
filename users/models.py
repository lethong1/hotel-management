from django.db import models

# Create your models here.
class Role(models.Model):
    id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=100, default='Receptionist')

class User(models.Model):
    id = models.AutoField(primary_key=True)
    fullname = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    role_id = models.ForeignKey(Role, on_delete=models.CASCADE)


