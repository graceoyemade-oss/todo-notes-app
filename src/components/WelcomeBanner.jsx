import { useEffect, useState } from 'react'

const DEFAULT_MESSAGE = 'Welcome! 👋'

export default function WelcomeBanner() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    fetch('/api/settings/welcome_message')
      .then((r) => r.json())
      .then((data) => setMessage(data.message || DEFAULT_MESSAGE))
      .catch(() => {})
  }, [])

  function startEdit() {
    setDraft(message === DEFAULT_MESSAGE ? '' : message)
    setEditing(true)
  }

  async function save() {
    const msg = draft.trim() || DEFAULT_MESSAGE
    try {
      await fetch('/api/settings/welcome_message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      setMessage(msg)
      setEditing(false)
    } catch (e) {
      alert('Failed to save: ' + e.message)
    }
  }

  return (
    <div className="welcome-banner">
      {editing ? (
        <div className="welcome-edit">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your welcome message…"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
          <div className="welcome-actions">
            <button onClick={save}>Save</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="welcome-display" onClick={startEdit} title="Click to edit">
          <span className="welcome-text">{message}</span>
          <span className="welcome-hint">✏️</span>
        </div>
      )}
    </div>
  )
}
