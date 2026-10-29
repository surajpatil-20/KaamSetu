"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path ,include
from rest_framework_simplejwt.views import (
    TokenRefreshView, TokenObtainPairView
)
from django.conf import settings
from django.conf.urls.static import static

from users.cookie_views import (
    CookieLoginView,
    CookieRefreshView,
    CookieLogoutView,
    csrf_cookie_view,
    CookieSessionStatusView
    
)

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/",include('users.urls')),

    path("api/applications/" ,include("applications.urls")),

    path( "api/reviews/", include("reviews.urls")),

    path("api/auth/login/", CookieLoginView.as_view(), name="token_obtain_pair"),

    path("api/auth/refresh/", CookieRefreshView.as_view(), name="token_refresh"),
    
    path("api/auth/logout/", CookieLogoutView.as_view(), name="logout"),
    
    path("api/auth/csrf/", csrf_cookie_view, name="csrf"),
    
    path("api/works/", include("works.urls")),

    path("api/notifications/",include("notifications.urls")),
        
    path("api/auth/session/", CookieSessionStatusView.as_view(), name="session-status",),

]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
