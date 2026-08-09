const API_BASE_URL = '';

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let message = 'Request failed';
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload?.detail) {
        message = payload.detail;
      } else if (payload?.message) {
        message = payload.message;
      } else if (payload && typeof payload === 'object') {
        const firstKey = Object.keys(payload)[0];
        const firstValue = payload[firstKey];
        if (firstKey && firstValue) {
          const text = Array.isArray(firstValue) ? firstValue[0] : firstValue;
          message = `${firstKey}: ${text}`;
        }
      }
      throw new Error(message);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error('Request failed');
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(payload) {
  return requestJson(buildUrl('/api/auth/register/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return requestJson(buildUrl('/api/auth/login/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return requestJson(buildUrl('/api/auth/me/'), {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
}

export async function verifyEmail({ email, code }) {
  return requestJson(buildUrl('/api/auth/verify-email/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
}

export async function resendVerification({ email }) {
  return requestJson(buildUrl('/api/auth/resend-verification/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function createSession(payload) {
  return requestJson(buildUrl('/api/attendance/sessions/create/'), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function listSessions() {
  return requestJson(buildUrl('/api/attendance/sessions/'), {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
}

export async function joinSession(payload) {
  return requestJson(buildUrl('/api/attendance/sessions/join/'), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function requestQrToken(payload) {
  return requestJson(buildUrl('/api/attendance/request-qr/'), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function scanAttendance(payload) {
  return requestJson(buildUrl('/api/attendance/scan/'), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getAttendanceHistory() {
  return requestJson(buildUrl('/api/attendance/history/'), {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
}

export async function endSession(sessionId) {
  return requestJson(buildUrl(`/api/attendance/sessions/${sessionId}/end/`), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
}

export async function getSessionAttendees(sessionId) {
  return requestJson(buildUrl(`/api/attendance/sessions/${sessionId}/attendees/`), {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
}

export async function getSessionAnalytics(sessionId) {
  return requestJson(buildUrl(`/api/attendance/sessions/${sessionId}/analytics/`), {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
}

export async function listAnnouncements(courseCode) {
  const query = courseCode ? `?course_code=${encodeURIComponent(courseCode)}` : '';
  return requestJson(buildUrl(`/api/attendance/announcements/${query}`), {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
}

export async function createAnnouncement(payload) {
  return requestJson(buildUrl('/api/attendance/announcements/'), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
