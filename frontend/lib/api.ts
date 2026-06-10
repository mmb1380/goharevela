import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import {
  Cart,
  Category,
  HomePageData,
  Order,
  OrderCreateData,
  PaginatedResponse,
  Product,
  ProductQueryParams,
  RegisterData,
  Review,
  SiteConfig,
  StoneType,
  User,
} from '@/types'

// SSR (server) calls the backend locally to avoid mixed-content/hairpin-NAT issues;
// the browser uses a relative URL so it always matches the page's origin + protocol.
const BASE_URL =
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || 'http://127.0.0.1/api'
    : process.env.NEXT_PUBLIC_API_URL || '/api'

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })
          const newAccess = res.data.access
          localStorage.setItem('access_token', newAccess)
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async (
  params?: ProductQueryParams
): Promise<PaginatedResponse<Product>> => {
  const res = await api.get('/products/', { params })
  return res.data
}

export const getProduct = async (slug: string): Promise<Product> => {
  const res = await api.get(`/products/${slug}/`)
  return res.data
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products/', { params: { is_featured: true, page_size: 8 } })
  return res.data.results ?? res.data
}

export const getBestSellers = async (): Promise<Product[]> => {
  const res = await api.get('/products/', {
    params: { ordering: '-sales_count', page_size: 8 },
  })
  return res.data.results ?? res.data
}

export const getNewArrivals = async (): Promise<Product[]> => {
  const res = await api.get('/products/', {
    params: { ordering: '-created_at', page_size: 8 },
  })
  return res.data.results ?? res.data
}

export const getRelatedProducts = async (
  productId: number,
  categorySlug: string
): Promise<Product[]> => {
  const res = await api.get('/products/', {
    params: { category: categorySlug, page_size: 4 },
  })
  const results: Product[] = res.data.results ?? res.data
  return results.filter((p) => p.id !== productId)
}

export const getProductReviews = async (productId: number): Promise<Review[]> => {
  const res = await api.get(`/products/${productId}/reviews/`)
  return res.data.results ?? res.data
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get('/products/categories/')
  return res.data.results ?? res.data
}

export const getCategory = async (slug: string): Promise<Category> => {
  const res = await api.get(`/products/categories/${slug}/`)
  return res.data
}

// ─── Home page (Wagtail CMS) ────────────────────────────────────────────────

export const getHomePage = async (): Promise<HomePageData | null> => {
  try {
    const res = await api.get('/cms/pages/', {
      params: { type: 'cms.HomePage', fields: 'body', limit: 1 },
    })
    const items = res.data.items ?? []
    return items.length > 0 ? (items[0] as HomePageData) : null
  } catch {
    return null
  }
}

export const getSiteConfig = async (): Promise<SiteConfig | null> => {
  try {
    const res = await api.get('/site/config/')
    return res.data as SiteConfig
  } catch {
    return null
  }
}

// ─── Stone Types ──────────────────────────────────────────────────────────────

export const getStoneTypes = async (): Promise<StoneType[]> => {
  const res = await api.get('/products/stones/')
  return res.data.results ?? res.data
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getCart = async (): Promise<Cart> => {
  const res = await api.get('/orders/cart/')
  return res.data
}

export const addToCart = async (
  productId: number,
  quantity: number = 1
): Promise<Cart> => {
  const res = await api.post('/orders/cart/add/', { product_id: productId, quantity })
  return res.data
}

export const updateCartItem = async (
  itemId: number,
  quantity: number
): Promise<Cart> => {
  const res = await api.put(`/orders/cart/${itemId}/update/`, { quantity })
  return res.data
}

export const removeFromCart = async (itemId: number): Promise<Cart> => {
  const res = await api.delete(`/orders/cart/${itemId}/remove/`)
  return res.data
}

export const clearCart = async (): Promise<void> => {
  await api.delete('/orders/cart/clear/')
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export const createOrder = async (data: OrderCreateData): Promise<Order> => {
  const res = await api.post('/orders/orders/', data)
  return res.data
}

export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get('/orders/orders/')
  return res.data.results ?? res.data
}

export const getOrder = async (id: number): Promise<Order> => {
  const res = await api.get(`/orders/orders/${id}/`)
  return res.data
}

// Initiate online payment for a pending order; returns the gateway redirect URL.
export const initiatePayment = async (
  orderId: number
): Promise<{ redirect_url: string; message: string }> => {
  const res = await api.post(`/orders/orders/${orderId}/pay/`)
  return res.data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = async (
  phone: string,
  password: string
): Promise<{ access: string; refresh: string; user: unknown }> => {
  const res = await api.post('/accounts/login/', { phone, password })
  return res.data
}

export const register = async (data: RegisterData): Promise<User> => {
  const res = await api.post('/accounts/register/', data)
  return res.data
}

export const getProfile = async (): Promise<User> => {
  const res = await api.get('/accounts/profile/')
  return res.data
}

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const res = await api.patch('/accounts/profile/', data)
  return res.data
}

export const changePassword = async (data: {
  old_password: string
  new_password: string
  new_password2: string
}): Promise<void> => {
  await api.post('/accounts/change-password/', data)
}

export default api
