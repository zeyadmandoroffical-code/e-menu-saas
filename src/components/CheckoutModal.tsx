'use client'

import { useState } from 'react'
import { Restaurant, CartItem, CustomerInfo } from '@/types/database'
import { buildWhatsAppMessageUrl } from '@/lib/whatsapp'
import { getContrastTextColor } from '@/lib/colors'
import { X, User, Phone, MapPin, FileText, Send, AlertCircle, ShoppingBag } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  restaurant: Restaurant
  cartItems: CartItem[]
  primaryColor?: string
}

export default function CheckoutModal({
  isOpen,
  onClose,
  restaurant,
  cartItems,
  primaryColor = '#E11D48',
}: CheckoutModalProps) {
  const [fullName, setFullName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [deliveryNotes, setDeliveryNotes] = useState<string>('')

  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; address?: string }>({})

  if (!isOpen) return null

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const deliveryFee = Number(restaurant.delivery_fee || 0)
  const grandTotal = subtotal + deliveryFee

  const ctaTextColor = getContrastTextColor(primaryColor)

  const validateForm = (): boolean => {
    const newErrors: { fullName?: string; phone?: string; address?: string } = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'الرجاء إدخال الاسم بالكامل'
    }
    if (!phone.trim()) {
      newErrors.phone = 'الرجاء إدخال رقم الهاتف للتواصل'
    }
    if (!address.trim()) {
      newErrors.address = 'الرجاء إدخال العنوان التفصيلي للتوصيل'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const customerInfo: CustomerInfo = {
      fullName,
      phone,
      address,
      deliveryNotes,
    }

    const whatsappUrl = buildWhatsAppMessageUrl(restaurant, cartItems, customerInfo)
    window.open(whatsappUrl, '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* iOS Slide-Up Drawer */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 animate-slide-up">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">تفاصيل التوصيل والطلب</h3>
              <p className="text-xs text-slate-500">{restaurant.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <User className="w-4 h-4 text-slate-500" />
              <span>الاسم بالكامل <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: محمد أحمد"
              className={`w-full rounded-2xl border p-3.5 text-sm transition-all focus:outline-none text-slate-800 ${
                errors.fullName
                  ? 'border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white'
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Phone className="w-4 h-4 text-slate-500" />
              <span>رقم الهاتف للتواصل <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01000000000"
              dir="ltr"
              className={`w-full rounded-2xl border p-3.5 text-sm transition-all focus:outline-none text-slate-800 text-right ${
                errors.phone
                  ? 'border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white'
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>العنوان التفصيلي <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="المدينة، المنطقة، الشارع، اسم البناية، رقم الشقة..."
              rows={2}
              className={`w-full rounded-2xl border p-3.5 text-sm transition-all focus:outline-none resize-none text-slate-800 ${
                errors.address
                  ? 'border-rose-500 bg-rose-50/30 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white'
              }`}
            />
            {errors.address && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.address}
              </p>
            )}
          </div>

          {/* Delivery Notes */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>ملاحظات إضافية للتوصيل (اختياري)</span>
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="مثال: الاتصال عند الوصول، الاتصال بدلاً من إرسال الواتساب..."
              className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white text-slate-800"
            />
          </div>

          {/* Order Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 mt-4">
            <h4 className="font-bold text-slate-900 text-xs mb-2">ملخص المبالغ</h4>

            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-semibold text-slate-900">{subtotal.toFixed(2)} ج.م</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>رسوم التوصيل:</span>
              <span className="font-semibold text-slate-900">
                {deliveryFee > 0 ? `${deliveryFee.toFixed(2)} ج.م` : 'مجاني'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-extrabold text-sm">
              <span>الإجمالي النهائي:</span>
              <span className="text-rose-600 text-base">{grandTotal.toFixed(2)} ج.م</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            style={{ backgroundColor: primaryColor, color: ctaTextColor }}
            className="w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>تأكيد الطلب عبر الواتساب 🟢</span>
          </button>
        </form>
      </div>
    </div>
  )
}
