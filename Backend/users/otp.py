import hashlib
import secrets

from datetime import timedelta

from django.conf import settings
from django.utils import timezone


OTP_EXPIRY_MINUTES = 5
OTP_MAX_ATTEMPTS = 5


def generate_otp():

    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp):

    return hashlib.sha256(
        otp.encode()
    ).hexdigest()


def verify_otp_hash(otp, otp_hash):

    return secrets.compare_digest(
        hash_otp(otp),
        otp_hash
    )


def otp_expiry_time():

    return timezone.now() + timedelta(
        minutes=OTP_EXPIRY_MINUTES
    )


def send_otp(user, otp):

    # DEVELOPMENT ONLY
    print(
        f"\n===================================="
        f"\nPASSWORD RESET OTP"
        f"\nUser: {user.username}"
        f"\nPhone: {user.phone_number}"
        f"\nOTP: {otp}"
        f"\nExpires in: {OTP_EXPIRY_MINUTES} minutes"
        f"\n====================================\n"
    )