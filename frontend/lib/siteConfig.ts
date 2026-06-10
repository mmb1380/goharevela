import { getSiteConfig } from './api'
import type { SiteConfig } from '@/types'

// کش سمت کلاینت: تنظیمات سایت فقط یک‌بار در طول بازدید fetch می‌شود.
let cached: Promise<SiteConfig | null> | null = null

export function loadSiteConfig(): Promise<SiteConfig | null> {
  if (!cached) {
    cached = getSiteConfig()
  }
  return cached
}
