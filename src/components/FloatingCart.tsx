'use client'

import { useState } from 'react'
import { Restaurant, CartItem } from '@/types/database'
import { getContrastTextColor } from '@/lib/colors'
import CheckoutModal from '@/components/CheckoutModal'
import { ShoppingBag, Trash2, ArrowLeft, X } from 'lucide-react'

interface FloatingCartProps {
  cartItems: CartItem[]
  onRemoveItem: (cartId: string) => void
  onClearCart: () => void
  restaurant: Restaurant
}

export default function FloatingCart({
  cartItems,
  onRemoveItem,
  onClearCart,
  restaurant,
}: FloatingCartProps) {
  const [isTrayOpen, setIsTrayOpen] = useState<boolean>(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false)

  const totalItemsCount = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.totalPrice, 0)

  const primaryColor = restaurant.primary_color || '#E11D48'
  const ctaTextColor = getContrastTextColor(primaryColor)

  if (cartItems.length === 0) return null

  const handleOpenCheckout = () => {
    setIsTrayOpen(false)
    setIsCheckoutOpen(true)
  }

  return (
    <>
      {/* Floating Bottom Glass Bar */}
      <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-40 animate-slide-up">
        <div
          onClick={() => setIsTrayOpen(true)}
          style={{ backgroundColor: primaryColor, color: ctaTextColor }}
          className="p-4 rounded-3xl shadow-2xl backdrop-blur-xl flex items-center justify-between cursor-pointer hover:opacity-95 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-base relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                {totalItemsCount}
              </span>
            </div>
            <div>
              <p className="text-xs opacity-80 font-medium">عرض سلة الطلبات</p>
              <p className="text-base font-extrabold">{subtotal.toFixed(2)} ج.م</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-bold">
            <span>متابعة الطلب</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Cart Summary Drawer Modal */}
      {isTrayOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsTrayOpen(false)} />

          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 animate-slide-up">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-lg">تفاصيل الطلب ({totalItemsCount})</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  تفريغ السلة
                </button>
                <button
                  type="button"
                  onClick={() => setIsTrayOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 divide-y divide-slate-100">
              {cartItems.map((cartItem: CartItem) => (
                <div key={cartItem.cartId} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center">
                        {cartItem.quantity}x
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{cartItem.item.name}</h4>
                    </div>

                    {cartItem.selectedVariant && (
                      <p className="text-xs text-slate-500 mr-8 mt-0.5">
                        الحجم: {cartItem.selectedVariant.title}
                      </p>
                    )}

                    {cartItem.selectedAddons && cartItem.selectedAddons.length > 0 && (
                      <p className="text-xs text-slate-500 mr-8 mt-0.5">
                        الإضافات: {cartItem.selectedAddons.map((a) => a.title).join('، ')}
                      </p>
                    )}

                    {cartItem.specialInstructions && (
                      <p className="text-xs text-slate-400 mr-8 mt-0.5 italic">
                        ملاحظة: {cartItem.specialInstructions}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-sm text-slate-900">
                      {cartItem.totalPrice.toFixed(2)} ج.م
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(cartItem.cartId)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Checkout Action */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-slate-900 font-bold">
                <span>المجموع الكلي (قبل التوصيل):</span>
                <span className="text-xl text-rose-600">{subtotal.toFixed(2)} ج.م</span>
              </div>

              <button
                type="button"
                onClick={handleOpenCheckout}
                style={{ backgroundColor: primaryColor, color: ctaTextColor }}
                className="w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all"
              >
                <span>إدخال بيانات التوصيل والتأكيد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Form Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        restaurant={restaurant}
        cartItems={cartItems}
        primaryColor={primaryColor}
      />
    </>
  )
}
