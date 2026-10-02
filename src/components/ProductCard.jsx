export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-image" style={{ backgroundColor: product.bg_color }}>
        <span className="product-emoji">{product.emoji}</span>
      </div>
      <div className="product-info">
        <span className="product-category">{product.category === 'children' ? 'Children' : 'Teens'}</span>
        <h3 className="product-title">{product.title}</h3>
        <p className="product-author">by {product.author}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
