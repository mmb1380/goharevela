'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, CreditCard, Wallet, MapPin, User, Phone, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useAuthStore } from '@/lib/store'
import { createOrder } from '@/lib/api'
import { formatPrice, toPersianDigits } from '@/lib/utils'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface FormData {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  payment_method: 'online' | 'card_to_card'
  notes: string
}

const steps = [
  { id: 1, label: 'اطلاعات ارسال' },
  { id: 2, label: 'روش پرداخت' },
  { id: 3, label: 'تایید سفارش' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, fetchCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)

  const [form, setForm] = useState<FormData>({
    full_name: user ? `${user.first_name} ${user.last_name}`.trim() : '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: '',
    payment_method: 'online',
    notes: '',
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    fetchCart()
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout')
    }
  }, [fetchCart, isAuthenticated, router])

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'نام و نام خانوادگی الزامی است'
    if (!form.phone.trim()) {
      newErrors.phone = 'شماره موبایل الزامی است'
    } else if (!/^09[0-9]{9}$/.test(form.phone)) {
      newErrors.phone = 'فرمت شماره موبایل صحیح نیست (مثال: 09123456789)'
    }
    if (!form.address.trim()) newErrors.address = 'آدرس الزامی است'
    if (!form.city.trim()) newErrors.city = 'شهر الزامی است'
    if (!form.postal_code.trim()) {
      newErrors.postal_code = 'کد پستی الزامی است'
    } else if (!/^[0-9]{10}$/.test(form.postal_code)) {
      newErrors.postal_code = 'کد پستی باید ۱۰ رقم باشد'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1 = () => {
    if (validate()) setCurrentStep(2)
  }

  const handleStep2 = () => {
    setCurrentStep(3)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const order = await createOrder({
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        payment_method: form.payment_method,
        notes: form.notes,
      })
      setOrderId(order.id)
      setCurrentStep(4)
      toast.success('سفارش شما با موفقیت ثبت شد!', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } catch {
      toast.error('خطا در ثبت سفارش. لطفا دوباره تلاش کنید.', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const items = cart?.items ?? []
  const cartTotal = cart?.total ?? 0
  const shipping = cartTotal >= 500000 ? 0 : 30000
  const total = cartTotal + shipping

  // Success state
  if (currentStep === 4 && orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-dark mb-3">سفارش ثبت شد!</h1>
          <p className="text-gray-500 mb-2">سفارش شما با موفقیت ثبت گردید.</p>
          <p className="text-sm text-gray-400 mb-8">
            شماره سفارش: <strong className="text-dark">#{toPersianDigits(orderId.toString())}</strong>
          </p>
          <div className="space-y-3">
            <Link
              href="/profile"
              className="block w-full bg-gold text-white py-3.5 rounded-xl font-medium hover:bg-gold-dark transition-colors"
            >
              مشاهده سفارش
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-100 text-dark py-3.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-dark">تکمیل سفارش</h1>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-0 max-w-2xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-gold text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      toPersianDigits(step.id.toString())
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 whitespace-nowrap ${
                      currentStep === step.id ? 'text-gold font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-20px] transition-colors ${
                      currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gold" />
                  اطلاعات ارسال
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 mb-1.5 block">
                      نام و نام خانوادگی <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                        placeholder="نام و نام خانوادگی خود را وارد کنید"
                        className={`w-full border rounded-xl pr-9 pl-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors ${
                          errors.full_name ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">
                      شماره موبایل <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="09123456789"
                        dir="ltr"
                        className={`w-full border rounded-xl pr-9 pl-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors ${
                          errors.phone ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">
                      شهر <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="شهر"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors ${
                        errors.city ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 mb-1.5 block">
                      آدرس کامل <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="آدرس دقیق خود را وارد کنید"
                      rows={3}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none ${
                        errors.address ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">
                      کد پستی <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.postal_code}
                      onChange={(e) =>
                        setForm({ ...form, postal_code: e.target.value })
                      }
                      placeholder="1234567890"
                      dir="ltr"
                      maxLength={10}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors ${
                        errors.postal_code ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {errors.postal_code && (
                      <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 mb-1.5 block">
                      توضیحات سفارش (اختیاری)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="توضیحات یا درخواست خاص..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleStep1}
                    className="flex items-center gap-2 bg-gold text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gold-dark transition-colors"
                  >
                    مرحله بعد
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold" />
                  روش پرداخت
                </h2>

                <div className="space-y-3 mb-8">
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      form.payment_method === 'online'
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={form.payment_method === 'online'}
                      onChange={() => setForm({ ...form, payment_method: 'online' })}
                      className="w-4 h-4 accent-gold"
                    />
                    <CreditCard className="w-6 h-6 text-gold" />
                    <div>
                      <div className="font-medium text-dark">پرداخت آنلاین</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        از طریق درگاه بانکی معتبر — پرداخت فوری
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      form.payment_method === 'card_to_card'
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card_to_card"
                      checked={form.payment_method === 'card_to_card'}
                      onChange={() =>
                        setForm({ ...form, payment_method: 'card_to_card' })
                      }
                      className="w-4 h-4 accent-gold"
                    />
                    <Wallet className="w-6 h-6 text-gold" />
                    <div>
                      <div className="font-medium text-dark">کارت به کارت</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        واریز مستقیم به حساب — پردازش دستی توسط تیم ما
                      </div>
                    </div>
                  </label>
                </div>

                {form.payment_method === 'card_to_card' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
                    <p className="font-medium mb-1">شماره کارت برای واریز:</p>
                    <p className="font-mono text-base" dir="ltr">
                      6037-9970-1234-5678
                    </p>
                    <p className="mt-1 text-xs">به نام: علی اصغر کیانی</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    مرحله قبل
                  </button>
                  <button
                    onClick={handleStep2}
                    className="flex items-center gap-2 bg-gold text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gold-dark transition-colors"
                  >
                    مرحله بعد
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                  <Check className="w-5 h-5 text-gold" />
                  تایید سفارش
                </h2>

                {/* Shipping Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-medium text-dark text-sm mb-3">اطلاعات ارسال</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">نام: </span>
                      <span className="text-dark">{form.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">موبایل: </span>
                      <span className="text-dark">{form.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">آدرس: </span>
                      <span className="text-dark">
                        {form.city}، {form.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-medium text-dark text-sm mb-2">روش پرداخت</h3>
                  <p className="text-sm text-gray-600">
                    {form.payment_method === 'online' ? '💳 پرداخت آنلاین' : '🏦 کارت به کارت'}
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    مرحله قبل
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    ثبت نهایی سفارش
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-36">
              <h2 className="font-bold text-dark mb-5 pb-3 border-b border-gray-100">
                سفارش شما
              </h2>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image
                        src={getImageUrl(item.product.primary_image)}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-dark line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {toPersianDigits(item.quantity.toString())} عدد
                      </p>
                    </div>
                    <p className="text-xs font-bold text-gold whitespace-nowrap">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">جمع:</span>
                  <span>{formatPrice(cart?.total ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ارسال:</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'رایگان' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2.5">
                  <span>مجموع:</span>
                  <span className="text-gold">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
