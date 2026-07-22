# Supabase SQL Schema for Multi-Tenant E-Menu SaaS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#000000',
    whatsapp_number TEXT,
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ITEM MODIFIERS TABLE (Variants & Addons)
CREATE TABLE IF NOT EXISTS public.item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('variant', 'addon')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_restaurants_subdomain ON public.restaurants(subdomain);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON public.categories(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_item_modifiers_item_id ON public.item_modifiers(item_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_modifiers ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Allow customers to view active restaurant menus)
CREATE POLICY "Public can view active restaurants" 
    ON public.restaurants FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Public can view categories of active restaurants" 
    ON public.categories FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants 
            WHERE id = categories.restaurant_id AND is_active = true
        )
    );

CREATE POLICY "Public can view menu items of active categories" 
    ON public.menu_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.categories c
            JOIN public.restaurants r ON r.id = c.restaurant_id
            WHERE c.id = menu_items.category_id AND r.is_active = true
        )
    );

CREATE POLICY "Public can view modifiers for menu items" 
    ON public.item_modifiers FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.menu_items m
            JOIN public.categories c ON c.id = m.category_id
            JOIN public.restaurants r ON r.id = c.restaurant_id
            WHERE m.id = item_modifiers.item_id AND r.is_active = true
        )
    );

-- SEED DATA FOR TESTING
INSERT INTO public.restaurants (id, name, subdomain, logo_url, cover_url, primary_color, whatsapp_number, delivery_fee)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    'برجر هاوس - Burger House',
    'burger',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    '#E11D48',
    '+966500000000',
    15.00
) ON CONFLICT (subdomain) DO NOTHING;

INSERT INTO public.categories (id, restaurant_id, name, sort_order)
VALUES 
    ('c1b2c3d4-e5f6-7890-abcd-1234567890a1', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'البرجر المميز', 1),
    ('c1b2c3d4-e5f6-7890-abcd-1234567890a2', 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', 'المقبلات والمشروبات', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_items (id, category_id, name, description, price, image_url, is_available)
VALUES 
    (
        'm1b2c3d4-e5f6-7890-abcd-1234567890m1',
        'c1b2c3d4-e5f6-7890-abcd-1234567890a1',
        'كلاسيك برجر لجم',
        'شريحة لحم أنجوس مشوية، جبنة شيدر ذائبة، خَس طازج، مخلل، وصوص خاص',
        38.00,
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        true
    ),
    (
        'm1b2c3d4-e5f6-7890-abcd-1234567890m2',
        'c1b2c3d4-e5f6-7890-abcd-1234567890a1',
        'تريبل دبل برجر',
        'شريحتان من اللحم المشوي، جبن دوبل، بصل مكرمل وصوص الشواء المميز',
        45.00,
        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
        true
    )
ON CONFLICT DO NOTHING;

INSERT INTO public.item_modifiers (id, item_id, title, price, type)
VALUES 
    ('x1b2c3d4-e5f6-7890-abcd-1234567890x1', 'm1b2c3d4-e5f6-7890-abcd-1234567890m1', 'حجم كبير (وجبة)', 12.00, 'variant'),
    ('x1b2c3d4-e5f6-7890-abcd-1234567890x2', 'm1b2c3d4-e5f6-7890-abcd-1234567890m1', 'إضافة جبنة شيدر إضافية', 5.00, 'addon'),
    ('x1b2c3d4-e5f6-7890-abcd-1234567890x3', 'm1b2c3d4-e5f6-7890-abcd-1234567890m1', 'إضافة بيكن بقر مقرمش', 7.00, 'addon')
ON CONFLICT DO NOTHING;
