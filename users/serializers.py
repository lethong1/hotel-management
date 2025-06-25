from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role

User = get_user_model()

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name', 'phone_number', 
                 'address', 'role', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'full_name', 'phone_number', 'address', 'email', 'role']

    def validate_role(self, value):
        """Validate that the role exists"""
        if value and not Role.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Role không tồn tại")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

