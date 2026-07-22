'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Restaurant, Category, MenuItem, ItemModifier } from '@/types/database'
import { useCartState } from '@/lib/cart'
import { getContrastTextColor } from '@/lib/colors'
import ItemModal from '@/components/ItemModal'
import FloatingCart from '@/components/FloatingCart'
import {
  CheckCircle,
  XCircle,
  Star,
  ShoppingBag,
  Phone,
  Plus,
  Lock,
} from 'lucide-react'

interface MenuPageProps {
  params: Promise<{
    subdomain: string
  }>
}

export type MenuItemWithModifiers = MenuItem & {
  item_modifiers?: ItemModifier[]
}

export type CategoryWithItems = Category & {
  menu_items?: MenuItemWithModifiers[]
}

export default function TenantMenuPage({ params }: MenuPageProps) {
  const { subdomain } = use(params)

  const [loading, setLoading] = useState<boolean>(true)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<CategoryWithItems[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<string>('')

  // Modal & Cart State from custom hook
  const [selectedItem, setSelectedItem] = useState<MenuItemWithModifiers | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const { cart, addToCart, removeFromCart, clearCart } = useCartState()

  useEffect(() => {
    async function fetchMenuData() {
      setLoading(true)
      try {
        // 1. Fetch Restaurant
        const { data: restData } = await (supabase.from('restaurants') as any)
          .select('*')
          .eq('subdomain', subdomain)
          .single()

        if (restData) {
          const typedRest = restData as Restaurant
          setRestaurant(typedRest)

          // 2. Fetch Categories
          const { data: catData } = await (supabase.from('categories') as any)
            .select('*')
            .eq('restaurant_id', typedRest.id)
            .order('sort_order', { ascending: true })

          if (catData && (catData as Category[]).length > 0) {
            const categoriesWithData: CategoryWithItems[] = await Promise.all(
              (catData as Category[]).map(async (category: Category) => {
                const { data: items } = await (supabase.from('menu_items') as any)
                  .select('*, item_modifiers(*)')
                  .eq('category_id', category.id)

                return {
                  ...category,
                  menu_items: (items as MenuItemWithModifiers[]) || [],
                }
              })
            )

            setCategories(categoriesWithData)
            setActiveCategoryId(categoriesWithData[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching restaurant menu:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()
  }, [subdomain])

  // Fallback Mock Data if Supabase has no records or environment is offline
  const activeRestaurant: Restaurant = restaurant || {
    id: 'demo-id',
    name: subdomain === 'burger' ? 'برجر هاوس - Burger House' : `مطعم ${subdomain}`,
    subdomain: subdomain,
    logo_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    primary_color: '#E11D48',
    whatsapp_number: '+201000000000',
    delivery_fee: 15.0,
    is_active: true,
    created_at: new Date().toISOString(),
  }

  // Inactive Restaurant Handling
  if (activeRestaurant.is_active === false) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/3 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-slate-800/60 backdrop-blur-2xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold mb-2 text-white">{activeRestaurant.name}</h1>
          <p className="text-lg font-semibold text-rose-400 mb-4">عفواً، المنيو غير متاح حالياً</p>

          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            هذا المطعم مغلق حالياً أو تم إيقاف المنيو الإلكتروني الخاص به مؤقتاً. يرجى التواصل مع إدارة المطعم مباشرة.
          </p>

          {activeRestaurant.whatsapp_number && (
            <a
              href={`https://wa.me/${activeRestaurant.whatsapp_number.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>التواصل مع المطعم عبر الواتساب</span>
            </a>
          )}
        </div>
      </div>
    )
  }

  const activeCategories: CategoryWithItems[] = categories.length > 0 ? categories : [
    {
      id: 'cat-1',
      restaurant_id: 'demo-id',
      name: 'البرجر المميز',
      sort_order: 1,
      created_at: new Date().toISOString(),
      menu_items: [
        {
          id: 'item-1',
          category_id: 'cat-1',
          name: 'كلاسيك برجر لحم',
          description: 'شريحة لحم أنجوس مشوية، جبنة شيدر ذائبة، خَس طازج، مخلل، وصوص خاص',
          price: 130.0,
          sizes: [
            { name: 'سنجل 150ج', price: 130 },
            { name: 'دبل 250ج', price: 175 },
            { name: 'تريبل 350ج', price: 220 },
          ],
          image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          is_available: true,
          created_at: new Date().toISOString(),
          item_modifiers: [
            { id: 'mod-2', item_id: 'item-1', title: 'إضافة جبنة شيدر إضافية', price: 15.0, type: 'addon', created_at: '' },
          ],
        },
        {
          id: 'item-2',
          category_id: 'cat-1',
          name: 'تريبل دبل برجر',
          description: 'شريحتان من اللحم المشوي، جبن دوبل، بصل مكرمل وصوص الشواء المميز',
          price: 160.0,
          sizes: [
            { name: 'وسط 200ج', price: 160 },
            { name: 'كبير 300ج', price: 200 },
          ],
          image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
          is_available: true,
          created_at: new Date().toISOString(),
          item_modifiers: [],
        },
        {
          id: 'item-3',
          category_id: 'cat-1',
          name: 'برجر الدجاج المقرمش (نفذت الكمية)',
          description: 'صدر دجاج مقلي مقرمش، صوص المايونيز الحار والخس',
          price: 110.0,
          sizes: [],
          image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
          is_available: false,
          created_at: new Date().toISOString(),
          item_modifiers: [],
        },
      ],
    },
    {
      id: 'cat-2',
      restaurant_id: 'demo-id',
      name: 'المقبلات والمشروبات',
      sort_order: 2,
      created_at: new Date().toISOString(),
      menu_items: [
        {
          id: 'item-4',
          category_id: 'cat-2',
          name: 'بطاطس متبلة مع الجبن',
          description: 'بطاطس مقرمشة مغطاة بصلصة الجبنة الذائبة وقطع الهالابينو',
          price: 50.0,
          sizes: [],
          image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          is_available: true,
          created_at: new Date().toISOString(),
          item_modifiers: [],
        },
      ],
    },
  ]

  const activeCategory = activeCategoryId || activeCategories[0]?.id

  const primaryColor = activeRestaurant.primary_color || '#E11D48'
  const contrastText = getContrastTextColor(primaryColor)

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 pb-28">
      {/* Header Banner */}
      <div className="relative h-56 sm:h-72 w-full bg-slate-900 overflow-hidden">
        {activeRestaurant.cover_url && (
          <img
            src={activeRestaurant.cover_url}
            alt={activeRestaurant.name}
            className="w-full h-full object-cover opacity-75 transform scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
      </div>

      {/* Restaurant Profile Info Card */}
      <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-white/60 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-5">
          {/* Restaurant Logo */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-slate-100 shrink-0">
            <img
              src={activeRestaurant.logo_url || '/placeholder.png'}
              alt={activeRestaurant.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeRestaurant.name}
              </h1>

              {/* Status Badge */}
              {activeRestaurant.is_active ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  مفتوح الآن
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />
                  مغلق حالياً
                </span>
              )}

              {/* Rating */}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                4.9
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              نطاق القائمة الإلكترونية: <span className="font-mono text-rose-600 font-semibold">{subdomain}.localhost:3000</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600">
              {activeRestaurant.delivery_fee > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200/60">
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <span>رسوم التوصيل: <strong className="text-slate-900">{activeRestaurant.delivery_fee} ج.م</strong></span>
                </div>
              )}
              {activeRestaurant.whatsapp_number && (
                <a
                  href={`https://wa.me/${activeRestaurant.whatsapp_number.replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-colors font-medium"
                >
                  <Phone className="w-4 h-4" />
                  <span>تواصل عبر الواتساب</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Horizontal Category Navigation */}
        <div className="sticky top-4 z-30 my-6 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 overflow-x-auto flex gap-2.5 scrollbar-none border-b border-slate-200/60">
          {activeCategories.map((category: CategoryWithItems) => {
            const isActive = activeCategory === category.id
            return (
              <button
                type="button"
                key={category.id}
                onClick={() => {
                  setActiveCategoryId(category.id)
                  const el = document.getElementById(`cat-${category.id}`)
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                style={
                  isActive
                    ? { backgroundColor: primaryColor, color: contrastText }
                    : {}
                }
                className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap shadow-sm ${
                  isActive
                    ? 'shadow-md scale-105'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-10">
          {activeCategories.map((category: CategoryWithItems) => (
            <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{category.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.menu_items?.map((item: MenuItemWithModifiers) => {
                  const isAvailable = item.is_available !== false
                  const displayPrice = item.sizes && item.sizes.length > 0 ? item.sizes[0].price : item.price

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedItem(item)
                          setIsModalOpen(true)
                        }
                      }}
                      className={`bg-white rounded-3xl p-4 shadow-sm border transition-all duration-200 flex gap-4 ${
                        isAvailable
                          ? 'border-slate-100 hover:shadow-lg hover:border-slate-200 cursor-pointer group'
                          : 'border-slate-200 bg-slate-100/60 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {/* Item Image */}
                      {item.image_url && (
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className={`w-full h-full object-cover ${
                              isAvailable ? 'group-hover:scale-105 transition-transform duration-300' : 'grayscale'
                            }`}
                          />
                          {!isAvailable && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-1 text-center">
                              <span className="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full">
                                غير متاح حالياً
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Item Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-rose-600 transition-colors">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                              {item.description}
                            </p>
                          )}

                          {/* Item Sizes Badge Preview */}
                          {item.sizes && item.sizes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.sizes.map((sz, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                                >
                                  {sz.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="font-extrabold text-slate-900 text-base">
                            {item.sizes && item.sizes.length > 1 && (
                              <span className="text-xs text-slate-500 font-normal ml-1">يبدأ من </span>
                            )}
                            {displayPrice}{' '}
                            <span className="text-xs text-slate-500 font-normal">ج.م</span>
                          </span>

                          {/* Floating Plus Add Button */}
                          {isAvailable ? (
                            <button
                              type="button"
                              style={{ backgroundColor: primaryColor, color: contrastText }}
                              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400">غير متاح</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Product Detail Sheet Modal */}
      <ItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={addToCart}
        primaryColor={primaryColor}
      />

      {/* Floating Bottom Cart Bar */}
      <FloatingCart
        cartItems={cart}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        restaurant={activeRestaurant}
      />
    </div>
  )
}
