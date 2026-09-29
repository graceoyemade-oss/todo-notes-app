import { useEffect, useState } from 'react'
import { getNotes, createNote, updateNote, deleteNote } from '../api'

export default function NotesPanel() {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data)
    } catch (e) {
      alert('Failed to load notes: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    try {
      await createNote(title, content)
      setTitle('')
      setContent('')
      await loadNotes()
    } catch (e) {
      alert('Failed to add note: ' + e.message)
    }
  }

  function startEdit(note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  async function handleSaveEdit(id) {
    try {
      await updateNote(id, { title: editTitle, content: editContent })
      setEditingId(null)
      await loadNotes()
    } catch (e) {
      alert('Failed to save: ' + e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return
    try {
      await deleteNote(id)
      await loadNotes()
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  if (loading) return <p className="loading">Loading…</p>

  return (
    <div className="notes-panel">
      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write your note…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <button type="submit">Add Note</button>
      </form>

      {notes.length === 0 ? (
        <p className="empty">No notes yet — add one above!</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              {editingId === note.id ? (
                <div className="note-edit">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                  />
                  <div className="note-actions">
                    <button onClick={() => handleSaveEdit(note.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3>{note.title || 'Untitled'}</h3>
                  <p>{note.content}</p>
                  <div className="note-actions">
                    <button onClick={() => startEdit(note)}>Edit</button>
                    <button onClick={() => handleDelete(note.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
