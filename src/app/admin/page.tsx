'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Restaurant, Category, MenuItem, ItemModifier, ItemSize } from '@/types/database'
import Link from 'next/link'
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Globe,
  Palette,
  Phone,
  Truck,
  Layers,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  Settings,
  X,
} from 'lucide-react'

// Apple Palette Presets
const APPLE_COLOR_PRESETS = [
  { name: 'كرمزي فاخر (Crimson)', hex: '#E11D48' },
  { name: 'أزرق داكن (Dark Slate)', hex: '#0F172A' },
  { name: 'زمردي نقي (Emerald)', hex: '#059669' },
  { name: 'عنبري دافئ (Amber)', hex: '#D97706' },
  { name: 'بنفسجي نيون (Purple)', hex: '#7C3AED' },
]

type MenuItemWithModifiers = MenuItem & {
  item_modifiers?: ItemModifier[]
}

type CategoryWithItems = Category & {
  menu_items?: MenuItemWithModifiers[]
}

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'menu'>('restaurants')
  const [loading, setLoading] = useState<boolean>(true)

  // System State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('')
  const [categories, setCategories] = useState<CategoryWithItems[]>([])

  // Modal / Form States for Creating Restaurant
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState<boolean>(false)
  const [newRestName, setNewRestName] = useState<string>('')
  const [newRestSubdomain, setNewRestSubdomain] = useState<string>('')
  const [newRestWhatsapp, setNewRestWhatsapp] = useState<string>('')
  const [newRestDeliveryFee, setNewRestDeliveryFee] = useState<number>(15)
  const [newRestColor, setNewRestColor] = useState<string>('#E11D48')
  const [newRestLogoUrl, setNewRestLogoUrl] = useState<string>('')
  const [newRestCoverUrl, setNewRestCoverUrl] = useState<string>('')

  // Edit Restaurant State
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [editRestName, setEditRestName] = useState<string>('')
  const [editRestWhatsapp, setEditRestWhatsapp] = useState<string>('')
  const [editRestDeliveryFee, setEditRestDeliveryFee] = useState<number>(15)
  const [editRestColor, setEditRestColor] = useState<string>('#E11D48')
  const [editRestLogoUrl, setEditRestLogoUrl] = useState<string>('')
  const [editRestCoverUrl, setEditRestCoverUrl] = useState<string>('')

  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState<string>('')

  // Menu Item Form State (with Structured Sizes)
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false)
  const [itemCategoryId, setItemCategoryId] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [itemDescription, setItemDescription] = useState<string>('')
  const [itemPrice, setItemPrice] = useState<number>(0)
  const [itemImageUrl, setItemImageUrl] = useState<string>('')
  const [itemSizes, setItemSizes] = useState<ItemSize[]>([])
  const [sizeInputName, setSizeInputName] = useState<string>('')
  const [sizeInputPrice, setSizeInputPrice] = useState<number>(0)

  // Modifier Form State
  const [selectedItemForModifier, setSelectedItemForModifier] = useState<MenuItemWithModifiers | null>(null)
  const [modifierTitle, setModifierTitle] = useState<string>('')
  const [modifierPrice, setModifierPrice] = useState<number>(0)
  const [modifierType, setModifierType] = useState<'variant' | 'addon'>('variant')

  // Search / Filter
  const [searchQuery, setSearchQuery] = useState<string>('')

  // 1. Fetch All Data
  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const { data } = await (supabase.from('restaurants') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        const typedData = data as Restaurant[]
        setRestaurants(typedData)
        if (typedData.length > 0 && !selectedRestaurantId) {
          setSelectedRestaurantId(typedData[0].id)
        }
      }
    } catch (err) {
      console.error('Error loading restaurants:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMenuForSelectedRestaurant = async (restId: string) => {
    if (!restId) return
    try {
      const { data: catData } = await (supabase.from('categories') as any)
        .select('*')
        .eq('restaurant_id', restId)
        .order('sort_order', { ascending: true })

      if (catData) {
        const fullCategories: CategoryWithItems[] = await Promise.all(
          (catData as Category[]).map(async (cat) => {
            const { data: items } = await (supabase.from('menu_items') as any)
              .select('*, item_modifiers(*)')
              .eq('category_id', cat.id)

            return {
              ...cat,
              menu_items: (items as MenuItemWithModifiers[]) || [],
            }
          })
        )
        setCategories(fullCategories)
      }
    } catch (err) {
      console.error('Error loading menu:', err)
    }
  }

  useEffect(() => {
    loadRestaurants()
  }, [])

  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenuForSelectedRestaurant(selectedRestaurantId)
    }
  }, [selectedRestaurantId])

  // --- RESTAURANT ACTIONS ---

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRestName || !newRestSubdomain) return

    const subdomainClean = newRestSubdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')

    try {
      const { data, error } = await (supabase.from('restaurants') as any)
        .insert({
          name: newRestName,
          subdomain: subdomainClean,
          whatsapp_number: newRestWhatsapp,
          delivery_fee: newRestDeliveryFee,
          primary_color: newRestColor,
          logo_url: newRestLogoUrl.trim() || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=300&q=80',
          cover_url: newRestCoverUrl.trim() || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        alert(`خطأ أثناء إنشاء المطعم: ${error.message}`)
      } else if (data) {
        const createdRest = data as Restaurant
        setRestaurants((prev) => [createdRest, ...prev])
        setSelectedRestaurantId(createdRest.id)
        setShowAddRestaurantModal(false)
        setNewRestName('')
        setNewRestSubdomain('')
        setNewRestWhatsapp('')
        setNewRestLogoUrl('')
        setNewRestCoverUrl('')
      }
    } catch (err: any) {
      console.error('Error creating restaurant:', err)
      alert(`خطأ: ${err.message || err}`)
    }
  }

  const handleOpenEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setEditRestName(restaurant.name)
    setEditRestWhatsapp(restaurant.whatsapp_number || '')
    setEditRestDeliveryFee(restaurant.delivery_fee || 15)
    setEditRestColor(restaurant.primary_color || '#E11D48')
    setEditRestLogoUrl(restaurant.logo_url || '')
    setEditRestCoverUrl(restaurant.cover_url || '')
  }

  const handleSaveEditRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRestaurant || !editRestName) return

    try {
      const { data, error } = await (supabase.from('restaurants') as any)
        .update({
          name: editRestName,
          whatsapp_number: editRestWhatsapp,
          delivery_fee: editRestDeliveryFee,
          primary_color: editRestColor,
          logo_url: editRestLogoUrl.trim() || editingRestaurant.logo_url,
          cover_url: editRestCoverUrl.trim() || editingRestaurant.cover_url,
        })
        .eq('id', editingRestaurant.id)
        .select()
        .single()

      if (error) {
        alert(`خطأ أثناء التعديل: ${error.message}`)
      } else if (data) {
        const updatedRest = data as Restaurant
        setRestaurants((prev) =>
          prev.map((r) => (r.id === updatedRest.id ? updatedRest : r))
        )
        setEditingRestaurant(null)
      }
    } catch (err: any) {
      console.error('Error updating restaurant profile:', err)
      alert(`خطأ: ${err.message || err}`)
    }
  }

  const handleToggleRestaurantStatus = async (restaurant: Restaurant) => {
    const nextStatus = !restaurant.is_active
    try {
      const { error } = await (supabase.from('restaurants') as any)
        .update({ is_active: nextStatus })
        .eq('id', restaurant.id)

      if (!error) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === restaurant.id ? { ...r, is_active: nextStatus } : r))
        )
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleUpdateColor = async (restaurantId: string, color: string) => {
    try {
      const { error } = await (supabase.from('restaurants') as any)
        .update({ primary_color: color })
        .eq('id', restaurantId)

      if (!error) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === restaurantId ? { ...r, primary_color: color } : r))
        )
      }
    } catch (err) {
      console.error('Error updating color:', err)
    }
  }

  const handleUploadImage = async (
    e: ChangeEvent<HTMLInputElement>,
    bucket: 'restaurant-media' | 'menu-media',
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) {
        console.warn('Storage upload error, using fallback URL if provided:', uploadError)
        return
      }

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
      if (publicUrlData?.publicUrl) {
        onSuccess(publicUrlData.publicUrl)
      }
    } catch (err) {
      console.warn('File upload caught exception, manual URL input remains usable.', err)
    }
  }

  // --- MENU CATEGORY ACTIONS ---

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName || !selectedRestaurantId) return

    try {
      const { data, error } = await (supabase.from('categories') as any)
        .insert({
          restaurant_id: selectedRestaurantId,
          name: newCategoryName,
          sort_order: categories.length + 1,
        })
        .select()
        .single()

      if (data && !error) {
        const createdCat = data as Category
        setCategories((prev) => [...prev, { ...createdCat, menu_items: [] }])
        setNewCategoryName('')
      }
    } catch (err) {
      console.error('Error adding category:', err)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا القسم بجميع وجباته؟')) return
    try {
      const { error } = await (supabase.from('categories') as any).delete().eq('id', catId)
      if (!error) {
        setCategories((prev) => prev.filter((c) => c.id !== catId))
      }
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }

  // --- MENU ITEM & STRUCTURED SIZES ACTIONS ---

  const handleAddSizeOptionToForm = () => {
    if (!sizeInputName.trim() || sizeInputPrice <= 0) return
    setItemSizes((prev) => [...prev, { name: sizeInputName.trim(), price: sizeInputPrice }])
    setSizeInputName('')
    setSizeInputPrice(0)
  }

  const handleRemoveSizeOptionFromForm = (index: number) => {
    setItemSizes((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemCategoryId || !itemName) return

    // Base price defaults to itemPrice or first size price
    const finalBasePrice = itemSizes.length > 0 ? itemSizes[0].price : itemPrice

    try {
      const { data, error } = await (supabase.from('menu_items') as any)
        .insert({
          category_id: itemCategoryId,
          name: itemName,
          description: itemDescription,
          price: finalBasePrice,
          sizes: itemSizes,
          image_url: itemImageUrl.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          is_available: true,
        })
        .select()
        .single()

      if (data && !error) {
        const createdItem = data as MenuItem
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id === itemCategoryId) {
              return {
                ...cat,
                menu_items: [...(cat.menu_items || []), { ...createdItem, item_modifiers: [] }],
              }
            }
            return cat
          })
        )
        setShowAddItemModal(false)
        setItemName('')
        setItemDescription('')
        setItemPrice(0)
        setItemImageUrl('')
        setItemSizes([])
      }
    } catch (err) {
      console.error('Error adding item:', err)
    }
  }

  const handleToggleItemAvailability = async (item: MenuItemWithModifiers) => {
    const nextState = !item.is_available
    try {
      const { error } = await (supabase.from('menu_items') as any)
        .update({ is_available: nextState })
        .eq('id', item.id)

      if (!error) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menu_items: cat.menu_items?.map((i) =>
              i.id === item.id ? { ...i, is_available: nextState } : i
            ),
          }))
        )
      }
    } catch (err) {
      console.error('Error toggling item availability:', err)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('هل تريد حذف هذا الصنف؟')) return
    try {
      const { error } = await (supabase.from('menu_items') as any).delete().eq('id', itemId)
      if (!error) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menu_items: cat.menu_items?.filter((i) => i.id !== itemId),
          }))
        )
      }
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  // --- MODIFIER ACTIONS ---

  const handleAddModifier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemForModifier || !modifierTitle) return

    try {
      const { data, error } = await (supabase.from('item_modifiers') as any)
        .insert({
          item_id: selectedItemForModifier.id,
          title: modifierTitle,
          price: modifierPrice,
          type: modifierType,
        })
        .select()
        .single()

      if (data && !error) {
        const createdMod = data as ItemModifier
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menu_items: cat.menu_items?.map((item) => {
              if (item.id === selectedItemForModifier.id) {
                return {
                  ...item,
                  item_modifiers: [...(item.item_modifiers || []), createdMod],
                }
              }
              return item
            }),
          }))
        )
        setModifierTitle('')
        setModifierPrice(0)
      }
    } catch (err) {
      console.error('Error adding modifier:', err)
    }
  }

  const handleDeleteModifier = async (modId: string, itemId: string) => {
    try {
      const { error } = await (supabase.from('item_modifiers') as any).delete().eq('id', modId)
      if (!error) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            menu_items: cat.menu_items?.map((item) => {
              if (item.id === itemId) {
                return {
                  ...item,
                  item_modifiers: item.item_modifiers?.filter((m) => m.id !== modId),
                }
              }
              return item
            }),
          }))
        )
      }
    } catch (err) {
      console.error('Error deleting modifier:', err)
    }
  }

  // Statistics
  const totalRestaurants = restaurants.length
  const activeRestaurants = restaurants.filter((r) => r.is_active).length
  const inactiveRestaurants = totalRestaurants - activeRestaurants

  const selectedRest = restaurants.find((r) => r.id === selectedRestaurantId)

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-rose-500 flex flex-col">
      {/* Admin Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">لوحة التحكم المشرف Super Admin</h1>
              <p className="text-xs text-slate-400">إدارة المطاعم، المنيو، والأحجام التفصيلية (بالجنيه المصري ج.م)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadRestaurants}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-6 py-8 flex-1 space-y-8 max-w-7xl">
        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">إجمالي المطاعم</p>
              <h2 className="text-3xl font-extrabold text-white">{totalRestaurants}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Utensils className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">المطاعم النشطة</p>
              <h2 className="text-3xl font-extrabold text-emerald-400">{activeRestaurants}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">المطاعم المغلقة</p>
              <h2 className="text-3xl font-extrabold text-rose-400">{inactiveRestaurants}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'restaurants'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>إدارة المطاعم والنطاقات ({totalRestaurants})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>إدارة المنيو والأقسام ({selectedRest?.name || 'اختر مطعم'})</span>
          </button>
        </div>

        {/* TAB 1: RESTAURANTS MANAGEMENT */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            {/* Control Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                <input
                  type="text"
                  placeholder="بحث باسم المطعم أو Subdomain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/70 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 transition-all placeholder-slate-500"
                />
              </div>

              <button
                onClick={() => setShowAddRestaurantModal(true)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مطعم جديد</span>
              </button>
            </div>

            {/* Restaurants Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants
                .filter(
                  (r) =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-slate-800/50 rounded-3xl border border-slate-700/60 overflow-hidden flex flex-col hover:border-slate-600 transition-all"
                  >
                    {/* Cover Preview */}
                    <div className="relative h-32 w-full bg-slate-900">
                      {restaurant.cover_url && (
                        <img
                          src={restaurant.cover_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover opacity-70"
                        />
                      )}
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
                        <Globe className="w-3.5 h-3.5 text-rose-400" />
                        <span className="font-mono text-rose-400">{restaurant.subdomain}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 -mt-10">
                      <div className="flex items-end justify-between gap-3">
                        <div className="w-16 h-16 rounded-2xl border-2 border-slate-800 overflow-hidden bg-slate-900 shadow-md shrink-0">
                          <img
                            src={restaurant.logo_url || '/placeholder.png'}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Status Toggle Switch */}
                        <button
                          onClick={() => handleToggleRestaurantStatus(restaurant)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                            restaurant.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          }`}
                        >
                          {restaurant.is_active ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>مفعل (نشط)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>مغلق</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{restaurant.name}</h3>
                          <button
                            onClick={() => handleOpenEditRestaurant(restaurant)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            تعديل الملف
                          </button>
                        </div>

                        <div className="space-y-1 text-xs text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>الواتساب: {restaurant.whatsapp_number || 'غير محدد'}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-500" />
                            <span>رسوم التوصيل: {restaurant.delivery_fee} ج.م</span>
                          </p>
                        </div>
                      </div>

                      {/* Theme Presets Customizer */}
                      <div className="pt-3 border-t border-slate-700/50 space-y-2">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-rose-400" />
                          <span>اللون الرئيسي (Apple Theme):</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {APPLE_COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.hex}
                              onClick={() => handleUpdateColor(restaurant.id, preset.hex)}
                              style={{ backgroundColor: preset.hex }}
                              title={preset.name}
                              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                restaurant.primary_color === preset.hex
                                  ? 'border-white scale-110 shadow-md'
                                  : 'border-transparent opacity-80'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedRestaurantId(restaurant.id)
                            setActiveTab('menu')
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>إدارة المنيو</span>
                        </button>

                        <Link
                          href={`/menu/${restaurant.subdomain}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center transition-colors"
                          title="معاينة المنيو"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: MENU BUILDER & CATEGORIES */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            {/* Restaurant Selector Bar */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-sm font-bold text-slate-300 whitespace-nowrap">اختر المطعم:</label>
                <select
                  value={selectedRestaurantId}
                  onChange={(e) => setSelectedRestaurantId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500 font-bold"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.subdomain})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRest && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/menu/${selectedRest.subdomain}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>معاينة منيو المطعم مباشر</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Add Category Form */}
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                إضافة قسم جديد لـ ({selectedRest?.name})
              </h3>
              <form onSubmit={handleAddCategory} className="flex gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="اسم القسم (مثال: البرجر، المقبلات، المشروبات...)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-sm text-white transition-colors"
                >
                  إضافة
                </button>
              </form>
            </div>

            {/* Categories & Menu Items Builder Grid */}
            <div className="space-y-8">
              {categories.map((category) => (
                <div key={category.id} className="bg-slate-800/30 rounded-3xl border border-slate-700/50 p-6 space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
                        {category.menu_items?.length || 0} أصناف
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setItemCategoryId(category.id)
                          setShowAddItemModal(true)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة صنف بهذا القسم</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.menu_items?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/70 rounded-2xl p-4 border border-slate-700/50 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-800"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                              <span className="text-xs font-extrabold text-rose-400 shrink-0">
                                {item.price} ج.م
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>

                            {/* Render Structured Sizes Badges */}
                            {item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.sizes.map((sz, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-md"
                                  >
                                    {sz.name}: {sz.price} ج.م
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Modifiers Badges */}
                        {item.item_modifiers && item.item_modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                            {item.item_modifiers.map((mod) => (
                              <span
                                key={mod.id}
                                className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-slate-700"
                              >
                                <span>{mod.title} (+{mod.price} ج.م)</span>
                                <button
                                  onClick={() => handleDeleteModifier(mod.id, item.id)}
                                  className="text-slate-400 hover:text-rose-400 mr-1"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Controls */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                          {/* Stock Toggle Switch */}
                          <button
                            onClick={() => handleToggleItemAvailability(item)}
                            className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
                              item.is_available
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {item.is_available ? 'متوفر' : 'غير متوفر'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedItemForModifier(item)}
                              className="text-indigo-400 hover:underline font-semibold"
                            >
                              + إضافة إضافات اختيارية
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* EDIT RESTAURANT PROFILE MODAL */}
      {editingRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-500" />
                تعديل ملف المطعم ({editingRestaurant.subdomain})
              </h3>
              <button
                onClick={() => setEditingRestaurant(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditRestaurant} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المطعم *</label>
                <input
                  type="text"
                  required
                  value={editRestName}
                  onChange={(e) => setEditRestName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الواتساب</label>
                  <input
                    type="text"
                    value={editRestWhatsapp}
                    onChange={(e) => setEditRestWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رسوم التوصيل (ج.م)</label>
                  <input
                    type="number"
                    value={editRestDeliveryFee}
                    onChange={(e) => setEditRestDeliveryFee(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Logo Upload & URL */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">شعار المطعم (Logo URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editRestLogoUrl}
                    onChange={(e) => setEditRestLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleUploadImage(e, 'restaurant-media', (url) => setEditRestLogoUrl(url))
                    }
                    className="w-24 text-[10px] text-slate-400 file:py-2 file:px-2 file:rounded-xl file:border-0 file:bg-slate-700 file:text-white"
                  />
                </div>
              </div>

              {/* Banner / Cover Upload & URL */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">صورة الغلاف (Banner URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editRestCoverUrl}
                    onChange={(e) => setEditRestCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleUploadImage(e, 'restaurant-media', (url) => setEditRestCoverUrl(url))
                    }
                    className="w-24 text-[10px] text-slate-400 file:py-2 file:px-2 file:rounded-xl file:border-0 file:bg-slate-700 file:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg transition-colors"
              >
                حفظ التعديلات الحالية
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RESTAURANT MODAL */}
      {showAddRestaurantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">إضافة مطعم جديد</h3>
              <button
                onClick={() => setShowAddRestaurantModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المطعم *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كوشري ستيشن"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">النطاق الفرعي (Subdomain) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: koshary"
                  value={newRestSubdomain}
                  onChange={(e) => setNewRestSubdomain(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-mono text-rose-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  رابط المطعم سيكون: <code className="text-rose-400">{newRestSubdomain || 'name'}.localhost:3000</code>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الواتساب</label>
                  <input
                    type="text"
                    placeholder="+201000000000"
                    value={newRestWhatsapp}
                    onChange={(e) => setNewRestWhatsapp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رسوم التوصيل (ج.م)</label>
                  <input
                    type="number"
                    value={newRestDeliveryFee}
                    onChange={(e) => setNewRestDeliveryFee(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Logo Upload & URL */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">شعار المطعم (Logo)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUploadImage(e, 'restaurant-media', (url) => setNewRestLogoUrl(url))
                  }
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-500/20 file:text-rose-400 hover:file:bg-rose-500/30"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">أو ألصق رابط الصورة مباشرة:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newRestLogoUrl}
                    onChange={(e) => setNewRestLogoUrl(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Cover Upload & URL */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">صورة الغلاف (Cover Banner)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUploadImage(e, 'restaurant-media', (url) => setNewRestCoverUrl(url))
                  }
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-500/20 file:text-rose-400 hover:file:bg-rose-500/30"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">أو ألصق رابط الغلاف مباشرة:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newRestCoverUrl}
                    onChange={(e) => setNewRestCoverUrl(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold shadow-lg shadow-rose-500/25 hover:opacity-95 transition-opacity"
              >
                إنشاء المطعم الآن
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MENU ITEM MODAL (WITH SIZES BUILDER) */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-lg">إضافة صنف جديد للمنيو</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMenuItem} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم الصنف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كلاسيك برجر"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الوصف التفصيلي</label>
                <textarea
                  rows={2}
                  placeholder="مكونات الصنف والتفاصيل..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Structured Custom Sizes Builder Section */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <label className="block text-slate-200 font-bold text-xs flex items-center justify-between">
                  <span>أحجام الصنف المخصصة (Custom Sizes)</span>
                  <span className="text-[11px] text-slate-400 font-normal">اختياري - يحدد سعر الحجم</span>
                </label>

                {/* Added Sizes Pills List */}
                {itemSizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {itemSizes.map((sz, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 font-semibold"
                      >
                        <span>{sz.name}: {sz.price} ج.م</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeOptionFromForm(idx)}
                          className="hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Inline Add Size Inputs */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اسم الحجم (مثال: سنجل 150ج)"
                    value={sizeInputName}
                    onChange={(e) => setSizeInputName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="السعر ج.م"
                    value={sizeInputPrice || ''}
                    onChange={(e) => setSizeInputPrice(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSizeOptionToForm}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    + إضافة
                  </button>
                </div>
              </div>

              {/* Fallback Base Price (if no custom sizes added) */}
              {itemSizes.length === 0 && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">السعر الأساسي (ج.م) *</label>
                  <input
                    type="number"
                    required={itemSizes.length === 0}
                    step="0.5"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">صورة الصنف</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUploadImage(e, 'menu-media', (url) => setItemImageUrl(url))
                  }
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-500/20 file:text-rose-400 hover:file:bg-rose-500/30"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">أو ألصق رابط الصورة مباشرة:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-rose-600 text-white font-bold shadow-lg hover:bg-rose-500 transition-colors"
              >
                إضافة الصنف للمنيو
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD MODIFIER MODAL */}
      {selectedItemForModifier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                إضافة إضافات اختيارية لـ ({selectedItemForModifier.name})
              </h3>
              <button
                onClick={() => setSelectedItemForModifier(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddModifier} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-bold mb-1">نوع الإضافة</label>
                <select
                  value={modifierType}
                  onChange={(e) => setModifierType(e.target.value as 'variant' | 'addon')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="addon">إضافة اختيارية متعددة (Add-on)</option>
                  <option value="variant">اختيار منفرد (Variant)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان الإضافة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جبن إضافي، بيكن مقرمش، صوص خاص"
                  value={modifierTitle}
                  onChange={(e) => setModifierTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">السعر الإضافي (ج.م)</label>
                <input
                  type="number"
                  step="0.5"
                  value={modifierPrice}
                  onChange={(e) => setModifierPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors"
              >
                حفظ الإضافة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
