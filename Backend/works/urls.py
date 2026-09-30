from django.urls import path

from .views import (
    WorkListCreateView,
    WorkDetailView,
    WorkPhotoCreateView,
    StartWorkView,
    SubmitWorkView,
    ApproveWorkView,
    MyWorksView,
    AvailableWorksView,
    ManageWorkView,
)

urlpatterns = [

    # List works / Create work
    path(
        "",
        WorkListCreateView.as_view(),
        name="work-list-create"
    ),

    # Customer's / Worker's own works
    path(
        "my/",
        MyWorksView.as_view(),
        name="my-works"
    ),

    # Available works for workers
    path(
        "available/",
        AvailableWorksView.as_view(),
        name="available-works"
    ),

    # Manage customer's own work
    path(
        "<int:pk>/manage/",
        ManageWorkView.as_view(),
        name="manage-work"
    ),

    # Upload work photo
    path(
        "<int:work_id>/photos/",
        WorkPhotoCreateView.as_view(),
        name="work-photo-create"
    ),

    # Worker starts selected work
    path(
        "<int:pk>/start/",
        StartWorkView.as_view(),
        name="start-work"
    ),

    # Worker submits work
    path(
        "<int:pk>/submit/",
        SubmitWorkView.as_view(),
        name="submit-work"
    ),

    # Customer approves submitted work
    path(
        "<int:pk>/approve/",
        ApproveWorkView.as_view(),
        name="approve-work"
    ),

    # View a single work
    path(
        "<int:pk>/",
        WorkDetailView.as_view(),
        name="work-detail"
    ),
]