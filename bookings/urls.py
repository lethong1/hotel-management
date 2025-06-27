from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet
from .views import momo_verify_return

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('bookings/<int:pk>/momo/create-payment/', BookingViewSet.as_view({'post': 'create_momo_url'}), name='create-momo-url'),
    path('bookings/<int:pk>/cash/payment/', BookingViewSet.as_view({'post': 'create_cash_payment'}), name='create-cash-payment'),
    path('bookings/momo/verify-return/', momo_verify_return, name='momo-verify-return'),
]