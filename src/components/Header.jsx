import { useCart } from '../context/CartContext'

// Header with shop name, navigation, and cart icon with item count
export default function Header({ currentPage, onNavigate }) {
  const { totalItems } = useCart()

  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="logo" onClick={() => onNavigate('shop')}>
          🛍️ My Shop
        </h1>
        <nav className="nav">
          <button
            className={currentPage === 'shop' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => onNavigate('shop')}
          >
            Shop
          </button>
          <button
            className={currentPage === 'cart' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => onNavigate('cart')}
          >
            🛒 Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </nav>
      </div>
    </header>
  )
}
