"""
Views for the accounts app.
"""
import random
import string

from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()

OTP_TTL = 300  # 5 minutes


def _get_tokens_for_user(user):
    """Return a dict with refresh and access JWT tokens."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    """
    POST /api/accounts/register/
    Register a new user. Returns JWT tokens on success.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = _get_tokens_for_user(user)
        return Response(
            {
                'user': UserSerializer(user, context=self.get_serializer_context()).data,
                **tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/accounts/login/
    Login with phone + password. Returns JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = _get_tokens_for_user(user)
        return Response(
            {
                'user': UserSerializer(user).data,
                **tokens,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    Blacklist the refresh token to log out.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'با موفقیت خارج شدید.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'detail': 'توکن نامعتبر است.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/accounts/profile/  – retrieve own profile
    PUT  /api/accounts/profile/  – update own profile
    PATCH /api/accounts/profile/ – partial update
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    POST /api/accounts/change-password/
    Change the authenticated user's password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'رمز عبور با موفقیت تغییر یافت.'},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# SMS OTP (phone verification)
# ---------------------------------------------------------------------------

def _otp_cache_key(phone: str) -> str:
    return f'otp:{phone}'


class RequestOTPView(APIView):
    """
    POST /api/accounts/otp/request/  body: {phone}
    Generate and send a one-time code. Works only when SMS is enabled in the
    admin panel; otherwise the code is logged (دیتای کد در پاسخ برنمی‌گردد).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        phone = (request.data.get('phone') or '').strip()
        if not phone.startswith('09') or len(phone) != 11 or not phone.isdigit():
            return Response(
                {'detail': 'شماره موبایل معتبر نیست.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        code = ''.join(random.choices(string.digits, k=5))
        cache.set(_otp_cache_key(phone), code, OTP_TTL)

        try:
            from apps.orders.sms import get_sms_adapter
            get_sms_adapter().send_otp(phone, code)
        except Exception:
            pass

        return Response(
            {'detail': 'کد تأیید ارسال شد.', 'expires_in': OTP_TTL},
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    """
    POST /api/accounts/otp/verify/  body: {phone, code}
    Verify the OTP code. On success returns JWT tokens, creating the user if
    they don't already exist (phone-based passwordless login).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        phone = (request.data.get('phone') or '').strip()
        code = (request.data.get('code') or '').strip()

        cached = cache.get(_otp_cache_key(phone))
        if not cached or cached != code:
            return Response(
                {'detail': 'کد تأیید نادرست یا منقضی شده است.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cache.delete(_otp_cache_key(phone))

        user, _created = User.objects.get_or_create(
            phone=phone,
            defaults={'username': phone},
        )
        tokens = _get_tokens_for_user(user)
        return Response(
            {'user': UserSerializer(user).data, **tokens},
            status=status.HTTP_200_OK,
        )
