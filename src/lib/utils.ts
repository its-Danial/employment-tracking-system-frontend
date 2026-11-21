import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import i18n, { LOCALES } from '@/i18n'
import type { ISODateString } from '@/shared/utils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The tenant is identified by the subdomain the app is opened on (e.g. `al-hazam.example.com`).
 * `VITE_TENANT` overrides it for hosts without wildcard subdomains, like a staging URL.
 */
export const getTenantSubdomain = (): string =>
  import.meta.env.VITE_TENANT || window.location.hostname.split('.')[0]!

/**
 * Date-only strings ("2025-03-10") are read as local dates. `new Date()` would read them as UTC
 * midnight, which shows the previous day west of Greenwich.
 */
const toDate = (date: ISODateString | Date) => {
  if (typeof date !== 'string') return date
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  return dateOnly ? new Date(+dateOnly[1]!, +dateOnly[2]! - 1, +dateOnly[3]!) : new Date(date)
}

const currentDateLocale = () => LOCALES[i18n.global.locale.value].dateLocale

/**
 * Formats a date in the current language, e.g. "Mar 10, 2025" or "10 مارچ، 2025"
 */
export const formatBackendDateForDisplay = (date: ISODateString | Date): string => {
  const dateObj = toDate(date)
  return dateObj.toLocaleDateString(currentDateLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Day and month only, for dates in the near past or future, e.g. "Mar 10"
 */
export const formatShortDate = (date: ISODateString | Date): string =>
  toDate(date).toLocaleDateString(currentDateLocale(), { month: 'short', day: 'numeric' })

/**
 * "3 days ago", "in 2 weeks", "yesterday", in the current language
 */
export function formatRelativeTime(date: ISODateString | Date): string {
  const seconds = (toDate(date).getTime() - Date.now()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat(currentDateLocale(), { numeric: 'auto' })
  const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size) ?? ['minute', 60]
  return formatter.format(Math.round(seconds / size), unit)
}

/** Whole years between a birth date and today */
export function ageFrom(birthDate: ISODateString): number {
  const birth = toDate(birthDate)
  const today = new Date()
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  return today.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1)
}

/** Up to two initials, e.g. "Usman Akhtar" → "UA" */
export const initialsOf = (name = '') =>
  name
    .replace(/\(.*?\)/g, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('')

/** A picked date as the API's `YYYY-MM-DD`, using the local calendar day (not UTC) */
export const toApiDate = (date: Date): ISODateString =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('-')

/** The API's `YYYY-MM-DD` as a Date for date pickers */
export const fromApiDate = (date: ISODateString | null | undefined) => (date ? toDate(date) : null)

/**
 * A date picker value as a Date. Inside a PrimeVue Form a typed date arrives as the text
 * ("12/04/1995", dd/mm/yyyy), a picked one as a Date. Anything that isn't a real day is null.
 */
export function parsePickedDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value !== 'string') return null
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim())
  if (!match) return null
  const [day, month, year] = [+match[1]!, +match[2]!, +match[3]!]
  const date = new Date(year, month - 1, day)
  // Rejects days that roll over, like 31/02
  return date.getDate() === day && date.getMonth() === month - 1 ? date : null
}

/** Whole rupees, e.g. "Rs 250,000" */
export const formatMoney = (amount: number) =>
  new Intl.NumberFormat(currentDateLocale(), {
    style: 'currency',
    currency: 'PKR',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount)
