import { useState, useEffect, useCallback } from 'react'
import { getProducts, createOrder } from './api'
import ProductCard from './components/ProductCard'
import Cart from './components/Cart'
import CheckoutForm from './components/CheckoutForm'
import GoogleAuth from './components/GoogleAuth'

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 600)
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    }
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handlePlaceOrder = async (orderData) => {
    const order = await createOrder(orderData)
    setCart([])
    setShowCheckout(false)
    setCartOpen(false)
    return order
  }

  const filteredProducts =
    filter === 'all' ? products : products.filter((p) => p.category === filter)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (showCheckout) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>📚 Myraregemandi Bookstore</h1>
          <p className="tagline">Inspirational books for children & teens</p>
        </header>
        <main>
          <CheckoutForm
            items={cart}
            total={cartTotal}
            onBack={() => setShowCheckout(false)}
            onPlaceOrder={handlePlaceOrder}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>📚 Myraregemandi Bookstore</h1>
            <p className="tagline">Inspirational books for children & teens</p>
          </div>
          <div className="header-actions">
            <GoogleAuth />
            <button className="cart-toggle" onClick={() => setCartOpen(true)}>
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        <nav className="category-filter">
          {['all', 'children', 'teens'].map((cat) => (
            <button
              key={cat}
              className={filter === cat ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All Books' : cat === 'children' ? 'Children' : 'Teens'}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {loading ? (
          <div className="loading">Loading books...</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className={addedId === product.id ? 'just-added' : ''}>
                <ProductCard product={product} onAddToCart={addToCart} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Cart
        items={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setCartOpen(false)
          setShowCheckout(true)
        }}
      />
    </div>
  )
}
