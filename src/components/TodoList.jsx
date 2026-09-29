import { useEffect, useState } from 'react'
import { getTodos, createTodo, updateTodo, deleteTodo, moveTodo } from '../api'

function formatDate(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  return due < today
}

function isDueToday(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  return due.getTime() === today.getTime()
}

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodos()
  }, [])

  async function loadTodos() {
    try {
      const data = await getTodos()
      setTodos(data)
    } catch (e) {
      alert('Failed to load todos: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    const text = newText.trim()
    if (!text) return
    try {
      await createTodo(text, newDueDate || null)
      setNewText('')
      setNewDueDate('')
      await loadTodos()
    } catch (e) {
      alert('Failed to add todo: ' + e.message)
    }
  }

  async function handleToggle(todo) {
    try {
      await updateTodo(todo.id, { completed: !todo.completed })
      await loadTodos()
    } catch (e) {
      alert('Failed to update: ' + e.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTodo(id)
      await loadTodos()
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  async function handleMove(id, direction) {
    try {
      const updated = await moveTodo(id, direction)
      setTodos(updated)
    } catch (e) {
      alert('Failed to move: ' + e.message)
    }
  }

  async function handleDateChange(id, newDate) {
    try {
      await updateTodo(id, { due_date: newDate || null })
      await loadTodos()
    } catch (e) {
      alert('Failed to update date: ' + e.message)
    }
  }

  if (loading) return <p className="loading">Loading…</p>

  return (
    <div className="todo-list">
      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <div className="add-form-row">
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            title="Due date (optional)"
          />
          <button type="submit">Add</button>
        </div>
      </form>

      {todos.length === 0 ? (
        <p className="empty">No todos yet — add one above!</p>
      ) : (
        <ul className="todos">
          {todos.map((todo, i) => {
            const overdue = !todo.completed && isOverdue(todo.due_date)
            const dueToday = !todo.completed && isDueToday(todo.due_date)
            return (
              <li
                key={todo.id}
                className={
                  todo.completed
                    ? 'todo completed'
                    : overdue
                      ? 'todo overdue'
                      : dueToday
                        ? 'todo due-today'
                        : 'todo'
                }
              >
                <input
                  type="checkbox"
                  checked={!!todo.completed}
                  onChange={() => handleToggle(todo)}
                />
                <div className="todo-content">
                  <span className="todo-text">{todo.text}</span>
                  {todo.due_date && (
                    <span className="due-date">
                      📅 {formatDate(todo.due_date)}
                      {overdue && <span className="overdue-badge">Overdue!</span>}
                      {dueToday && <span className="today-badge">Today</span>}
                    </span>
                  )}
                </div>
                <div className="todo-actions">
                  <input
                    type="date"
                    value={todo.due_date || ''}
                    onChange={(e) => handleDateChange(todo.id, e.target.value)}
                    title="Change due date"
                    className="date-edit"
                  />
                  <button
                    onClick={() => handleMove(todo.id, 'up')}
                    disabled={i === 0}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMove(todo.id, 'down')}
                    disabled={i === todos.length - 1}
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button onClick={() => handleDelete(todo.id)} title="Delete">
                    ✕
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
