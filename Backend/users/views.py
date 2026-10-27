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

from .models import User, PasswordResetOTP ,PhoneVerificationOTP ,CustomerProfile,WorkerProfile
from .serializers import (
    RegisterSerializer,
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
    VerifyPhoneSerializer,
)
from .otp import (
    generate_otp,
    hash_otp,
    verify_otp_hash,
    otp_expiry_time,
    send_otp,
    OTP_MAX_ATTEMPTS,
)

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.password_validation import validate_password



class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def perform_create(self, serializer):

        user = serializer.save()

        otp = generate_otp()

        PhoneVerificationOTP.objects.filter(
            user=user,
            is_used=False
        ).update(
            is_used=True
        )

        PhoneVerificationOTP.objects.create(
            user=user,
            otp_hash=hash_otp(otp),
            expires_at=otp_expiry_time()
        )

        send_otp(
            user,
            otp
        )





class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get(self, request):
        user = request.user

        if user.role == User.Role.WORKER:
            profile, _ = WorkerProfile.objects.get_or_create(
                user=user
            )

            profile_data = {
                "bio": profile.bio,
                "skills": profile.skills,
                "experience": profile.experience,
                "hourly_rate": profile.hourly_rate,
            }
        else:
            profile, _ = CustomerProfile.objects.get_or_create(
                user=user
            )

            profile_data = {
                "about": profile.about,
            }

        profile_photo_url = None

        if profile.profile_photo:
            profile_photo_url = request.build_absolute_uri(
                profile.profile_photo.url
            )

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "phone_number": user.phone_number or "",
            "phone_verified": user.phone_verified,
            "profile_photo": profile_photo_url,
            **profile_data,
        })

    def patch(self, request):
        user = request.user

        if user.role == User.Role.WORKER:
            profile, _ = WorkerProfile.objects.get_or_create(
                user=user
            )
        else:
            profile, _ = CustomerProfile.objects.get_or_create(
                user=user
            )

        username = request.data.get(
            "username", user.username
        ).strip()

        email = request.data.get(
            "email", user.email
        ).strip()

        if not username:
            raise ValidationError({
                "username": "Username is required."
            })

        if User.objects.exclude(pk=user.pk).filter(
            username=username
        ).exists():
            raise ValidationError({
                "username": "This username is already taken."
            })

        if email and User.objects.exclude(pk=user.pk).filter(
            email__iexact=email
        ).exists():
            raise ValidationError({
                "email": "This email is already in use."
            })

        user.username = username
        user.email = email
        user.save(update_fields=["username", "email"])

        # Profile photo
        if "profile_photo" in request.FILES:
            profile.profile_photo = request.FILES["profile_photo"]

        # Customer profile fields
        if user.role == User.Role.CUSTOMER:
            if "about" in request.data:
                profile.about = request.data.get(
                    "about", ""
                ).strip()

        # Worker profile fields
        else:
            if "bio" in request.data:
                profile.bio = request.data.get(
                    "bio", ""
                ).strip()

            if "skills" in request.data:
                profile.skills = request.data.get(
                    "skills", ""
                ).strip()

            if "experience" in request.data:
                try:
                    experience = int(request.data["experience"])
                    if experience < 0:
                        raise ValueError
                    profile.experience = experience
                except (ValueError, TypeError):
                    raise ValidationError({
                        "experience": "Experience must be a non-negative whole number."
                    })

            if "hourly_rate" in request.data:
                value = request.data.get("hourly_rate", "").strip()

                if value == "":
                    profile.hourly_rate = None
                else:
                    try:
                        rate = float(value)
                        if rate < 0:
                            raise ValueError
                        profile.hourly_rate = rate
                    except (ValueError, TypeError):
                        raise ValidationError({
                            "hourly_rate": "Enter a valid non-negative hourly rate."
                        })

        profile.save()

        return self.get(request)

class VerifyPhoneView(generics.GenericAPIView):

    serializer_class = VerifyPhoneSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        phone_number = (
            serializer.validated_data[
                "phone_number"
            ]
            .strip()
        )

        otp = serializer.validated_data[
            "otp"
        ]

        # Normalize phone number
        if phone_number.startswith("+91"):
            number = phone_number[3:]
        else:
            number = phone_number

        number = (
            number
            .replace(" ", "")
            .replace("-", "")
        )

        if (
            not number.isdigit()
            or len(number) != 10
        ):
            raise ValidationError(
                "Enter a valid 10-digit Indian mobile number."
            )

        normalized_phone = "+91" + number

        user = User.objects.filter(
            phone_number=normalized_phone
        ).first()

        if user is None:
            raise ValidationError(
                "Invalid OTP."
            )

        if user.phone_verified:
            return Response({
                "message":
                    "Phone number is already verified."
            })

        otp_record = (
            PhoneVerificationOTP.objects
            .select_for_update()
            .filter(
                user=user,
                is_used=False
            )
            .order_by("-created_at")
            .first()
        )

        if otp_record is None:
            raise ValidationError(
                "Invalid or expired OTP."
            )

        # Check expiration
        if otp_record.expires_at < timezone.now():

            otp_record.is_used = True

            otp_record.save(
                update_fields=["is_used"]
            )

            raise ValidationError(
                "OTP has expired."
            )

        # Check maximum attempts
        if otp_record.attempts >= OTP_MAX_ATTEMPTS:

            otp_record.is_used = True

            otp_record.save(
                update_fields=["is_used"]
            )

            raise ValidationError(
                "Too many OTP attempts. Request a new OTP."
            )

        # Count this attempt
        otp_record.attempts += 1

        # Verify OTP
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

        # OTP verified
        otp_record.is_used = True

        otp_record.save(
            update_fields=[
                "attempts",
                "is_used"
            ]
        )

        # Verify phone
        user.phone_verified = True

        user.save(
            update_fields=[
                "phone_verified"
            ]
        )

        return Response({
            "message":
                "Phone number verified successfully."
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
    

class ResendPhoneOTPView(generics.GenericAPIView):


    permission_classes = [AllowAny]

    def post(self, request):

        phone_number = (
            request.data.get("phone_number", "")
            .strip()
        )

        if phone_number.startswith("+91"):
            number = phone_number[3:]
        else:
            number = phone_number

        number = (
            number
            .replace(" ", "")
            .replace("-", "")
        )

        if (
            not number.isdigit()
            or len(number) != 10
        ):
            raise ValidationError(
                "Enter a valid 10-digit Indian mobile number."
            )

        normalized_phone = "+91" + number

        user = User.objects.filter(
            phone_number=normalized_phone
        ).first()

        # Do not reveal account existence.
        generic_response = Response({
            "message": (
                "If the account exists and is "
                "not verified, a new OTP has been sent."
            )
        })

        if user is None:
            return generic_response

        if user.phone_verified:
            return generic_response

        cache_key = (
            f"phone_verification_otp:{user.id}"
        )

        # 60-second cooldown
        if cache.get(cache_key):
            return generic_response

        otp = generate_otp()

        PhoneVerificationOTP.objects.filter(
            user=user,
            is_used=False
        ).update(
            is_used=True
        )

        PhoneVerificationOTP.objects.create(
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



class ResendPasswordResetOTPView(
    generics.GenericAPIView
):

    serializer_class = ForgotPasswordSerializer

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        identifier = (
            serializer.validated_data[
                "identifier"
            ].strip()
        )

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
                phone_number="+91" +
                normalized_phone
            ).first()

        generic_response = Response({
            "message": (
                "If an account exists with this information, "
                "a new OTP has been sent."
            )
        })

        if user is None:
            return generic_response

        if (
            not user.phone_number
            or not user.phone_verified
        ):
            return generic_response

        cache_key = (
            f"password_reset_otp:{user.id}"
        )

        if cache.get(cache_key):
            return generic_response

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
    
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")
        confirm_password = request.data.get("confirm_password", "")

        if not all([
            current_password,
            new_password,
            confirm_password,
        ]):
            raise ValidationError({
                "detail": "All password fields are required."
            })

        user = request.user

        if not user.check_password(current_password):
            raise ValidationError({
                "current_password": "Your current password is incorrect."
            })

        if new_password != confirm_password:
            raise ValidationError({
                "confirm_password": "The new passwords do not match."
            })

        if current_password == new_password:
            raise ValidationError({
                "new_password": "Your new password must be different from your current password."
            })

        validate_password(new_password, user=user)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({
            "message": "Password changed successfully."
        }, status=status.HTTP_200_OK)
