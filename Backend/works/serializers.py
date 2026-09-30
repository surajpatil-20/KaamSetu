from rest_framework import serializers

from .models import Work, WorkPhoto


class WorkPhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkPhoto
        fields = [
            "id",
            "image",
            "uploaded_at",
        ]

        read_only_fields = [
            "id",
            "uploaded_at",
        ]


class WorkSerializer(serializers.ModelSerializer):

    customer = serializers.ReadOnlyField(
        source="customer.username"
    )

    selected_worker = serializers.ReadOnlyField(
        source="selected_worker.username"
    )

    photos = WorkPhotoSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Work

        fields = [
            "id",
            "customer",
            "selected_worker",
            "title",
            "description",
            "category",
            "budget",
            "location",
            "work_date",
            "status",
            "photos",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "selected_worker",
            "status",
            "photos",
            "created_at",
            "updated_at",
        ]