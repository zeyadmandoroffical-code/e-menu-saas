import { MenuItem, ItemModifier } from './database'

export interface CartItem {
  cartId: string
  item: MenuItem
  selectedVariant?: ItemModifier | null
  selectedAddons: ItemModifier[]
  quantity: number
  specialInstructions: string
  unitPrice: number
  totalPrice: number
}
