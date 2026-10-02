import products from '../data/products'
import ProductCard from './ProductCard'

// The main shop page — displays all products in a grid
export default function ShopPage() {
  return (
    <div className="shop-page">
      <h2 className="page-title">Our Products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
