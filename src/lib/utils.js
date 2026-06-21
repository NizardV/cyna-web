import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fusionne des classes Tailwind CSS en résolvant les conflits.
 * Combine clsx (valeurs conditionnelles) et tailwind-merge (déduplication).
 *
 * @param {...import('clsx').ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un montant en euros selon la locale française.
 * @param {number} amount
 * @returns {string} Ex : « 12,50 € »
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)
}

/**
 * Formate une date ISO en chaîne lisible selon la locale du navigateur.
 * @param {string} isoDate - Date au format ISO 8601
 * @returns {string} Ex : « 12 juin 2025 »
 */
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    day: "numeric", month: "long", year: "numeric",
  })
}

/**
 * Extrait l'année d'une date ISO.
 * @param {string} isoDate
 * @returns {number}
 */
export function getYear(isoDate) {
  return new Date(isoDate).getFullYear()
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

/**
 * Mappe un statut produit vers les props de Badge et la clé i18n associée.
 * @param {"available"|"out_of_stock"|"unavailable"|string} status
 * @returns {{ variant: string, labelKey: string }}
 */
export function getStatusBadge(status) {
  switch (status) {
    case "available":
      return { variant: "default", labelKey: "product.available" }
    case "out_of_stock":
      return { variant: "outline", labelKey: "product.outOfStock" }
    case "unavailable":
    default:
      return { variant: "destructive", labelKey: "product.unavailable" }
  }
}