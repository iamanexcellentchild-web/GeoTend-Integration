from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


class EmailLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username='verifyuser',
            email='verifyuser@unilag.edu.ng',
            password='secret123',
            role='student',
        )

    def test_login_with_email_returns_tokens(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'verifyuser@unilag.edu.ng',
            'password': 'secret123',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.json())
        self.assertIn('refresh', response.json())
