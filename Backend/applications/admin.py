from django.contrib import admin

from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):

    list_display = (
        "work",
        "worker",
        "proposed_price",
        "status",
        "applied_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "worker__username",
        "work__title",
    )