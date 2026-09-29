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

// Todos
export const getTodos = () => request('/todos')
export const createTodo = (text) => request('/todos', { method: 'POST', body: JSON.stringify({ text }) })
export const updateTodo = (id, data) => request(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteTodo = (id) => request(`/todos/${id}`, { method: 'DELETE' })
export const moveTodo = (id, direction) => request(`/todos/${id}/move?direction=${direction}`, { method: 'POST' })

// Notes
export const getNotes = () => request('/notes')
export const createNote = (title, content) => request('/notes', { method: 'POST', body: JSON.stringify({ title, content }) })
export const updateNote = (id, data) => request(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteNote = (id) => request(`/notes/${id}`, { method: 'DELETE' })
