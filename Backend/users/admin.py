from django.contrib import admin

# Register your models here.
from .models import User , CustomerProfile, WorkerProfile


admin.site.register(User)
admin.site.register(CustomerProfile)
admin.site.register(WorkerProfile)