from rest_framework import permissions
from users.permissions import IsManagerOrAdmin

class IsInvoiceBookingOwnerOrManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        # Manager/Admin có thể xem tất cả
        if IsManagerOrAdmin().has_permission(request, view):
            return True
        # Người tạo booking có thể xem invoice
        if obj.booking.created_by == request.user:
            return True
        return False