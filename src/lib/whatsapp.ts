import { Restaurant, CartItem, CustomerInfo } from '@/types/database'

/**
 * Builds a formatted WhatsApp Web / API click-to-chat URL with a clean Arabic receipt payload.
 */
export function buildWhatsAppMessageUrl(
  restaurant: Restaurant,
  cartItems: CartItem[],
  customerInfo: CustomerInfo
): string {
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const deliveryFee = Number(restaurant.delivery_fee || 0)
  const finalTotal = subtotal + deliveryFee

  let message = `🛒 *طلب جديد من: ${restaurant.name}*\n`
  message += `--------------------------------\n`
  message += `👤 *الزبون:* ${customerInfo.fullName}\n`
  message += `📞 *الهاتف:* ${customerInfo.phone}\n`
  message += `📍 *العنوان:* ${customerInfo.address}\n`
  message += `--------------------------------\n`

  cartItems.forEach((ci, idx) => {
    message += `*${idx + 1}. ${ci.item.name}* (x${ci.quantity})\n`
    if (ci.selectedVariant) {
      message += `   • الحجم/النوع: ${ci.selectedVariant.title}\n`
    }
    if (ci.selectedAddons && ci.selectedAddons.length > 0) {
      message += `   • الإضافات: ${ci.selectedAddons.map((a) => a.title).join('، ')}\n`
    }
    if (ci.specialInstructions) {
      message += `   • ملاحظة خاصة: ${ci.specialInstructions}\n`
    }
    message += `   السعر: ${ci.totalPrice.toFixed(2)} ج.م\n\n`
  })

  message += `--------------------------------\n`
  message += `💵 *المجموع الفرعي:* ${subtotal.toFixed(2)} ج.م\n`
  if (deliveryFee > 0) {
    message += `🚚 *رسوم التوصيل:* ${deliveryFee.toFixed(2)} ج.م\n`
  } else {
    message += `🚚 *رسوم التوصيل:* مجاني\n`
  }
  message += `💰 *الإجمالي النهائي:* ${finalTotal.toFixed(2)} ج.م\n`
  message += `--------------------------------\n`

  if (customerInfo.deliveryNotes && customerInfo.deliveryNotes.trim() !== '') {
    message += `📝 *ملاحظات التوصيل:* ${customerInfo.deliveryNotes.trim()}\n`
  }

  // Format WhatsApp Phone Number (remove '+' and spaces)
  const rawPhone = restaurant.whatsapp_number || '201000000000'
  const formattedPhone = rawPhone.replace(/\+/g, '').replace(/\s+/g, '')

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
}
