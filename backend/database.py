import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()


def get_db():
    """Create a new PostgreSQL connection using the Supabase connection string."""
    db_url = os.environ.get("SUPABASE_DB_URL")
    if not db_url:
        raise RuntimeError(
            "SUPABASE_DB_URL environment variable is not set. "
            "Add it to a .env file in the project root."
        )
    conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
    return conn


def init_db():
    """Create tables and seed initial data if the database is empty."""
    conn = get_db()
    conn.autocommit = True
    cur = conn.cursor()

    # Create tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL DEFAULT '',
            description TEXT NOT NULL DEFAULT '',
            price DOUBLE PRECISION NOT NULL,
            category TEXT NOT NULL DEFAULT 'children',
            emoji TEXT NOT NULL DEFAULT '📖',
            bg_color TEXT NOT NULL DEFAULT '#e8f4fd',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            customer_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL DEFAULT '',
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            zip TEXT NOT NULL DEFAULT '',
            shipping_method TEXT NOT NULL DEFAULT 'standard',
            subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
            shipping_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
            tax DOUBLE PRECISION NOT NULL DEFAULT 0,
            total DOUBLE PRECISION NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id),
            quantity INTEGER NOT NULL,
            price DOUBLE PRECISION NOT NULL
        );
    """)

    # Seed products if the table is empty
    cur.execute("SELECT COUNT(*) AS c FROM products")
    count = cur.fetchone()["c"]
    if count == 0:
        books = [
            ("The Little Engine That Could", "Watty Piper", "A classic tale about a small train engine who believes in himself and never gives up, teaching children the power of optimism and hard work.", 12.99, "children", "🚂", "#fff3e0"),
            ("Oh, the Places You'll Go!", "Dr. Seuss", "A joyful and inspiring book about life's journey, encouraging kids to embrace adventure and overcome obstacles with confidence.", 14.99, "children", "🎈", "#e8f5e9"),
            ("The Giving Tree", "Shel Silverstein", "A touching story about selfless love and generosity, perfect for teaching children about kindness and gratitude.", 11.99, "children", "🌳", "#e0f2f1"),
            ("Matilda", "Roald Dahl", "A brilliant and brave girl who loves books and stands up to bullies, inspiring children to be curious, kind, and courageous.", 13.99, "children", "📚", "#fce4ec"),
            ("Wonder", "R.J. Palacio", "A heartwarming story about a boy with facial differences who teaches everyone around him about acceptance, empathy, and kindness.", 15.99, "teens", "⭐", "#e3f2fd"),
            ("The Alchemist", "Paulo Coelho", "A magical fable about following your dreams, perfect for teens discovering their purpose and the courage to pursue it.", 16.99, "teens", "✨", "#f3e5f5"),
            ("The 7 Habits of Highly Effective Teens", "Sean Covey", "A practical guide that helps teens build confidence, set goals, make good decisions, and take charge of their lives.", 17.99, "teens", "🎯", "#fff8e1"),
            ("I Am Malala", "Malala Yousafzai", "The inspiring true story of a girl who stood up for education and changed the world, showing teens the power of one voice.", 18.99, "teens", "🕊️", "#e8eaf6"),
            ("The Very Hungry Caterpillar", "Eric Carle", "A beautifully illustrated story about growth and transformation, beloved by children for generations.", 9.99, "children", "🐛", "#e8f5e9"),
            ("Where the Wild Things Are", "Maurice Sendak", "A wild and imaginative adventure that celebrates creativity, emotions, and the comfort of home.", 12.99, "children", "🐾", "#fff3e0"),
            ("The Hunger Games", "Suzanne Collins", "A gripping dystopian novel about courage, survival, and standing up for what's right — a teen favorite.", 16.99, "teens", "🏹", "#ffebee"),
            ("Atomic Habits (Teen Edition)", "James Clear", "A fun, easy-to-follow guide that helps teens build good habits, break bad ones, and become the best version of themselves.", 19.99, "teens", "⚡", "#e0f7fa"),
        ]
        cur.executemany(
            "INSERT INTO products (title, author, description, price, category, emoji, bg_color) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            books,
        )

    cur.close()
    conn.close()
