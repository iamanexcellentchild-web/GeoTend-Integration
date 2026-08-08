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
      const message = typeof payload === 'string' ? payload : payload?.detail || payload?.message || 'Request failed';
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

export async function verifyEmail() {
  return requestJson(buildUrl('/api/auth/verify-email/'), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
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
