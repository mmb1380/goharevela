export interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
  children: Category[]
  image: string | null
  icon: string
  description: string
  is_active: boolean
  order: number
}

export interface StoneType {
  id: number
  name: string
  slug: string
  description: string
  origin: string
  image: string | null
}

export interface ProductImage {
  id: number
  image: string
  alt_text: string
  is_primary: boolean
  order: number
}

export interface Product {
  id: number
  name: string
  slug: string
  category: { id: number; name: string; slug: string; icon?: string; image?: string | null } | null
  stone_type: { id: number; name: string; slug?: string } | null
  tags: { id: number; name: string; slug?: string }[]
  description?: string
  short_description?: string
  price: string
  compare_price: string | null
  discount_percent: number | null
  sku?: string
  weight?: string | null
  silver_weight?: string | null
  silver_grade?: string
  stock: number
  is_featured: boolean
  status: string
  is_available: boolean
  views_count?: number
  sales_count?: number
  images?: ProductImage[]
  primary_image: string | null
  average_rating: number | null
  reviews_count?: number
  created_at?: string
}

export interface Review {
  id: number
  user: { id: number; full_name: string }
  rating: number
  title: string
  body: string
  created_at: string
}

export interface CartProduct {
  id: number
  name: string
  slug: string
  price: string
  compare_price: string | null
  stock: number
  status: string
  primary_image: string | null
  category?: { id: number; name: string; slug: string }
}

export interface CartItem {
  id: number
  product: CartProduct
  quantity: number
  subtotal: number
}

export interface Cart {
  id: number
  items: CartItem[]
  item_count: number
  total: number
  updated_at: string
}

export interface Order {
  id: number
  order_number: string
  status: string
  status_display: string
  full_name: string
  phone: string
  address: string
  city: string
  subtotal: string
  shipping_cost: string
  total: string
  created_at: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  product_name: string
  price: string
  quantity: number
  subtotal: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
  phone: string
  address?: string
  city?: string
  postal_code?: string
  avatar?: string | null
  date_joined?: string
}

export interface ProductQueryParams {
  category?: string
  stone_type?: string
  min_price?: string
  max_price?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
  is_featured?: boolean
  status?: string
}

export interface OrderCreateData {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  payment_method: string
  notes?: string
}

export interface RegisterData {
  first_name: string
  last_name: string
  phone: string
  password: string
  password2: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  cover_image: string | null
  author: string
  created_at: string
  read_time: number
}
