export default function Cart({ items, isOpen, onClose, onUpdateQuantity, onRemove, onCheckout }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} />}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart ({itemCount})</h2>
          <button className="cart-close" onClick={onClose}>&times;</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <p className="cart-empty-hint">Add some books to get started!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image" style={{ backgroundColor: item.bg_color }}>
                    <span>{item.emoji}</span>
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.title}</h4>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                    <div className="cart-item-controls">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => onRemove(item.id)}>&times;</button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <button className="checkout-btn" onClick={onCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
