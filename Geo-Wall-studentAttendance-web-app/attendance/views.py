from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone

from .models import Session, AttendanceRecord
from .serializers import (
    CreateSessionSerializer,
    JoinSessionSerializer,
    RequestQRSerializer,
    ScanSerializer,
    SessionSummarySerializer,
)
from .utils import generate_qr_token, verify_qr_token, haversine_distance


class SessionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role not in {'teacher', 'admin'}:
            return Response({"detail": "Teacher access required"}, status=status.HTTP_403_FORBIDDEN)

        serializer = CreateSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        session = Session.objects.create(
            course_code=data['course_code'],
            course_title=data.get('course_title', ''),
            lecturer=request.user,
            latitude=data['latitude'],
            longitude=data['longitude'],
            radius_m=data.get('radius_m', 40),
            code=data['code'],
            status='active',
        )

        return Response(
            {
                "id": session.id,
                "course_code": session.course_code,
                "course_title": session.course_title,
                "code": session.code,
                "status": session.status,
            },
            status=status.HTTP_201_CREATED,
        )


class SessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role in {'teacher', 'admin'}:
            sessions = Session.objects.filter(lecturer=request.user).order_by('-start_time')
        else:
            sessions = Session.objects.filter(status='active').order_by('-start_time')

        serializer = SessionSummarySerializer(sessions, many=True)
        return Response(serializer.data)


class SessionJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'student':
            return Response({"detail": "Student access required"}, status=status.HTTP_403_FORBIDDEN)

        serializer = JoinSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            session = Session.objects.get(code=data['code'], status='active')
        except Session.DoesNotExist:
            return Response({"detail": "Session not found or not active"}, status=status.HTTP_404_NOT_FOUND)

        if data.get('latitude') is not None and data.get('longitude') is not None:
            distance = haversine_distance(
                data['latitude'], data['longitude'], session.latitude, session.longitude
            )
            if distance > session.radius_m:
                return Response({"detail": "Outside geofence"}, status=status.HTTP_403_FORBIDDEN)

        token = generate_qr_token(session.id, request.user.id)
        record, _ = AttendanceRecord.objects.get_or_create(
            session=session,
            student=request.user,
            defaults={'qr_token': token, 'status': 'pending'},
        )
        if not record.qr_token:
            record.qr_token = token
            record.save(update_fields=['qr_token'])

        return Response(
            {
                "detail": "Join successful",
                "session": {
                    "id": session.id,
                    "course_code": session.course_code,
                    "course_title": session.course_title,
                    "code": session.code,
                },
                "qr_token": token,
            }
        )


class AttendanceHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        records = AttendanceRecord.objects.filter(student=request.user).select_related('session').order_by('-created_at')
        payload = []
        for record in records:
            payload.append(
                {
                    "session_code": record.session.code,
                    "course_code": record.session.course_code,
                    "course_title": record.session.course_title,
                    "status": record.status,
                    "used_at": record.used_at.isoformat() if record.used_at else None,
                    "created_at": record.created_at.isoformat(),
                }
            )
        return Response(payload)


class RequestQRView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RequestQRSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            session = Session.objects.get(id=data['session_id'], status='active')
        except Session.DoesNotExist:
            return Response({"detail": "Session not found or not active"}, status=status.HTTP_404_NOT_FOUND)

        distance = haversine_distance(
            data['latitude'], data['longitude'], session.latitude, session.longitude
        )
        if distance > session.radius_m:
            return Response({"detail": "Outside geofence"}, status=status.HTTP_403_FORBIDDEN)

        token = generate_qr_token(session.id, request.user.id)
        return Response({"qr_token": token})


class ScanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = ScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            session_id, student_id = verify_qr_token(data['qr_token'])
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if student_id != request.user.id:
            return Response({"detail": "Token does not belong to this user"}, status=status.HTTP_403_FORBIDDEN)

        session = Session.objects.select_for_update().get(id=session_id)

        record, created = AttendanceRecord.objects.select_for_update().get_or_create(
            session=session, student=request.user,
            defaults={'qr_token': data['qr_token']}
        )

        if record.used:
            return Response({"detail": "QR code already used"}, status=status.HTTP_400_BAD_REQUEST)

        distance = haversine_distance(
            data['latitude'], data['longitude'], session.latitude, session.longitude
        )
        if distance > session.radius_m:
            record.status = 'rejected'
            record.save()
            return Response({"detail": "Outside geofence"}, status=status.HTTP_403_FORBIDDEN)

        record.used = True
        record.used_at = timezone.now()
        record.latitude = data['latitude']
        record.longitude = data['longitude']
        record.distance_m = distance
        record.status = 'present'
        record.save()

        return Response({"detail": "Attendance marked", "status": "present"})