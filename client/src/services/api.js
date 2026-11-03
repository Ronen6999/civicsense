const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const TOKEN_KEY = 'civicsense.adminToken';

// sessionStorage clears when the tab closes. See README for the trade-offs of this choice.
export const authStorage = {
  get() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  constructor(message, { status = 0, details, network = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.network = network;
  }
}

// Set by AuthContext so an expired session logs the admin out from anywhere.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = {};
  let payload;

  if (body instanceof FormData) {
    payload = body; // the browser sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = authStorage.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Network error', { network: true });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    if (response.status === 401 && auth && onUnauthorized) onUnauthorized();
    throw new ApiError(data?.error?.message || `Request failed (${response.status})`, {
      status: response.status,
      details: data?.error?.details,
    });
  }
  return data;
}

const qs = (params) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const publicApi = {
  getConfig: (signal) => request('/config', { signal }),
  submitComplaint: (formData) => request('/complaints', { method: 'POST', body: formData }),
  trackComplaint: (complaintId, token) =>
    request('/complaints/track', { method: 'POST', body: { complaintId, token } }),
};

export const adminApi = {
  login: (email, password) => request('/admin/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/admin/auth/me', { auth: true }),
  stats: (signal) => request('/admin/stats', { auth: true, signal }),
  listComplaints: (params, signal) => request(`/admin/complaints${qs(params)}`, { auth: true, signal }),
  getComplaint: (id, signal) => request(`/admin/complaints/${encodeURIComponent(id)}`, { auth: true, signal }),
  updateStatus: (id, status) =>
    request(`/admin/complaints/${encodeURIComponent(id)}/status`, { method: 'PATCH', auth: true, body: { status } }),
  addNote: (id, text) =>
    request(`/admin/complaints/${encodeURIComponent(id)}/notes`, { method: 'POST', auth: true, body: { text } }),
  updateTriage: (id, fields) =>
    request(`/admin/complaints/${encodeURIComponent(id)}`, { method: 'PATCH', auth: true, body: fields }),
};
