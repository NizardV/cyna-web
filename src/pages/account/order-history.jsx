/**
 * @file pages/account/order-history.jsx
 * @description Page "Historique des commandes" — liste toutes les commandes
 * et abonnements de l'utilisateur, groupées par année, avec téléchargement de facture.
 */

import { useEffect, useState } from "react"
import { Layout } from "@/components/ui/layout/layout"
import { AccountNav } from "@/components/ui/account/account-nav"
import { getAccountOrders } from "@/api/orders.js"
import { getMe } from "@/api/user.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formate un montant en euros.
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

/**
 * Formate une date ISO en date française lisible.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Extrait l'année d'une date ISO.
 * @param {string} isoDate
 * @returns {number}
 */
function getYear(isoDate) {
  return new Date(isoDate).getFullYear()
}

// ---------------------------------------------------------------------------
// Composant StatusBadge
// ---------------------------------------------------------------------------

/** @type {Record<string, string>} */
const STATUS_STYLES = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  terminated:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  refunded:
    "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  paid:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  failed:
    "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
}

/**
 * Badge de statut coloré pour une commande.
 * @param {{ status: string, label: string }} props
 */
function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${STATUS_STYLES[status] ?? STATUS_STYLES.terminated}`}
    >
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Composant DownloadInvoiceButton
// ---------------------------------------------------------------------------

/**
 * Bouton de téléchargement de facture PDF.
 * @param {{ url: string|null }} props
 */
function DownloadInvoiceButton({ url }) {
  if (!url) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return (
    <Button variant="outline" size="xs" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 1v9M4 7l4 4 4-4M2 13h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Facture PDF
      </a>
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Composant OrderGroup — groupe d'une année
// ---------------------------------------------------------------------------

/**
 * Groupe de commandes pour une année donnée affiché dans un tableau.
 * @param {{ year: number, orders: object[] }} props
 */
function OrderGroup({ year, orders }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes en {year}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden lg:table-cell">Type</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="hidden md:table-cell" />
              <TableHead className="text-right">Facture</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                {/* Nom + statut */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground text-xs">
                      {order.productName}
                    </span>
                    <StatusBadge
                      status={order.status}
                      label={order.statusLabel}
                    />
                    <span className="text-xs text-muted-foreground md:hidden">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </TableCell>

                {/* Date */}
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatDate(order.createdAt)}
                </TableCell>

                {/* Type */}
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {order.type}
                </TableCell>

                {/* Montant */}
                <TableCell className="text-right font-semibold text-foreground">
                  <div className="flex flex-col items-end gap-0.5">
                    <span>{formatPrice(order.total)}</span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      Payé via carte ···{order.paymentLast4}
                    </span>
                  </div>
                </TableCell>

                {/* Détails */}
                <TableCell className="hidden md:table-cell">
                  <Button variant="ghost" size="xs">
                    Détails
                  </Button>
                </TableCell>

                {/* Facture */}
                <TableCell className="text-right">
                  <DownloadInvoiceButton url={order.invoiceUrl} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Skeleton de chargement
// ---------------------------------------------------------------------------

/**
 * Squelette de chargement pour la page historique des commandes.
 */
function OrderHistorySkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {[2024, 2023].map((year) => (
        <Card key={year}>
          <CardHeader>
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

/**
 * Page "Historique des commandes" — affiche toutes les commandes
 * de l'utilisateur connecté groupées par année, avec filtres de recherche.
 */
export function OrderHistory() {
  /** @type {[object[], Function]} */
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  // Filtres
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")

  useEffect(() => {
    // Chargement parallèle des commandes et de l'utilisateur
    Promise.all([getAccountOrders(), getMe()])
      .then(([ordersData, userData]) => {
        setOrders(ordersData)
        setUser(userData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Filtrage
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      searchQuery === "" ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchYear =
      selectedYear === "all" ||
      getYear(order.createdAt) === parseInt(selectedYear, 10)
    return matchSearch && matchYear
  })

  // Groupement par année décroissante
  const years = [
    ...new Set(filteredOrders.map((o) => getYear(o.createdAt))),
  ].sort((a, b) => b - a)

  const grouped = years.map((year) => ({
    year,
    orders: filteredOrders.filter((o) => getYear(o.createdAt) === year),
  }))

  // Années disponibles pour le sélecteur
  const availableYears = [
    ...new Set(orders.map((o) => getYear(o.createdAt))),
  ].sort((a, b) => b - a)

  return (
    <Layout>
      <div className="mx-auto max-w-5xl py-8">
        <div className="flex flex-col gap-8 md:flex-row">

          {/* ----------------------------------------------------------------
              Navigation latérale du compte
          ---------------------------------------------------------------- */}
          <AccountNav user={user ?? undefined} />

          {/* ----------------------------------------------------------------
              Contenu principal
          ---------------------------------------------------------------- */}
          <div className="flex-1 min-w-0">
            {/* En-tête + filtres */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Historique des commandes
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Retrouvez toutes vos factures et abonnements souscrits.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="search"
                  placeholder="Rechercher une commande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44"
                />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Toutes les années" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        Année {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* États */}
            {loading && <OrderHistorySkeleton />}

            {error && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-xs text-destructive">
                    Erreur lors du chargement : {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && !error && grouped.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 rounded-full border border-border bg-muted p-4">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-muted-foreground"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    Aucune commande trouvée
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {searchQuery
                      ? "Essayez un autre terme de recherche."
                      : "Vous n'avez pas encore passé de commande."}
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && !error && grouped.length > 0 && (
              <div className="flex flex-col gap-5">
                {grouped.map(({ year, orders: yearOrders }) => (
                  <OrderGroup key={year} year={year} orders={yearOrders} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}