from django.contrib import admin
from .models import Work
from .models import Work, WorkPhoto

@admin.register(Work)
class WorkAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "customer",
        "category",
        "budget",
        "work_date",
        "status",
        "created_at",
    )

    list_filter = (
        "category",
        "status",
    )

    search_fields = (
        "title",
        "description",
        "location",
    )

@admin.register(WorkPhoto)
class WorkPhotoAdmin(admin.ModelAdmin):

    list_display = (
        "work",
        "uploaded_at",
    )