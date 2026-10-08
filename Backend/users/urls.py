from django.urls import path

from .views import (
    RegisterView,
    ForgotPasswordView,
    VerifyOTPView,
    ResetPasswordView,
    VerifyPhoneView,
    ProfileView,
    ResendPhoneOTPView,
    ResendPasswordResetOTPView
)

urlpatterns = [
    path( "register/", RegisterView.as_view(), name="register" ),
    path( "profile/", ProfileView.as_view(), name="profile" ),
    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password"
    ),

    path(
        "verify-otp/",
        VerifyOTPView.as_view(),
        name="verify-otp"
    ),

    path(
        "reset-password/",
        ResetPasswordView.as_view(),
        name="reset-password"
    ),
    path(
        "verify-phone/",
        VerifyPhoneView.as_view(),
        name="verify-phone"
    ),
    path(
        "resend-phone-otp/",
        ResendPhoneOTPView.as_view(),
        name="resend-phone-otp"
    ),

    path(
        "resend-password-otp/",
        ResendPasswordResetOTPView.as_view(),
        name="resend-password-otp"
    ),

]