import { useEffect, useState } from 'react'
import { getTodos, createTodo, updateTodo, deleteTodo, moveTodo } from '../api'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [newText, setNewText] = useState('')
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
      await createTodo(text)
      setNewText('')
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
        <button type="submit">Add</button>
      </form>

      {todos.length === 0 ? (
        <p className="empty">No todos yet — add one above!</p>
      ) : (
        <ul className="todos">
          {todos.map((todo, i) => (
            <li key={todo.id} className={todo.completed ? 'todo completed' : 'todo'}>
              <input
                type="checkbox"
                checked={!!todo.completed}
                onChange={() => handleToggle(todo)}
              />
              <span className="todo-text">{todo.text}</span>
              <div className="todo-actions">
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
          ))}
        </ul>
      )}
    </div>
  )
}
