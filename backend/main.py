from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db, get_db
from backend.models import TodoCreate, TodoUpdate, NoteCreate, NoteUpdate, OrderCreate
from backend.email_service import send_order_confirmation
from backend.auth import router as auth_router

app = FastAPI(title="Bookshop API")
app.include_router(auth_router)

# Allow the React dev server (Vite) and deployed frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://*.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ── Product endpoints ───────────────────────────────────────────

@app.get("/api/products")
def list_products(category: str | None = None):
    db = get_db()
    cur = db.cursor()
    if category:
        cur.execute(
            "SELECT * FROM products WHERE category = %s ORDER BY id", (category,)
        )
    else:
        cur.execute("SELECT * FROM products ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    db.close()
    return [dict(r) for r in rows]


# ── Order endpoints ─────────────────────────────────────────────

@app.post("/api/orders", status_code=201)
def create_order(body: OrderCreate):
    if not body.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    db = get_db()
    cur = db.cursor()

    # Calculate total from the database prices (never trust the client)
    total = 0.0
    order_items_data = []
    for item in body.items:
        cur.execute("SELECT * FROM products WHERE id = %s", (item.product_id,))
        product = cur.fetchone()
        if not product:
            cur.close()
            db.close()
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if item.quantity < 1:
            cur.close()
            db.close()
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")
        total += product["price"] * item.quantity
        order_items_data.append({
            "emoji": product["emoji"],
            "title": product["title"],
            "price": product["price"],
            "quantity": item.quantity,
        })

    # Create the order
    cur.execute(
        "INSERT INTO orders (customer_name, email, phone, address, city, zip, shipping_method, subtotal, shipping_cost, tax, total) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (body.customer_name.strip(), body.email.strip(), body.phone.strip(), body.address.strip(), body.city.strip(), body.zip.strip(), body.shipping_method, body.subtotal, body.shipping_cost, body.tax, total),
    )
    order_id = cur.fetchone()["id"]

    # Add order items
    for item in body.items:
        cur.execute("SELECT price FROM products WHERE id = %s", (item.product_id,))
        product = cur.fetchone()
        cur.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
            (order_id, item.product_id, item.quantity, product["price"]),
        )

    db.commit()
    cur.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
    order = cur.fetchone()
    cur.close()
    db.close()

    # Send confirmation email
    send_order_confirmation(
        to_email=body.email.strip(),
        customer_name=body.customer_name.strip(),
        order_id=order_id,
        order_details={
            "items": order_items_data,
            "subtotal": body.subtotal,
            "shipping_cost": body.shipping_cost,
            "tax": body.tax,
            "total": total,
            "address": body.address.strip(),
            "city": body.city.strip(),
            "zip": body.zip.strip(),
        },
    )

    return dict(order)
