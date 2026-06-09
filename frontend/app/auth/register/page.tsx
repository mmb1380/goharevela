'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Phone, Lock, User, UserPlus } from 'lucide-react'
import { register } from '@/lib/api'
import toast from 'react-hot-toast'

interface FormData {
  first_name: string
  last_name: string
  phone: string
  password: string
  password2: string
  terms: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password2: '',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {}

    if (!form.first_name.trim()) errs.first_name = 'نام الزامی است'
    if (!form.last_name.trim()) errs.last_name = 'نام خانوادگی الزامی است'

    if (!form.phone.trim()) {
      errs.phone = 'شماره موبایل الزامی است'
    } else if (!/^09[0-9]{9}$/.test(form.phone)) {
      errs.phone = 'فرمت شماره موبایل صحیح نیست (مثال: 09123456789)'
    }

    if (!form.password) {
      errs.password = 'رمز عبور الزامی است'
    } else if (form.password.length < 8) {
      errs.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد'
    }

    if (!form.password2) {
      errs.password2 = 'تکرار رمز عبور الزامی است'
    } else if (form.password !== form.password2) {
      errs.password2 = 'رمزهای عبور با هم مطابقت ندارند'
    }

    if (!form.terms) errs.terms = 'موافقت با قوانین الزامی است'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setIsLoading(true)
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        password: form.password,
        password2: form.password2,
      })
      toast.success('ثبت‌نام موفقیت‌آمیز! لطفا وارد شوید.', {
        style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
      })
      router.push('/auth/login')
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } }
      if (axiosError?.response?.data) {
        const data = axiosError.response.data
        if (typeof data === 'object') {
          const firstError = Object.values(data)[0]
          setServerError(
            Array.isArray(firstError) ? firstError[0] as string : String(firstError)
          )
        }
      } else {
        setServerError('خطا در ثبت‌نام. لطفا دوباره تلاش کنید.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <span className="text-5xl">💎</span>
            <span className="text-2xl font-bold text-dark">گوهر ولا</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-dark mb-2">ایجاد حساب کاربری</h1>
          <p className="text-gray-500 text-sm mb-8">
            عضویت رایگان — خرید آسان و سریع
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4 mb-5 text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block font-medium">نام</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="نام"
                    className={`w-full border rounded-xl pr-9 pl-3 py-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all ${
                      errors.first_name ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                  نام خانوادگی
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="نام خانوادگی"
                  className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all ${
                    errors.last_name ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                شماره موبایل
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="09123456789"
                  dir="ltr"
                  className={`w-full border rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all ${
                    errors.phone ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block font-medium">رمز عبور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="حداقل ۸ کاراکتر"
                  className={`w-full border rounded-xl pr-10 pl-10 py-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all ${
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                تکرار رمز عبور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword2 ? 'text' : 'password'}
                  value={form.password2}
                  onChange={(e) => setForm({ ...form, password2: e.target.value })}
                  placeholder="رمز عبور را مجددا وارد کنید"
                  className={`w-full border rounded-xl pr-10 pl-10 py-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all ${
                    errors.password2 ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password2 && (
                <p className="text-red-500 text-xs mt-1">{errors.password2}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 accent-gold rounded"
                />
                <span className="text-sm text-gray-600 leading-6">
                  با{' '}
                  <Link href="/terms" className="text-gold hover:underline">
                    قوانین و مقررات
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-gold hover:underline">
                    حریم خصوصی
                  </Link>{' '}
                  گوهر ولا موافقم
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gold text-white py-3.5 rounded-xl font-medium text-base hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-gold/25 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  ثبت‌نام
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link
                href="/auth/login"
                className="text-gold hover:text-gold-dark font-medium transition-colors"
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
