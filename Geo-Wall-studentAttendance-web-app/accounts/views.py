from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import EmailTokenObtainPairSerializer, RegisterSerializer, send_verification_code

CODE_TTL_MINUTES = 15


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class VerifyEmailView(APIView):
    """
    Public on purpose: the user doesn't have a JWT yet at this point in the
    flow (they can't log in until they're verified). Verification happens by
    proving they received the emailed code, not by already being authenticated.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        if not email or not code:
            return Response({"detail": "Email and code are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid email or code"}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_email_verified:
            return Response({"detail": "Email already verified", "is_email_verified": True})

        if not user.email_verification_code or user.email_verification_code != code:
            return Response({"detail": "Invalid email or code"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.email_verification_sent_at or timezone.now() - user.email_verification_sent_at > timedelta(minutes=CODE_TTL_MINUTES):
            return Response({"detail": "Code expired. Request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.email_verification_code = None
        user.save(update_fields=['is_email_verified', 'email_verification_code'])

        # Auto-login: hand back real tokens immediately so the frontend
        # doesn't need to bounce the user through a separate login step.
        refresh = RefreshToken.for_user(user)
        return Response({
            "detail": "Email verified",
            "is_email_verified": True,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "username": user.username,
        })


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal whether the email exists.
            return Response({"detail": "If that account exists, a code has been sent."})

        if user.is_email_verified:
            return Response({"detail": "Email already verified", "is_email_verified": True})

        send_verification_code(user)
        return Response({"detail": "If that account exists, a code has been sent."})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(self._serialize(request.user))

    def patch(self, request):
        user = request.user
        for field in ('first_name', 'last_name'):
            if field in request.data:
                setattr(user, field, request.data[field] or '')
        user.save(update_fields=['first_name', 'last_name'])
        return Response(self._serialize(user))

    def _serialize(self, user):
        display_name = user.first_name or user.get_full_name() or user.username
        return {
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "matric_or_staff_id": user.matric_or_staff_id,
            "is_email_verified": user.is_email_verified,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "display_name": display_name,
        }