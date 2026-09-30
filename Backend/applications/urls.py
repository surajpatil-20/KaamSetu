from django.urls import path

from .views import ApplicationCreateView ,WorkApplicationsView ,SelectWorkerView


urlpatterns = [

    path(
        "<int:work_id>/",
        ApplicationCreateView.as_view(),
        name="application-create"
    ),
    path(
        "work/<int:work_id>/",
        WorkApplicationsView.as_view(),
        name="work-applications"
    ),

    path(
    "<int:pk>/select/",
    SelectWorkerView.as_view(),
    name="select-worker"
),

]