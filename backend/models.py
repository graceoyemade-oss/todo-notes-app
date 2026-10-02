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


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_name: str
    email: str
    phone: str = ""
    address: str
    city: str
    zip: str = ""
    shipping_method: str = "standard"
    subtotal: float = 0.0
    shipping_cost: float = 0.0
    tax: float = 0.0
    total: float = 0.0
    items: list[OrderItemCreate]
