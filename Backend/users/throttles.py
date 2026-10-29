
from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class RegisterRateThrottle(AnonRateThrottle):
    scope = "register"


class PasswordResetRateThrottle(AnonRateThrottle):
    scope = "password_reset"


class OTPVerifyRateThrottle(AnonRateThrottle):
    scope = "otp_verify"


class OTPResendRateThrottle(AnonRateThrottle):
    scope = "otp_resend"


class PhoneVerifyRateThrottle(AnonRateThrottle):
    scope = "phone_verify"


class TokenRefreshRateThrottle(AnonRateThrottle):
    scope = "token_refresh"
