from django.db import models

# Create your models here.
class Customer(models.Model):
    id_customer = models.AutoField(primary_key=True)
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(max_length=255)
    customer_phone = models.CharField(max_length=100)
    customer_address = models.TextField()
    customer_created_at = models.DateTimeField(auto_now_add=True)