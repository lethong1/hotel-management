from rest_framework import permissions
from users.permissions import IsManagerOrAdmin

class IsBookingOwnerOrManagerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if IsManagerOrAdmin().has_permission(request, view):
            return True
        return obj.created_by == request.user