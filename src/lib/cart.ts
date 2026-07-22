import { useState, useCallback } from 'react'
import { CartItem, MenuItem, ItemModifier } from '@/types/database'

/**
 * Calculates unit price for an item with its selected variant and addons
 */
export function calculateUnitPrice(
  basePrice: number,
  selectedVariant?: ItemModifier | null,
  selectedAddons: ItemModifier[] = []
): number {
  const variantPrice = Number(selectedVariant?.price || 0)
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0)
  return Number(basePrice) + variantPrice + addonsPrice
}

/**
 * Custom React Hook for Managing E-Menu Shopping Cart State
 */
export function useCartState() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prevCart) => [...prevCart, newItem])
  }, [])

  const removeFromCart = useCallback((cartId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId))
  }, [])

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId))
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.cartId === cartId) {
          const totalPrice = item.unitPrice * quantity
          return { ...item, quantity, totalPrice }
        }
        return item
      })
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const grandTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItemsCount,
    grandTotal,
  }
}
