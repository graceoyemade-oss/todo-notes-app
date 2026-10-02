const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed (${res.status})`)
  }
  if (res.status === 204) return null
  return res.json()
}

// Products
export const getProducts = (category) =>
  request(category ? `/products?category=${category}` : '/products')

// Orders
export const createOrder = (orderData) =>
  request('/orders', { method: 'POST', body: JSON.stringify(orderData) })
