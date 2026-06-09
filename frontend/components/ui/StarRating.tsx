'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }

  const currentRating = interactive && hovered > 0 ? hovered : rating

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const filled = starValue <= currentRating
        const halfFilled =
          !filled && starValue - 0.5 <= currentRating

        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(starValue) : undefined}
            onMouseEnter={interactive ? () => setHovered(starValue) : undefined}
            onMouseLeave={interactive ? () => setHovered(0) : undefined}
            className={cn(
              'relative',
              interactive ? 'cursor-pointer' : 'cursor-default'
            )}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizes[size],
                'transition-colors',
                filled || halfFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200',
                interactive && 'hover:fill-amber-300 hover:text-amber-300'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

interface RatingDisplayProps {
  rating: number | null
  reviewsCount?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RatingDisplay({
  rating,
  reviewsCount,
  size = 'sm',
  className,
}: RatingDisplayProps) {
  if (rating === null || rating === undefined) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <StarRating rating={0} size={size} />
        <span className="text-xs text-gray-400">بدون نظر</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <StarRating rating={rating} size={size} />
      <span className="text-xs text-gray-500">
        ({reviewsCount ?? 0} نظر)
      </span>
    </div>
  )
}

export default StarRating
