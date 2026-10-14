
from rest_framework import serializers

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):

    customer_username = serializers.ReadOnlyField(
        source="customer.username"
    )

    worker_username = serializers.ReadOnlyField(
        source="worker.username"
    )

    work_title = serializers.ReadOnlyField(
        source="work.title"
    )

    class Meta:
        model = Review

        fields = [
            "id",
            "work",
            "work_title",
            "customer",
            "customer_username",
            "worker",
            "worker_username",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "work",
            "work_title",
            "customer",
            "customer_username",
            "worker",
            "worker_username",
            "created_at",
            "updated_at",
        ]

    def validate_rating(self, value):

        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return value
