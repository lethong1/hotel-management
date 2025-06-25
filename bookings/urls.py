from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet
from .views import vnpay_return_view
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('bookings/vnpay/verify-return/', vnpay_return_view, name = 'vnpay-return'),
]