/**
 * @file pages/admin/users.jsx
 * @description Page d'administration des utilisateurs.
 * Liste tous les utilisateurs (sauf l'admin connecté), permet de :
 *   - rechercher par nom / email
 *   - filtrer par rôle
 *   - activer / désactiver un compte
 *   - changer le rôle d'un utilisateur
 *
 * Note : utilise le composant Combobox existant (voir pages/search.jsx)
 * plutôt qu'un Select/DropdownMenu shadcn non confirmé dans ce projet.
 */

import { useEffect, useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import {
  Search, ShieldCheck, ShieldOff, MailCheck, MailWarning,
  KeyRound, UserX, UserCheck,
} from "lucide-react"

import { getAdminUsers, disableUser, enableUser, changeUserRole, USER_ROLES } from "@/api/admin-users.js"
import { useDebounce } from "@/hooks/useDebounce.js"

import { Layout }   from "@/components/layout/layout"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Badge }    from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Combobox, ComboboxInput, ComboboxContent, ComboboxList,
  ComboboxItem, ComboboxEmpty,
} from "@/components/ui/combobox"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 8

const ROLE_BADGE_CLASS = {
  SuperAdmin: "bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#EDE9FE]",
  Admin:      "bg-blue-100 text-blue-700 hover:bg-blue-100",
  User:       "bg-muted text-muted-foreground hover:bg-muted",
}

const ROLE_LABEL = Object.fromEntries(USER_ROLES.map((r) => [r.value, r.label]))
const ROLE_FILTER_OPTIONS = [{ value: "all", label: "Tous les rôles" }, ...USER_ROLES]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
}

function formatDate(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UserAvatar({ user }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-bold text-[#7C3AED]">
      {initials(user.firstName, user.lastName)}
    </div>
  )
}

function StatusBadge({ isDisabled }) {
  return isDisabled ? (
    <Badge variant="destructive" className="gap-1">
      <ShieldOff className="size-3" /> Désactivé
    </Badge>
  ) : (
    <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
      <ShieldCheck className="size-3" /> Actif
    </Badge>
  )
}

function VerifiedIcon({ verified }) {
  return verified ? (
    <span title="Email vérifié">
      <MailCheck className="size-4 text-green-600" />
    </span>
  ) : (
    <span title="Email non vérifié">
      <MailWarning className="size-4 text-amber-500" />
    </span>
  )
}

/**
 * Per-row role picker. Renders the role as a badge-styled combobox trigger.
 */
function RoleCombobox({ value, onChange, disabled }) {
  return (
    <Combobox
      value={value}
      onValueChange={(val) => val && onChange(val)}
    >
      <ComboboxInput
        showClear={false}
        readOnly
        disabled={disabled}
        placeholder="Rôle"
        className={[
          "h-7 w-40 cursor-pointer rounded-full border-none text-xs font-medium",
          ROLE_BADGE_CLASS[value] ?? "bg-muted text-muted-foreground",
        ].join(" ")}
        value={ROLE_LABEL[value] ?? value}
      />
      <ComboboxContent>
        <ComboboxList>
          {USER_ROLES.map((r) => (
            <ComboboxItem key={r.value} value={r.value}>{r.label}</ComboboxItem>
          ))}
          <ComboboxEmpty>Aucun rôle</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><div className="flex items-center gap-3"><Skeleton className="size-9 rounded-full" /><Skeleton className="h-3.5 w-32" /></div></TableCell>
      <TableCell><Skeleton className="h-3.5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="size-4 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-7 w-24 rounded-md" /></TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [statusTarget, setStatusTarget] = useState(null) // user being disabled/enabled (confirm dialog)
  const [statusSaving, setStatusSaving] = useState(false)
  const [roleSavingId,  setRoleSavingId]  = useState(null)

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    getAdminUsers()
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [debouncedSearch, roleFilter])

  // ── Filtering ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch = !q || [u.firstName, u.lastName, u.email]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
      const matchesRole = roleFilter === "all" || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, debouncedSearch, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Actions ─────────────────────────────────────────────────────────────

  const handleRoleChange = async (targetUser, newRole) => {
    if (newRole === targetUser.role) return
    setRoleSavingId(targetUser.id)
    try {
      await changeUserRole(targetUser.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)))
      toast.success(`Rôle de ${targetUser.firstName} ${targetUser.lastName} mis à jour.`)
    } catch {
      toast.error("Impossible de changer le rôle. Réessayez.")
    } finally {
      setRoleSavingId(null)
    }
  }

  const requestStatusChange = (targetUser) => setStatusTarget(targetUser)

  const confirmStatusChange = async () => {
    if (!statusTarget) return
    console.log(statusTarget)
    setStatusSaving(true)
    const willDisable = !statusTarget.isDisabled
    try {
      await (willDisable ? disableUser(statusTarget.id) : enableUser(statusTarget.id))
      setUsers((prev) => prev.map((u) =>
        u.id === statusTarget.id ? { ...u, isDisabled: willDisable } : u
      ))
      toast.success(
        willDisable
          ? `${statusTarget.firstName} ${statusTarget.lastName} a été désactivé.`
          : `${statusTarget.firstName} ${statusTarget.lastName} a été réactivé.`
      )
      setStatusTarget(null)
    } catch {
      toast.error("Une erreur est survenue. Réessayez.")
    } finally {
      setStatusSaving(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les comptes, les rôles et les accès de la plateforme.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un nom ou un email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Combobox
            value={roleFilter}
            onValueChange={(val) => val && setRoleFilter(val)}
          >
            <ComboboxInput
              showClear={false}
              readOnly
              placeholder="Filtrer par rôle"
              className="w-48"
              value={ROLE_FILTER_OPTIONS.find((r) => r.value === roleFilter)?.label ?? ""}
            />
            <ComboboxContent>
              <ComboboxList>
                {ROLE_FILTER_OPTIONS.map((r) => (
                  <ComboboxItem key={r.value} value={r.value}>{r.label}</ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {!loading && (
            <p className="ml-auto text-xs text-muted-foreground">
              {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-center">Vérifié</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-sm text-destructive">
                    Impossible de charger les utilisateurs.{" "}
                    <button className="underline underline-offset-2" onClick={load}>Réessayer</button>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                    Aucun utilisateur ne correspond à votre recherche.
                    {search && (
                      <button className="ml-1 underline underline-offset-2 hover:text-foreground" onClick={() => setSearch("")}>
                        Effacer la recherche
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((u) => (
                  <TableRow key={u.id} className={u.isDisabled ? "opacity-60" : undefined}>

                    {/* Name + avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {u.firstName} {u.lastName}
                          </p>
                          {u.hasTwoFactor && (
                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <KeyRound className="size-3" /> 2FA activé
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>

                    {/* Role */}
                    <TableCell>
                      <RoleCombobox
                        value={u.role}
                        onChange={(val) => handleRoleChange(u, val)}
                        disabled={roleSavingId === u.id}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell><StatusBadge isDisabled={u.isDisabled} /></TableCell>

                    {/* Verified */}
                    <TableCell className="text-center">
                      <div className="flex justify-center"><VerifiedIcon verified={u.isEmailVerified} /></div>
                    </TableCell>

                    {/* Created at */}
                    <TableCell className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</TableCell>

                    {/* Actions */}
                    <TableCell>
                      {u.isDisabled ? (
                        <Button
                          variant="outline" size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => requestStatusChange(u)}
                        >
                          <UserCheck className="size-3.5" /> Réactiver
                        </Button>
                      ) : (
                        <Button
                          variant="outline" size="sm"
                          className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => requestStatusChange(u)}
                        >
                          <UserX className="size-3.5" /> Désactiver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)} className="cursor-pointer">
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-xs text-muted-foreground">Page {page} sur {totalPages}</p>
          </div>
        )}

        {/* Confirm dialog — disable / enable */}
        <Dialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {statusTarget?.isDisabled ? "Réactiver ce compte ?" : "Désactiver ce compte ?"}
              </DialogTitle>
              <DialogDescription asChild>
                <div>
                  {statusTarget?.isDisabled ? (
                    <>
                      <strong>{statusTarget?.firstName} {statusTarget?.lastName}</strong> pourra à nouveau
                      se connecter et accéder à son compte.
                    </>
                  ) : (
                    <>
                      <strong>{statusTarget?.firstName} {statusTarget?.lastName}</strong> ne pourra plus
                      se connecter ni renouveler sa session tant que le compte est désactivé.
                    </>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusTarget(null)} disabled={statusSaving}>
                Annuler
              </Button>
              <Button
                variant={statusTarget?.isDisabled ? "default" : "destructive"}
                onClick={confirmStatusChange}
                disabled={statusSaving}
              >
                {statusSaving
                  ? "Enregistrement…"
                  : statusTarget?.isDisabled ? "Réactiver" : "Désactiver"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  )
}