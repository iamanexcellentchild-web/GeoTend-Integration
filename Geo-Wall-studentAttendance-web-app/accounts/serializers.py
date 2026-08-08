from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'matric_or_staff_id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        if not validated_data.get('matric_or_staff_id'):
            validated_data['matric_or_staff_id'] = None
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.is_email_verified = False
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError({'detail': 'No active account found with the given credentials'})

        user = User.objects.filter(email=email).first() or User.objects.filter(username=email).first()
        if user is None:
            raise serializers.ValidationError({'detail': 'No active account found with the given credentials'})

        authenticated_user = authenticate(username=user.username, password=password)
        if authenticated_user is None or not authenticated_user.is_active:
            raise serializers.ValidationError({'detail': 'No active account found with the given credentials'})

        refresh = RefreshToken.for_user(authenticated_user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }