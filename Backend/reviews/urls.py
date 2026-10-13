from django.urls import path

from .views import CreateReviewView , WorkerReviewListView ,MyReviewsView


urlpatterns = [

    path(
        "work/<int:work_id>/",
        CreateReviewView.as_view(),
        name="create-review"
    ),

    path(
    "worker/<int:worker_id>/",
    WorkerReviewListView.as_view(),
    name="worker-reviews"
    ),

    path(
        "my-reviews/",
        MyReviewsView.as_view(),
        name="my-reviews"
    ),

]