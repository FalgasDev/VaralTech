const BASE = '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('vt_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) throw new Error(data.error || 'Erro na requisição')
  return data
}

export const api = {
  register: (data) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/login', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data) => request('/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/me'),

  products: () => request('/products'),
  product: (id) => request(`/products/${id}`),

  // Admin
  adminStats: () => request('/admin/stats'),
  adminUsers: () => request('/admin/users'),
  makeAdmin: (id) => request(`/admin/users/${id}/make-admin`, { method: 'POST' }),
  removeAdmin: (id) => request(`/admin/users/${id}/remove-admin`, { method: 'POST' }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  adminProducts: () => request('/admin/products'),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
}
