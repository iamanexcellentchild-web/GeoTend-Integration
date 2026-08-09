import random

from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


def send_verification_code(user):
    """Generate a fresh 6-digit code, store it, and email it to the user."""
    code = f"{random.randint(0, 999999):06d}"
    user.email_verification_code = code
    user.email_verification_sent_at = timezone.now()
    user.save(update_fields=['email_verification_code', 'email_verification_sent_at'])
    send_mail(
        subject='Your GeoTend verification code',
        message=f'Your verification code is {code}. It expires in 15 minutes.',
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return code


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'matric_or_staff_id', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        if not validated_data.get('matric_or_staff_id'):
            validated_data['matric_or_staff_id'] = None
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.is_email_verified = False
        user.save()
        send_verification_code(user)
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

        if not authenticated_user.is_email_verified:
            raise serializers.ValidationError({
                'detail': 'Please verify your email before signing in.',
                'code': 'email_not_verified',
            })

        refresh = RefreshToken.for_user(authenticated_user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }