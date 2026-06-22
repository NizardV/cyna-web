/**
 * @file pages/admin/users.jsx
 * @description Page d'administration des utilisateurs — orchestration only.
 * All presentation lives in components/admin/user/*, all network calls live
 */

import { useEffect, useState, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { getAdminUsers, disableUser, enableUser, changeUserRole, USER_ROLES } from "@/api/admin-users.js"
import { useDebounce } from "@/hooks/useDebounce.js"

import { Layout } from "@/components/layout/layout"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

import { UserToolbar } from "@/components/admin/user/user-toolbar"
import { UserAdminTable } from "@/components/admin/user/user-table"
import { UserStatusConfirmDialog } from "@/components/admin/user/status-confirm-dialog"

const PAGE_SIZE = 8

export function AdminUsers() {
  const { t, i18n } = useTranslation("admin-users")

  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 400)
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [statusTarget, setStatusTarget] = useState(null)
  const [statusSaving, setStatusSaving] = useState(false)
  const [roleSavingId, setRoleSavingId] = useState(null)

  // Localized role options — recomputed whenever the language changes.
  const roleOptions = useMemo(
    () => USER_ROLES.map((r) => ({ value: r.value, label: t(`roles.${r.value}`) })),
    [t]
  )
  const roleFilterOptions = useMemo(
    () => [{ value: "all", label: t("filter.allRoles") }, ...roleOptions],
    [roleOptions, t]
  )

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
    const fullName = `${targetUser.firstName} ${targetUser.lastName}`
    try {
      await changeUserRole(targetUser.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)))
      toast.success(t("toast.roleUpdated", { name: fullName }))
    } catch {
      toast.error(t("toast.roleError"))
    } finally {
      setRoleSavingId(null)
    }
  }

  const confirmStatusChange = async () => {
    if (!statusTarget) return
    setStatusSaving(true)
    const willDisable = !statusTarget.isDisabled
    const fullName = `${statusTarget.firstName} ${statusTarget.lastName}`
    try {
      await (willDisable ? disableUser(statusTarget.id) : enableUser(statusTarget.id))
      setUsers((prev) => prev.map((u) =>
        u.id === statusTarget.id ? { ...u, isDisabled: willDisable } : u
      ))
      toast.success(willDisable
        ? t("toast.disabled", { name: fullName })
        : t("toast.enabled", { name: fullName })
      )
      setStatusTarget(null)
    } catch {
      toast.error(t("toast.statusError"))
    } finally {
      setStatusSaving(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6">

        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <UserToolbar
          search={search}
          onSearchChange={setSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          roleFilterOptions={roleFilterOptions}
          searchPlaceholder={t("search.placeholder")}
          roleFilterPlaceholder={t("filter.allRoles")}
          countLabel={!loading ? t("count", { count: filtered.length }) : null}
        />

        <UserAdminTable
          users={paginated}
          loading={loading}
          error={error}
          onRetry={load}
          search={search}
          onClearSearch={() => setSearch("")}
          roleOptions={roleOptions}
          roleSavingId={roleSavingId}
          onRoleChange={handleRoleChange}
          onStatusRequest={setStatusTarget}
          pageSize={PAGE_SIZE}
          locale={i18n.language}
          t={t}
        />

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
            <p className="text-xs text-muted-foreground">
              {t("pagination.page", { current: page, total: totalPages })}
            </p>
          </div>
        )}

        <UserStatusConfirmDialog
          target={statusTarget}
          onCancel={() => setStatusTarget(null)}
          onConfirm={confirmStatusChange}
          saving={statusSaving}
          t={t}
        />

      </div>
    </Layout>
  )
}