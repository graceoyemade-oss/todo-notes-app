from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, get_db
from models import TodoCreate, TodoUpdate, NoteCreate, NoteUpdate

app = FastAPI(title="Todo & Notes API")

# Allow the React dev server (Vite) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ── Todo endpoints ──────────────────────────────────────────────

@app.get("/api/todos")
def list_todos():
    db = get_db()
    rows = db.execute(
        "SELECT id, text, completed, position FROM todos ORDER BY position, id"
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.post("/api/todos", status_code=201)
def create_todo(body: TodoCreate):
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    db = get_db()
    max_pos = db.execute("SELECT COALESCE(MAX(position), -1) AS m FROM todos").fetchone()["m"]
    cur = db.execute(
        "INSERT INTO todos (text, position) VALUES (?, ?)", (text, max_pos + 1)
    )
    db.commit()
    todo = db.execute(
        "SELECT id, text, completed, position FROM todos WHERE id = ?", (cur.lastrowid,)
    ).fetchone()
    db.close()
    return dict(todo)


@app.patch("/api/todos/{todo_id}")
def update_todo(todo_id: int, body: TodoUpdate):
    db = get_db()
    todo = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if not todo:
        db.close()
        raise HTTPException(status_code=404, detail="Todo not found")

    text = body.text.strip() if body.text is not None else todo["text"]
    completed = body.completed if body.completed is not None else bool(todo["completed"])

    db.execute(
        "UPDATE todos SET text = ?, completed = ? WHERE id = ?",
        (text, int(completed), todo_id),
    )
    db.commit()
    updated = db.execute(
        "SELECT id, text, completed, position FROM todos WHERE id = ?", (todo_id,)
    ).fetchone()
    db.close()
    return dict(updated)


@app.delete("/api/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    db = get_db()
    db.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    db.commit()
    # Re-pack positions so they stay 0,1,2,...
    rows = db.execute("SELECT id FROM todos ORDER BY position, id").fetchall()
    for i, row in enumerate(rows):
        db.execute("UPDATE todos SET position = ? WHERE id = ?", (i, row["id"]))
    db.commit()
    db.close()


@app.post("/api/todos/{todo_id}/move")
def move_todo(todo_id: int, direction: str):
    """Move a todo up or down by swapping positions with its neighbour."""
    if direction not in ("up", "down"):
        raise HTTPException(status_code=400, detail="Direction must be 'up' or 'down'")

    db = get_db()
    todo = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if not todo:
        db.close()
        raise HTTPException(status_code=404, detail="Todo not found")

    pos = todo["position"]
    if direction == "up":
        neighbour = db.execute(
            "SELECT * FROM todos WHERE position < ? ORDER BY position DESC LIMIT 1", (pos,)
        ).fetchone()
    else:
        neighbour = db.execute(
            "SELECT * FROM todos WHERE position > ? ORDER BY position ASC LIMIT 1", (pos,)
        ).fetchone()

    if neighbour:
        db.execute("UPDATE todos SET position = ? WHERE id = ?", (neighbour["position"], todo_id))
        db.execute("UPDATE todos SET position = ? WHERE id = ?", (pos, neighbour["id"]))
        db.commit()

    rows = db.execute(
        "SELECT id, text, completed, position FROM todos ORDER BY position, id"
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


# ── Note endpoints ──────────────────────────────────────────────

@app.get("/api/notes")
def list_notes():
    db = get_db()
    rows = db.execute(
        "SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC"
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.post("/api/notes", status_code=201)
def create_note(body: NoteCreate):
    db = get_db()
    cur = db.execute(
        "INSERT INTO notes (title, content) VALUES (?, ?)",
        (body.title.strip(), body.content),
    )
    db.commit()
    note = db.execute("SELECT * FROM notes WHERE id = ?", (cur.lastrowid,)).fetchone()
    db.close()
    return dict(note)


@app.patch("/api/notes/{note_id}")
def update_note(note_id: int, body: NoteUpdate):
    db = get_db()
    note = db.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
    if not note:
        db.close()
        raise HTTPException(status_code=404, detail="Note not found")

    title = body.title.strip() if body.title is not None else note["title"]
    content = body.content if body.content is not None else note["content"]

    db.execute(
        "UPDATE notes SET title = ?, content = ? WHERE id = ?",
        (title, content, note_id),
    )
    db.commit()
    updated = db.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()
    db.close()
    return dict(updated)


@app.delete("/api/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    db = get_db()
    db.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    db.commit()
    db.close()


# ── Settings endpoints ───────────────────────────────────────────

@app.get("/api/settings/welcome_message")
def get_welcome_message():
    db = get_db()
    row = db.execute(
        "SELECT value FROM settings WHERE key = 'welcome_message'"
    ).fetchone()
    db.close()
    return {"message": row["value"] if row else "Welcome! 👋"}


@app.put("/api/settings/welcome_message")
def update_welcome_message(body: dict):
    message = body.get("message", "").strip()
    db = get_db()
    db.execute(
        """INSERT INTO settings (key, value) VALUES ('welcome_message', ?)
           ON CONFLICT(key) DO UPDATE SET value = ?""",
        (message, message),
    )
    db.commit()
    db.close()
    return {"message": message}
