from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('accounts.urls')),
    path('api/auth/', include('accounts.urls')),
    path('attendance/', include('attendance.urls')),
    path('api/attendance/', include('attendance.urls')),
]