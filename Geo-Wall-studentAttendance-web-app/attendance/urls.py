from django.urls import path
from .views import (
    AttendanceHistoryView,
    RequestQRView,
    ScanView,
    SessionCreateView,
    SessionJoinView,
    SessionListView,
    SessionEndView,
    SessionAttendeesView,
    SessionAnalyticsView,
    AnnouncementListCreateView,
)

urlpatterns = [
    path('request-qr/', RequestQRView.as_view(), name='request-qr'),
    path('scan/', ScanView.as_view(), name='scan'),
    path('sessions/create/', SessionCreateView.as_view(), name='create-session'),
    path('sessions/', SessionListView.as_view(), name='session-list'),
    path('sessions/join/', SessionJoinView.as_view(), name='join-session'),
    path('sessions/<int:session_id>/end/', SessionEndView.as_view(), name='end-session'),
    path('sessions/<int:session_id>/attendees/', SessionAttendeesView.as_view(), name='session-attendees'),
    path('sessions/<int:session_id>/analytics/', SessionAnalyticsView.as_view(), name='session-analytics'),
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcements'),
    path('history/', AttendanceHistoryView.as_view(), name='history'),
]