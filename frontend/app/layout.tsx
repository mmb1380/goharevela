import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/layout/CartSidebar'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | گوهر ولا',
    default: 'گوهر ولا - زیورآلات نقره اصیل ایرانی',
  },
  description:
    'گوهر ولا با بیش از ۷۰ سال سابقه، عرضه‌کننده بهترین زیورآلات نقره اصیل ایرانی.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased min-h-screen flex flex-col bg-white">
        <Header />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartSidebar />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Vazirmatn, Tahoma, sans-serif',
              direction: 'rtl',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
