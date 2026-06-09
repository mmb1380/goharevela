'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-gold text-white hover:bg-gold-dark active:bg-gold-dark shadow-md hover:shadow-lg',
        secondary:
          'bg-dark text-white hover:bg-gray-800 active:bg-gray-900 shadow-md hover:shadow-lg',
        outline:
          'border-2 border-gold text-gold bg-transparent hover:bg-gold hover:text-white',
        ghost:
          'text-gold hover:bg-gold/10 active:bg-gold/20',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
        light:
          'bg-white text-dark hover:bg-gray-100 border border-gray-200',
      },
      size: {
        sm: 'text-sm px-3 py-1.5 h-8',
        md: 'text-sm px-4 py-2 h-10',
        lg: 'text-base px-6 py-3 h-12',
        xl: 'text-lg px-8 py-4 h-14',
        icon: 'w-10 h-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, disabled, children, leftIcon, rightIcon, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon ? rightIcon : null}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button
