'use client'

import { useState, useMemo, useEffect } from 'react'
import { MenuItem, ItemModifier, CartItem } from '@/types/database'
import { getContrastTextColor } from '@/lib/colors'
import { X, Plus, Minus, Check, MessageSquare } from 'lucide-react'

interface ItemModalProps {
  item: (MenuItem & { item_modifiers?: ItemModifier[] }) | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (cartItem: CartItem) => void
  primaryColor?: string
}

export default function ItemModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  primaryColor = '#E11D48',
}: ItemModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ItemModifier | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<ItemModifier[]>([])
  const [quantity, setQuantity] = useState<number>(1)
  const [specialInstructions, setSpecialInstructions] = useState<string>('')

  // Separate modifiers by type
  const variants = useMemo(
    () => item?.item_modifiers?.filter((mod) => mod.type === 'variant') || [],
    [item]
  )
  const addons = useMemo(
    () => item?.item_modifiers?.filter((mod) => mod.type === 'addon') || [],
    [item]
  )

  // Reset state when item changes or modal opens
  useEffect(() => {
    if (isOpen && item) {
      setSelectedVariant(variants.length > 0 ? variants[0] : null)
      setSelectedAddons([])
      setQuantity(1)
      setSpecialInstructions('')
    }
  }, [isOpen, item, variants])

  if (!isOpen || !item) return null

  // Calculate dynamic unit and total price
  const variantPrice = Number(selectedVariant?.price || 0)
  const addonsPrice = selectedAddons.reduce((sum: number, addon: ItemModifier) => sum + Number(addon.price || 0), 0)
  const unitPrice = Number(item.price) + variantPrice + addonsPrice
  const totalPrice = unitPrice * quantity

  // Contrast text color for CTA button
  const ctaTextColor = getContrastTextColor(primaryColor)

  const handleToggleAddon = (addon: ItemModifier) => {
    setSelectedAddons((prev: ItemModifier[]) =>
      prev.some((a: ItemModifier) => a.id === addon.id)
        ? prev.filter((a: ItemModifier) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const handleConfirmAddToCart = () => {
    const cartItem: CartItem = {
      cartId: `${item.id}-${Date.now()}`,
      item,
      selectedVariant,
      selectedAddons,
      quantity,
      specialInstructions,
      unitPrice,
      totalPrice,
    }
    onAddToCart(cartItem)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* iOS Slide-Up Sheet Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 animate-slide-up">
        {/* iOS Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="relative h-56 w-full bg-slate-100 shrink-0">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
              بدون صورة
            </div>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <div className="flex justify-between items-start gap-4 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{item.name}</h2>
              <span className="text-xl font-extrabold text-rose-600 shrink-0">
                {item.price} <span className="text-xs font-normal text-slate-500">ج.م</span>
              </span>
            </div>
            {item.description && (
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* Variants Selection (Radio Options) */}
          {variants.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">اختر الحجم / النمط</h3>
                <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-medium">
                  مطلوب
                </span>
              </div>
              <div className="space-y-2">
                {variants.map((variant: ItemModifier) => {
                  const isSelected = selectedVariant?.id === variant.id
                  return (
                    <label
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{variant.title}</span>
                      </div>
                      {Number(variant.price) > 0 && (
                        <span className="text-xs font-bold text-slate-600">
                          +{variant.price} ج.م
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add-ons Selection (Checkboxes) */}
          {addons.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">الإضافات الاختيارية</h3>
                <span className="text-xs text-slate-400 font-normal">اختياري</span>
              </div>
              <div className="space-y-2">
                {addons.map((addon: ItemModifier) => {
                  const isSelected = selectedAddons.some((a: ItemModifier) => a.id === addon.id)
                  return (
                    <label
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{addon.title}</span>
                      </div>
                      {Number(addon.price) > 0 && (
                        <span className="text-xs font-bold text-slate-600">
                          +{addon.price} ج.م
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Special Instructions Input */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>ملاحظات خاصة</span>
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="مثال: بدون بصل، صوص إضافي على الجانب..."
              rows={2}
              className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Modal Footer Controls & CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-extrabold text-slate-900 text-lg">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Dynamic CTA Button */}
            <button
              type="button"
              onClick={handleConfirmAddToCart}
              style={{
                backgroundColor: primaryColor,
                color: ctaTextColor,
              }}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-between hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <span>إضافة إلى الطلب</span>
              <span className="text-base font-extrabold">{totalPrice.toFixed(2)} ج.م</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
