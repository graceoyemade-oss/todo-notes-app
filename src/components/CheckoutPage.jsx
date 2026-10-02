import { useState } from 'react'
import { useCart } from '../context/CartContext'

// Checkout page — customer fills in details and places the order
export default function CheckoutPage({ onNavigate }) {
  const { cartItems, totalPrice, clearCart } = useCart()

  // Form state — stores what the customer types
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  })

  // Track whether the order has been placed
  const [orderPlaced, setOrderPlaced] = useState(false)

  // Update form fields when the user types
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault() // Prevent page reload
    // In a real app, you would send this data to a payment processor
    // and backend server here. For now, we just show a confirmation.
    setOrderPlaced(true)
    clearCart() // Empty the cart after ordering
  }

  // If cart is empty and no order was placed, redirect to shop
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <p>Your cart is empty. Add some products before checking out.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('shop')}>
            Go to Shop
          </button>
        </div>
      </div>
    )
  }

  // Show order confirmation after successful submission
  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-confirmation">
          <div className="confirmation-icon">✅</div>
          <h2>Order Placed Successfully!</h2>
          <p>
            Thank you, <strong>{form.name}</strong>! Your order has been received.
          </p>
          <p>
            A confirmation email will be sent to <strong>{form.email}</strong>.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('shop')}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <h2 className="page-title">Checkout</h2>

      <div className="checkout-layout">
        {/* Order summary on the left */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item.id} className="summary-item">
              <span>
                {item.image} {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
        </div>

        {/* Checkout form on the right */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Shipping Details</h3>

          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="(555) 123-4567"
            />
          </label>

          <label>
            Address
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="123 Main Street"
            />
          </label>

          <div className="form-row">
            <label>
              City
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="New York"
              />
            </label>
            <label>
              ZIP Code
              <input
                type="text"
                name="zip"
                value={form.zip}
                onChange={handleChange}
                required
                placeholder="10001"
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            Place Order — ${totalPrice.toFixed(2)}
          </button>
        </form>
      </div>
    </div>
  )
}
