import { useCart } from '../context/CartContext'

// Cart page — shows all items, allows quantity changes and removal
export default function CartPage({ onNavigate }) {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart()

  // Show empty state if cart has no items
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h2 className="page-title">Your Cart</h2>
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('shop')}>
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h2 className="page-title">Your Cart</h2>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <span className="cart-item-image">{item.image}</span>
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p className="cart-item-price">${item.price.toFixed(2)}</p>
            </div>
            <div className="cart-item-controls">
              <button
                className="btn btn-small"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                className="btn btn-small"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <span className="cart-item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              className="btn btn-small btn-danger"
              onClick={() => removeFromCart(item.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <strong>Total: ${totalPrice.toFixed(2)}</strong>
        </div>
        <button
          className="btn btn-primary btn-large"
          onClick={() => onNavigate('checkout')}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  )
}
