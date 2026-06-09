'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  login as apiLogin,
  getProfile,
} from './api'
import { Cart, User } from '@/types'

// ─── Cart Store ───────────────────────────────────────────────────────────────

interface CartStore {
  cart: Cart | null
  isOpen: boolean
  isLoading: boolean
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  openCart: () => void
  closeCart: () => void
  setCart: (cart: Cart) => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const cart = await getCart()
      set({ cart, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addItem: async (productId: number, quantity: number = 1) => {
    set({ isLoading: true })
    try {
      const cart = await addToCart(productId, quantity)
      set({ cart, isLoading: false, isOpen: true })
      toast.success('محصول به سبد خرید اضافه شد', {
        style: {
          fontFamily: 'Vazirmatn, sans-serif',
          direction: 'rtl',
        },
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('خطا در افزودن محصول به سبد خرید', {
        style: {
          fontFamily: 'Vazirmatn, sans-serif',
          direction: 'rtl',
        },
      })
      throw error
    }
  },

  updateItem: async (itemId: number, quantity: number) => {
    set({ isLoading: true })
    try {
      const cart = await updateCartItem(itemId, quantity)
      set({ cart, isLoading: false })
    } catch {
      set({ isLoading: false })
      toast.error('خطا در بروزرسانی سبد خرید', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    }
  },

  removeItem: async (itemId: number) => {
    set({ isLoading: true })
    try {
      const cart = await removeFromCart(itemId)
      set({ cart, isLoading: false })
      toast.success('محصول از سبد خرید حذف شد', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } catch {
      set({ isLoading: false })
      toast.error('خطا در حذف محصول', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setCart: (cart: Cart) => set({ cart }),
}))

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true })
        try {
          const tokens = await apiLogin(phone, password)
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', tokens.access)
            localStorage.setItem('refresh_token', tokens.refresh)
          }
          const user = await getProfile()
          set({ user, isAuthenticated: true, isLoading: false })
          toast.success('ورود موفقیت‌آمیز', {
            style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
        set({ user: null, isAuthenticated: false })
        toast.success('از حساب کاربری خارج شدید', {
          style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
        })
      },

      fetchUser: async () => {
        if (typeof window === 'undefined') return
        const token = localStorage.getItem('access_token')
        if (!token) return
        set({ isLoading: true })
        try {
          const user = await getProfile()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ isLoading: false, isAuthenticated: false, user: null })
        }
      },

      setUser: (user: User) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
)
