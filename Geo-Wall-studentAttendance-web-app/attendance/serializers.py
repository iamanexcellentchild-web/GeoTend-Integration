from rest_framework import serializers
from .models import Session, AttendanceRecord, Announcement


class RequestQRSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class ScanSerializer(serializers.Serializer):
    qr_token = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class CreateSessionSerializer(serializers.Serializer):
    course_code = serializers.CharField(max_length=20)
    course_title = serializers.CharField(max_length=100, allow_blank=True, required=False)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    radius_m = serializers.FloatField(required=False, default=40)
    code = serializers.CharField(max_length=10)


class JoinSessionSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=10)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)


class SessionSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'course_code', 'course_title', 'code', 'latitude', 'longitude', 'radius_m', 'status', 'start_time', 'end_time']


class AttendeeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = ['name', 'status', 'used_at', 'created_at']

    def get_name(self, obj):
        full_name = obj.student.get_full_name()
        return full_name or obj.student.username


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id', 'course_code', 'title', 'body', 'author_name', 'created_at']
        read_only_fields = ['id', 'author_name', 'created_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username


class CreateAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['course_code', 'title', 'body']