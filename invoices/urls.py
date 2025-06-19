from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]