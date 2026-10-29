
from django.conf import settings
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .cookie_authentication import enforce_csrf
from .throttles import LoginRateThrottle, TokenRefreshRateThrottle


def set_auth_cookies(response, access_token, refresh_token=None):
    """Set JWTs in cookies that JavaScript cannot read."""
    common = {
        "httponly": True,
        "secure": settings.JWT_COOKIE_SECURE,
        "samesite": settings.JWT_COOKIE_SAMESITE,
        "path": settings.JWT_COOKIE_PATH,
    }

    response.set_cookie(
        settings.JWT_ACCESS_COOKIE,
        access_token,
        max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        **common,
    )

    if refresh_token:
        response.set_cookie(
            settings.JWT_REFRESH_COOKIE,
            refresh_token,
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
            **common,
        )

    return response


def clear_auth_cookies(response):
    response.delete_cookie(
        settings.JWT_ACCESS_COOKIE,
        path=settings.JWT_COOKIE_PATH,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        settings.JWT_REFRESH_COOKIE,
        path=settings.JWT_COOKIE_PATH,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )
    return response


# Use a normal Django view so CSRF middleware can set the cookie.
@ensure_csrf_cookie
def csrf_cookie_view(request):
    return JsonResponse({"detail": "CSRF cookie set."})


class CookieLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        enforce_csrf(request)

        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tokens = serializer.validated_data
        response = Response(
            {"message": "Login successful."},
            status=status.HTTP_200_OK,
        )

        return set_auth_cookies(
            response,
            access_token=tokens["access"],
            refresh_token=tokens["refresh"],
        )


class CookieRefreshView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [TokenRefreshRateThrottle]

    def post(self, request):
        enforce_csrf(request)

        raw_refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if not raw_refresh:
            raise ValidationError({"detail": "Refresh cookie is missing. Please log in again."})

        try:
            refresh = RefreshToken(raw_refresh)
            access = str(refresh.access_token)
        except TokenError as exc:
            response = Response(
                {"detail": "Refresh token is invalid or expired. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            return clear_auth_cookies(response)

        response = Response({"message": "Session refreshed."})
        return set_auth_cookies(response, access_token=access)


class CookieLogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        enforce_csrf(request)

        raw_refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass

        response = Response({"message": "Logged out successfully."})
        return clear_auth_cookies(response)



class CookieSessionStatusView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        raw_refresh = request.COOKIES.get(
            settings.JWT_REFRESH_COOKIE
        )

        if not raw_refresh:
            return Response({"has_session": False})

        try:
            RefreshToken(raw_refresh)
        except TokenError:
            response = Response({"has_session": False})
            return clear_auth_cookies(response)

        return Response({"has_session": True})
