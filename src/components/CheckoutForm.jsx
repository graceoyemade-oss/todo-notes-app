import { useState } from 'react'

// Shipping options — bookstore themed
const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Shipping', time: '5-7 business days', cost: 4.99 },
  { id: 'express', label: 'Express Shipping', time: '2-3 business days', cost: 9.99 },
  { id: 'overnight', label: 'Overnight Shipping', time: 'Next business day', cost: 19.99 },
]

const TAX_RATE = 0.08 // 8% tax

export default function CheckoutForm({ items, total, onBack, onPlaceOrder }) {
  const [form, setForm] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    card_number: '',
    card_expiry: '',
    card_cvc: '',
  })
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)

  // Calculate costs
  const shippingCost = SHIPPING_OPTIONS.find((s) => s.id === shippingMethod)?.cost || 0
  const tax = total * TAX_RATE
  const grandTotal = total + shippingCost + tax

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  // Format card number as user types (groups of 4)
  function handleCardNumberChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim()
    setForm({ ...form, card_number: formatted })
    setErrors({ ...errors, card_number: '' })
  }

  // Format expiry as MM/YY
  function handleExpiryChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw
    setForm({ ...form, card_expiry: formatted })
    setErrors({ ...errors, card_expiry: '' })
  }

  // Format CVC (digits only, max 4)
  function handleCvcChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setForm({ ...form, card_cvc: raw })
    setErrors({ ...errors, card_cvc: '' })
  }

  function validate() {
    const errs = {}
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.zip.trim()) errs.zip = 'ZIP code is required'
    if (!form.card_number.trim()) errs.card_number = 'Card number is required'
    else if (form.card_number.replace(/\s/g, '').length < 16) errs.card_number = 'Enter a valid 16-digit card number'
    if (!form.card_expiry.trim()) errs.card_expiry = 'Expiry is required'
    else if (!/^\d{2}\/\d{2}$/.test(form.card_expiry)) errs.card_expiry = 'Use MM/YY format'
    if (!form.card_cvc.trim()) errs.card_cvc = 'CVC is required'
    else if (form.card_cvc.length < 3) errs.card_cvc = 'Enter a valid CVC'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const order = await onPlaceOrder({
        ...form,
        shipping_method: shippingMethod,
        subtotal: total,
        shipping_cost: shippingCost,
        tax,
        total: grandTotal,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      })
      setOrderId(order.id)
      setOrderPlaced(true)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="order-success">
        <div className="order-success-icon">📚</div>
        <h2>Order Placed!</h2>
        <p>Thank you for your purchase, {form.customer_name}!</p>
        <p>Your order <strong>#{orderId}</strong> has been received.</p>
        <p className="order-success-email">A confirmation will be sent to {form.email}</p>
        <div className="order-success-details">
          <div className="success-detail">
            <span>Shipping to:</span>
            <strong>{form.address}, {form.city} {form.zip}</strong>
          </div>
          <div className="success-detail">
            <span>Shipping method:</span>
            <strong>{SHIPPING_OPTIONS.find((s) => s.id === shippingMethod)?.label}</strong>
          </div>
          <div className="success-detail">
            <span>Total charged:</span>
            <strong>${grandTotal.toFixed(2)}</strong>
          </div>
        </div>
        <button className="continue-shopping-btn" onClick={onBack}>
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="checkout">
      <button className="back-btn" onClick={onBack}>&larr; Back to Bookshop</button>
      <h2>Checkout</h2>

      {/* Step indicator */}
      <div className="checkout-steps">
        <div className="step completed">
          <span className="step-number">✓</span>
          <span className="step-label">Cart</span>
        </div>
        <div className="step-line completed" />
        <div className="step active">
          <span className="step-number">2</span>
          <span className="step-label">Details</span>
        </div>
        <div className="step-line" />
        <div className="step">
          <span className="step-number">3</span>
          <span className="step-label">Done</span>
        </div>
      </div>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {/* Shipping Information */}
          <h3>📦 Shipping Information</h3>
          {errors.submit && <div className="error-banner">{errors.submit}</div>}

          <div className="form-group">
            <label htmlFor="customer_name">Full Name</label>
            <input
              id="customer_name"
              name="customer_name"
              type="text"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
            {errors.customer_name && <span className="field-error">{errors.customer_name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@example.com"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Street"
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="New York"
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="zip">ZIP Code</label>
              <input
                id="zip"
                name="zip"
                type="text"
                value={form.zip}
                onChange={handleChange}
                placeholder="10001"
              />
              {errors.zip && <span className="field-error">{errors.zip}</span>}
            </div>
          </div>

          {/* Shipping Method */}
          <h3>🚚 Shipping Method</h3>
          <div className="shipping-options">
            {SHIPPING_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`shipping-option ${shippingMethod === option.id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value={option.id}
                  checked={shippingMethod === option.id}
                  onChange={(e) => setShippingMethod(e.target.value)}
                />
                <div className="shipping-option-info">
                  <span className="shipping-option-label">{option.label}</span>
                  <span className="shipping-option-time">{option.time}</span>
                </div>
                <span className="shipping-option-cost">${option.cost.toFixed(2)}</span>
              </label>
            ))}
          </div>

          {/* Payment Information */}
          <h3>💳 Payment Information</h3>
          <p className="payment-note">This is a demo — no real payment is processed.</p>

          <div className="form-group">
            <label htmlFor="card_number">Card Number</label>
            <input
              id="card_number"
              name="card_number"
              type="text"
              value={form.card_number}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {errors.card_number && <span className="field-error">{errors.card_number}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="card_expiry">Expiry Date</label>
              <input
                id="card_expiry"
                name="card_expiry"
                type="text"
                value={form.card_expiry}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
              />
              {errors.card_expiry && <span className="field-error">{errors.card_expiry}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="card_cvc">CVC</label>
              <input
                id="card_cvc"
                name="card_cvc"
                type="text"
                value={form.card_cvc}
                onChange={handleCvcChange}
                placeholder="123"
                maxLength={4}
              />
              {errors.card_cvc && <span className="field-error">{errors.card_cvc}</span>}
            </div>
          </div>

          <button type="submit" className="place-order-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : `Place Order — $${grandTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.emoji} {item.title} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping ({SHIPPING_OPTIONS.find((s) => s.id === shippingMethod)?.label})</span>
            <span>${shippingCost.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <strong>${grandTotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
