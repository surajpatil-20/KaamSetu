
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.exceptions import AuthenticationFailed

def enforce_csrf(request):
    """
    Enforce CSRF protection for requests authenticated with cookies.
    """
    def dummy_get_response(request):
        return None

    check = CsrfViewMiddleware(dummy_get_response)
    reason = check.process_view(request, None, (), {})
    if reason:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("CSRF verification failed. Please refresh and try again.")



class CookieJWTAuthentication(BaseAuthentication):
    """
    Authenticate using the access JWT stored in an HttpOnly cookie.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get(
            settings.JWT_ACCESS_COOKIE
        )

        # No cookie: allow DRF to continue to permission checks.
        if not raw_token:
            return None

        # A cookie exists, so validate it and enforce CSRF.
        enforce_csrf(request)

        jwt_auth = JWTAuthentication()

        try:
            validated_token = jwt_auth.get_validated_token(
                raw_token
            )
            user = jwt_auth.get_user(validated_token)
            
            if not user.phone_verified:
                raise AuthenticationFailed(
                    "Please verify your phone number before accessing your account."
                )

        except (InvalidToken, TokenError, AuthenticationFailed) as exc:
            raise AuthenticationFailed(
                "Your session is invalid or expired."
            ) from exc

        return user, validated_token

    def authenticate_header(self, request):
        return "Bearer"
