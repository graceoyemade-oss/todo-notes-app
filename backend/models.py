from pydantic import BaseModel


class TodoCreate(BaseModel):
    text: str


class TodoUpdate(BaseModel):
    text: str | None = None
    completed: bool | None = None


class NoteCreate(BaseModel):
    title: str = ""
    content: str = ""


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
