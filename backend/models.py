from pydantic import BaseModel


class TodoCreate(BaseModel):
    text: str
    due_date: str | None = None


class TodoUpdate(BaseModel):
    text: str | None = None
    completed: bool | None = None
    due_date: str | None = None


class NoteCreate(BaseModel):
    title: str = ""
    content: str = ""


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
