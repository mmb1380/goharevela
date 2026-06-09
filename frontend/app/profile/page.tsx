'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Package,
  Lock,
  LogOut,
  Phone,
  MapPin,
  Building2,
  Mail,
  Save,
  Eye,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { getOrders, updateProfile, changePassword } from '@/lib/api'
import { Order } from '@/types'
import { formatPrice, getPersianDate, getStatusLabel, toPersianDigits } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Tab = 'profile' | 'orders' | 'password'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, fetchUser, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/profile')
      return
    }
    fetchUser()
  }, [isAuthenticated, fetchUser, router])

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      })
    }
  }, [user])

  const loadOrders = async () => {
    if (orders.length > 0) return
    setOrdersLoading(true)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch {
      toast.error('خطا در بارگذاری سفارشات', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'orders') loadOrders()
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const updated = await updateProfile(profileForm)
      setUser(updated)
      toast.success('پروفایل با موفقیت بروزرسانی شد', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } catch {
      toast.error('خطا در بروزرسانی پروفایل', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password2) {
      toast.error('رمزهای عبور جدید با هم مطابقت ندارند', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword(passwordForm)
      setPasswordForm({ old_password: '', new_password: '', new_password2: '' })
      toast.success('رمز عبور با موفقیت تغییر یافت', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } catch {
      toast.error('رمز عبور فعلی اشتباه است', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'اطلاعات من', icon: <User className="w-4 h-4" /> },
    { id: 'orders' as Tab, label: 'سفارشات', icon: <Package className="w-4 h-4" /> },
    { id: 'password' as Tab, label: 'تغییر رمز', icon: <Lock className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user.first_name?.[0] || user.username?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-400 text-sm">{user.phone}</p>
            </div>
            <button
              onClick={handleLogout}
              className="mr-auto flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                    activeTab === tab.id
                      ? 'bg-gold text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-dark mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-gold" />
                  اطلاعات شخصی
                </h2>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block font-medium">نام</label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, first_name: e.target.value })
                        }
                        placeholder="نام"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                        نام خانوادگی
                      </label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, last_name: e.target.value })
                        }
                        placeholder="نام خانوادگی"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gold" />
                        شماره موبایل
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        dir="ltr"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gold" />
                        ایمیل
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        dir="ltr"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1.5 block font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gold" />
                        شهر
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, city: e.target.value })
                        }
                        placeholder="شهر محل سکونت"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      آدرس
                    </label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, address: e.target.value })
                      }
                      placeholder="آدرس کامل محل سکونت"
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-medium hover:bg-gold-dark transition-colors disabled:opacity-50"
                    >
                      {profileLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      ذخیره تغییرات
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-dark mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gold" />
                  سفارشات من
                </h2>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">هنوز سفارشی ثبت نکرده‌اید</p>
                    <Link
                      href="/products"
                      className="inline-block mt-4 text-gold hover:text-gold-dark text-sm font-medium"
                    >
                      شروع خرید
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = getStatusLabel(order.status)
                      return (
                        <div
                          key={order.id}
                          className="border border-gray-100 rounded-xl p-5 hover:border-gold/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                            <div>
                              <p className="font-bold text-dark text-sm">
                                سفارش #{toPersianDigits(order.order_number)}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {getPersianDate(order.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                              <Link
                                href={`/orders/${order.id}`}
                                className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                جزئیات
                              </Link>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm text-gray-600"
                              >
                                <span className="truncate flex-1 ml-4">
                                  {item.product_name}
                                  <span className="text-gray-400 mr-1">
                                    ×{toPersianDigits(item.quantity.toString())}
                                  </span>
                                </span>
                                <span className="font-medium whitespace-nowrap">
                                  {formatPrice(item.subtotal)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                            <span className="text-sm text-gray-500">مجموع:</span>
                            <span className="font-bold text-gold text-base">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-dark mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gold" />
                  تغییر رمز عبور
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                      رمز عبور فعلی
                    </label>
                    <input
                      type="password"
                      value={passwordForm.old_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, old_password: e.target.value })
                      }
                      placeholder="رمز عبور فعلی را وارد کنید"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                      رمز عبور جدید
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      placeholder="حداقل ۸ کاراکتر"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                      تکرار رمز عبور جدید
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password2}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password2: e.target.value })
                      }
                      placeholder="رمز عبور جدید را مجددا وارد کنید"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                    <p className="font-medium mb-1">نکات امنیتی:</p>
                    <ul className="space-y-1 text-xs list-disc list-inside">
                      <li>حداقل ۸ کاراکتر</li>
                      <li>ترکیب حروف و اعداد توصیه می‌شود</li>
                      <li>از رمزهای قابل حدس پرهیز کنید</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-xl font-medium hover:bg-gold-dark transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    تغییر رمز عبور
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
