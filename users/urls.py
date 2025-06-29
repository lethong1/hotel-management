from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, RoleListCreateView, RoleRetrieveUpdateDestroyView
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')


urlpatterns = [
    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleRetrieveUpdateDestroyView.as_view(), name='role-detail'),
    path('users/<int:pk>/set-password/', UserViewSet.as_view({'post': 'set_password'}), name='set-password'),
    path('', include(router.urls)),
]
