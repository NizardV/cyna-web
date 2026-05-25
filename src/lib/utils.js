import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)
}

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    day: "numeric", month: "long", year: "numeric",
  })
}

export function getYear(isoDate) {
  return new Date(isoDate).getFullYear()
}

/**
 * Formate un prix mensuel en euros.
 * @param {number} price
 * @returns {string}
 */
export function formatMonthlyPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Construit la liste des numéros de pages à afficher dans la pagination.
 * Insère `null` pour représenter les ellipses.
 *
 * @param {number} current - Page courante (base 1)
 * @param {number} total   - Nombre total de pages
 * @returns {(number|null)[]}
 */
export function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, current])
  if (current > 1) pages.add(current - 1)
  if (current < total) pages.add(current + 1)

  const sorted = [...pages].sort((a, b) => a - b)
  const result = []

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null)
    result.push(sorted[i])
  }

  return result
}