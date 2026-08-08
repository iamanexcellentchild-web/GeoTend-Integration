from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Session


class SessionApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = get_user_model().objects.create_user(
            username='teacher',
            email='teacher@unilag.edu.ng',
            password='secret123',
            role='teacher',
        )

    def test_teacher_can_create_session(self):
        self.client.force_authenticate(self.teacher)

        response = self.client.post(
            '/attendance/sessions/create/',
            {
                'course_code': 'CPE102',
                'course_title': 'Computer Engineering Lab',
                'latitude': 6.5244,
                'longitude': 3.3792,
                'radius_m': 50,
                'code': 'ABC123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Session.objects.filter(code='ABC123').exists())
