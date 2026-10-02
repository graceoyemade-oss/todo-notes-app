import { createContext, useContext, useState, useEffect } from 'react'

// Create a context to share cart data across all components
const CartContext = createContext()

// Custom hook so any component can easily access the cart
export function useCart() {
  return useContext(CartContext)
}

// CartProvider wraps the app and manages all cart state
export function CartProvider({ children }) {
  // Load cart from localStorage so it persists when the page refreshes
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shop-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shop-cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Add a product to the cart (or increase quantity if already in cart)
  function addToCart(product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        // Product already in cart — increase quantity
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      // New product — add with quantity 1
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  // Remove a product completely from the cart
  function removeFromCart(productId) {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }

  // Update the quantity of a product (removes if quantity is 0)
  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  // Clear the entire cart (used after placing an order)
  function clearCart() {
    setCartItems([])
  }

  // Calculate total number of items in cart (for the badge)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate total price of all items
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // Provide all cart data and functions to child components
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
