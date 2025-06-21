from django.urls import path, include
from .views import AmenityViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'amenities', AmenityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]