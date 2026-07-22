export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          name: string
          subdomain: string
          logo_url: string | null
          cover_url: string | null
          primary_color: string
          whatsapp_number: string | null
          delivery_fee: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          logo_url?: string | null
          cover_url?: string | null
          primary_color?: string
          whatsapp_number?: string | null
          delivery_fee?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          logo_url?: string | null
          cover_url?: string | null
          primary_color?: string
          whatsapp_number?: string | null
          delivery_fee?: number
          is_active?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          created_at?: string
        }
      }
      item_modifiers: {
        Row: {
          id: string
          item_id: string
          title: string
          price: number
          type: 'variant' | 'addon'
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          title: string
          price?: number
          type?: 'variant' | 'addon'
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          title?: string
          price?: number
          type?: 'variant' | 'addon'
          created_at?: string
        }
      }
    }
  }
}

export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type ItemModifier = Database['public']['Tables']['item_modifiers']['Row']

export interface CartModifier {
  id: string
  title: string
  price: number
  type: 'variant' | 'addon'
}

export interface CartItem {
  cartId: string
  item: MenuItem
  selectedVariant?: CartModifier | null
  selectedAddons: CartModifier[]
  quantity: number
  specialInstructions?: string
  unitPrice: number
  totalPrice: number
}

export interface CustomerInfo {
  fullName: string
  phone: string
  address: string
  deliveryNotes?: string
}
