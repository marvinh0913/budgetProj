/**
 * Client for the BudgetProj API.
 * Stores the login token and attaches it to requests that need it.
 */

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'budgetproj_token';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Token storage ───────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => getToken() !== null;

// ─── Core request helper ─────────────────────────────────────────────────────

const errorMessage = (detail) => {
  if (typeof detail === 'string') return detail;
  // FastAPI validation errors (422) are a list of { msg, loc, ... }
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join('; ');
  return 'Something went wrong. Please try again.';
};

const request = async (path, { method = 'GET', body, auth = false } = {}) => {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getToken();
    if (!token) throw new ApiError(401, 'Please log in');
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection.');
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // An expired or invalid token: forget it so the app shows the login page
    if (response.status === 401 && auth) clearToken();
    throw new ApiError(response.status, errorMessage(data?.detail));
  }
  return data;
};

const withQuery = (path, params = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const register = async (email, password) => {
  const data = await request('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
  setToken(data.access_token);
};

export const login = async (email, password) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(data.access_token);
};

export const logout = () => clearToken();

export const getMe = () => request('/auth/me', { auth: true });

// ─── Profile ─────────────────────────────────────────────────────────────────

/** Returns the profile, or null if the user hasn't created one yet. */
export const getProfile = async () => {
  try {
    return await request('/profile', { auth: true });
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

export const saveProfile = (profile) =>
  request('/profile', { method: 'PUT', body: profile, auth: true });

// ─── Rates and affordability ─────────────────────────────────────────────────

export const getRates = () => request('/rates');

/** options: { mortgage_term_years, auto_term_months, auto_down_payment } */
export const getAffordability = (options) =>
  request(withQuery('/affordability', options), { auth: true });

// ─── Transactions ────────────────────────────────────────────────────────────

/** filters: { start_date, end_date } as 'YYYY-MM-DD' strings */
export const listTransactions = (filters) =>
  request(withQuery('/transactions', filters), { auth: true });

export const createTransaction = (transaction) =>
  request('/transactions', { method: 'POST', body: transaction, auth: true });

export const deleteTransaction = (id) =>
  request(`/transactions/${id}`, { method: 'DELETE', auth: true });

/**
 * Public estimate, no login needed. inputs: { gross_monthly_income,
 * monthly_debt_payments, down_payment_savings, mortgage_term_years?,
 * auto_term_months?, auto_down_payment? }
 */
export const estimateAffordability = (inputs) =>
  request('/affordability/estimate', { method: 'POST', body: inputs });
