from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(
        choices=UserProfile.USER_TYPES,
        write_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'user_type']

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        UserProfile.objects.create(
            user=user,
            user_type=user_type
        )

        return user

class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = [
            'user',
            'user_type',
            'full_name',
            'company_name',
            'job_title',
            'website',
            'company_description',
            'company_logo',
            'profile_picture',
            'phone',
            'address',
            'created_at',
        ]
        read_only_fields = ['user', 'user_type', 'created_at']
class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_staff or not self.user.is_superuser:
            raise AuthenticationFailed(
                'Access denied. Admin account required.'
            )

        return data