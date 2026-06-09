'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Tag } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice, getImageUrl, toPersianDigits } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const items = cart?.items ?? []

  if (isLoading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 text-center px-4">
        <ShoppingBag className="w-24 h-24 text-gray-200" />
        <h1 className="text-2xl font-bold text-dark">سبد خرید خالی است</h1>
        <p className="text-gray-500 max-w-sm">
          هنوز چیزی به سبد خرید اضافه نکرده‌اید. محصولات مورد علاقه‌تان را پیدا کنید!
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 bg-gold text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gold-dark transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          ادامه خرید
        </Link>
      </div>
    )
  }

  const cartTotal = cart?.total ?? 0
  const shipping = cartTotal >= 500000 ? 0 : 30000
  const total = cartTotal + shipping

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-dark flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-gold" />
            سبد خرید
            <span className="text-base font-normal text-gray-400">
              ({toPersianDigits(items.length.toString())} محصول)
            </span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4 hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={getImageUrl(item.product.primary_image)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-medium text-dark hover:text-gold transition-colors text-sm md:text-base line-clamp-2 mb-1 block"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400 mb-3">{item.product.category?.name}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem(item.id, item.quantity - 1)
                            : removeItem(item.id)
                        }
                        disabled={isLoading}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">
                        {toPersianDigits(item.quantity.toString())}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= item.product.stock}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-left">
                      <p className="text-lg font-bold text-gold">
                        {formatPrice(item.subtotal)}
                      </p>
                      <p className="text-xs text-gray-400">
                        هر عدد: {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isLoading}
                  className="text-gray-300 hover:text-red-500 transition-colors self-start disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              ادامه خرید
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-36">
              <h2 className="font-bold text-dark text-lg mb-6 pb-3 border-b border-gray-100">
                خلاصه سفارش
              </h2>

              {/* Coupon */}
              <div className="mb-6">
                <label className="text-sm text-gray-600 mb-2 block">کد تخفیف</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="کد تخفیف را وارد کنید"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button className="bg-dark text-white px-4 py-2.5 rounded-xl text-sm hover:bg-gold transition-colors flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    اعمال
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">جمع محصولات:</span>
                  <span className="font-medium">{formatPrice(cart?.total ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">هزینه ارسال:</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'رایگان 🎉' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2.5">
                    برای ارسال رایگان، {formatPrice(500000 - cartTotal)} دیگر خرید کنید
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-dark">مبلغ قابل پرداخت:</span>
                  <span className="text-xl font-bold text-gold">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full block bg-gold text-white text-center py-4 rounded-xl font-medium text-base hover:bg-gold-dark transition-colors shadow-lg hover:shadow-gold/25"
              >
                تکمیل سفارش
              </Link>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                <span>🔒 پرداخت امن</span>
                <span>🏅 ضمانت اصالت</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
