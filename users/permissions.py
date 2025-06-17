from rest_framework import permissions

# Phân quyền cho manager, admin và kiểm tra user đã đăng nhập chưa
class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        return request.user.role.role in ['manager', 'admin']

# Phân quyền cho user, nếu không có quyền thì trả về thông tin của user đó
class IsOwnerOrManagerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role and request.user.role.role in ['manager', 'admin']:
            return True
        return obj.id == request.user.id
        