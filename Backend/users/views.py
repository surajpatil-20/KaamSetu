from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer

from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import User, PasswordResetOTP
from .serializers import (
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
)
from .otp import (
    generate_otp,
    hash_otp,
    verify_otp_hash,
    otp_expiry_time,
    send_otp,
    OTP_MAX_ATTEMPTS,
)



class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        })

class ForgotPasswordView(generics.GenericAPIView):

    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        identifier = serializer.validated_data[
            "identifier"
        ].strip()

        normalized_phone = identifier

        if normalized_phone.startswith("+91"):
            normalized_phone = normalized_phone[3:]

        normalized_phone = (
            normalized_phone
            .replace(" ", "")
            .replace("-", "")
        )

        user = User.objects.filter(
            username=identifier
        ).first()

        if user is None:
            user = User.objects.filter(
                phone_number="+91" + normalized_phone
            ).first()

        # Do not reveal whether account exists.
        generic_response = Response({
            "message": (
                "If an account exists with this information, "
                "an OTP has been sent."
            )
        })

        if user is None:
            return generic_response

        if not user.phone_number or not user.phone_verified:
            return generic_response

        # 60-second resend protection
        cache_key = f"password_reset_otp:{user.id}"

        if cache.get(cache_key):
            return Response({
                "message": (
                    "If an account exists with this information, "
                    "an OTP has been sent."
                )
            })

        otp = generate_otp()

        PasswordResetOTP.objects.filter(
            user=user,
            is_used=False
        ).update(
            is_used=True
        )

        PasswordResetOTP.objects.create(
            user=user,
            otp_hash=hash_otp(otp),
            expires_at=otp_expiry_time()
        )

        cache.set(
            cache_key,
            True,
            timeout=60
        )

        send_otp(
            user,
            otp
        )

        return generic_response


class VerifyOTPView(generics.GenericAPIView):

    serializer_class = VerifyOTPSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        identifier = serializer.validated_data[
            "identifier"
        ].strip()

        otp = serializer.validated_data[
            "otp"
        ]

        normalized_phone = (
            identifier
            .replace(" ", "")
            .replace("-", "")
        )

        user = User.objects.filter(
            username=identifier
        ).first()

        if user is None and normalized_phone.isdigit():
            user = User.objects.filter(
                phone_number="+91" + normalized_phone
            ).first()

        if user is None:
            raise ValidationError(
                "Invalid OTP."
            )

        otp_record = PasswordResetOTP.objects.filter(
            user=user,
            is_used=False
        ).order_by(
            "-created_at"
        ).first()

        if otp_record is None:
            raise ValidationError(
                "Invalid or expired OTP."
            )

        if otp_record.expires_at < timezone.now():

            otp_record.is_used = True
            otp_record.save(
                update_fields=["is_used"]
            )

            raise ValidationError(
                "OTP has expired."
            )

        if otp_record.attempts >= OTP_MAX_ATTEMPTS:

            otp_record.is_used = True
            otp_record.save(
                update_fields=["is_used"]
            )

            raise ValidationError(
                "Too many OTP attempts. Request a new OTP."
            )

        otp_record.attempts += 1

        if not verify_otp_hash(
            otp,
            otp_record.otp_hash
        ):

            otp_record.save(
                update_fields=["attempts"]
            )

            raise ValidationError(
                "Invalid OTP."
            )

        otp_record.is_used = True

        otp_record.save(
            update_fields=[
                "attempts",
                "is_used"
            ]
        )

        # Generate Django password-reset token.
        token = default_token_generator.make_token(
            user
        )

        return Response({
            "message": "OTP verified successfully.",
            "uid": user.id,
            "reset_token": token
        })

class ResetPasswordView(generics.GenericAPIView):

    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data[
            "new_password"
        ]

        user = get_object_or_404(
            User,
            id=uid
        )

        if not default_token_generator.check_token(
            user,
            token
        ):
            raise ValidationError(
                "Invalid or expired password reset token."
            )

        user.set_password(
            new_password
        )

        user.save(
            update_fields=[
                "password"
            ]
        )

        return Response({
            "message": (
                "Password reset successfully. "
                "Please login with your new password."
            )
        })