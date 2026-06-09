'use client'

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice, getImageUrl, toPersianDigits } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function CartSidebar() {
  const { cart, isOpen, isLoading, closeCart, updateItem, removeItem } = useCartStore()

  if (!isOpen) return null

  const items = cart?.items ?? []

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-dark text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h2 className="font-bold text-lg">سبد خرید</h2>
            {cart && cart.item_count > 0 && (
              <span className="bg-gold text-white text-xs px-2 py-0.5 rounded-full">
                {toPersianDigits(cart.item_count.toString())} کالا
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <ShoppingBag className="w-20 h-20 text-gray-200" />
              <h3 className="text-lg font-medium text-gray-600">
                سبد خرید شما خالی است
              </h3>
              <p className="text-sm text-gray-400">
                محصولات مورد علاقه خود را به سبد اضافه کنید
              </p>
              <Button
                variant="primary"
                onClick={closeCart}
                rightIcon={<ArrowLeft className="w-4 h-4" />}
              >
                ادامه خرید
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={getImageUrl(item.product.primary_image)}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-dark hover:text-gold transition-colors line-clamp-2 mb-1 block"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-400 mb-2">
                      {item.product.category?.name}
                    </p>
                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateItem(item.id, item.quantity - 1)
                              : removeItem(item.id)
                          }
                          disabled={isLoading}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">
                          {toPersianDigits(item.quantity.toString())}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= item.product.stock}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gold">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading}
                    className="text-gray-300 hover:text-red-500 transition-colors self-start mt-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">جمع کل:</span>
              <span className="text-xl font-bold text-gold">
                {formatPrice(cart?.total ?? 0)}
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              هزینه ارسال در مرحله بعد محاسبه می‌شود
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-gold text-white text-center py-3 rounded-xl font-medium hover:bg-gold-dark transition-colors"
            >
              تکمیل سفارش
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full bg-white text-dark text-center py-2.5 rounded-xl font-medium border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
            >
              مشاهده سبد خرید
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
