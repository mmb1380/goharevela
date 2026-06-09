import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'red' | 'green' | 'blue' | 'gray' | 'dark'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'gold',
  size = 'sm',
  className,
}: BadgeProps) {
  const variants = {
    gold: 'bg-gold text-white',
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    gray: 'bg-gray-100 text-gray-700',
    dark: 'bg-dark text-white',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <Badge variant="red" className="font-bold">
      {percent}٪ تخفیف
    </Badge>
  )
}

export function NewBadge() {
  return <Badge variant="green">جدید</Badge>
}

export function FeaturedBadge() {
  return <Badge variant="gold">ویژه</Badge>
}

export function OutOfStockBadge() {
  return <Badge variant="gray">ناموجود</Badge>
}

export default Badge
