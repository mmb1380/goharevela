'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Phone, Lock, LogIn } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { login, isLoading } = useAuthStore()

  const [form, setForm] = useState({ phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.phone.trim()) {
      errs.phone = 'شماره موبایل الزامی است'
    } else if (!/^09[0-9]{9}$/.test(form.phone)) {
      errs.phone = 'فرمت شماره موبایل صحیح نیست'
    }
    if (!form.password) errs.password = 'رمز عبور الزامی است'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      await login(form.phone, form.password)
      router.push(redirect)
    } catch {
      setServerError('شماره موبایل یا رمز عبور اشتباه است')
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
          <h1 className="text-xl font-bold text-dark mb-2">ورود به حساب کاربری</h1>
          <p className="text-gray-500 text-sm mb-8">
            به گوهر ولا خوش آمدید
          </p>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4 mb-5 text-center">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="رمز عبور خود را وارد کنید"
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

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-gold hover:text-gold-dark transition-colors"
              >
                فراموشی رمز عبور؟
              </Link>
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
                  <LogIn className="w-5 h-5" />
                  ورود
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              حساب کاربری ندارید؟{' '}
              <Link
                href="/auth/register"
                className="text-gold hover:text-gold-dark font-medium transition-colors"
              >
                ثبت‌نام کنید
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          با ورود به حساب، با{' '}
          <Link href="/terms" className="text-gold hover:underline">
            قوانین و مقررات
          </Link>{' '}
          موافقت می‌کنید.
        </p>
      </div>
    </div>
  )
}
