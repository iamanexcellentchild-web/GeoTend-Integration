from django.urls import path
from .views import (
    AttendanceHistoryView,
    RequestQRView,
    ScanView,
    SessionCreateView,
    SessionJoinView,
    SessionListView,
)

urlpatterns = [
    path('request-qr/', RequestQRView.as_view(), name='request-qr'),
    path('scan/', ScanView.as_view(), name='scan'),
    path('sessions/create/', SessionCreateView.as_view(), name='create-session'),
    path('sessions/', SessionListView.as_view(), name='session-list'),
    path('sessions/join/', SessionJoinView.as_view(), name='join-session'),
    path('history/', AttendanceHistoryView.as_view(), name='history'),
]