/**
 * @file components/admin/user/user-table.jsx
 * @description The admin user list table: rows, skeleton loading state,
 * empty/error states, and per-row actions. Pure presentation — all data
 * fetching and mutation logic stays in the page.
 */

import { KeyRound, UserX, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { UserAvatar } from "./user-avatar"
import { UserStatusBadge, EmailVerifiedIcon } from "./status-indicators"
import { RoleCombobox } from "./role-combobox"

function formatDate(iso, locale) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
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

/**
 * @param {{
 *   users: object[],            // AdminUserDto[] (already paginated)
 *   loading: boolean,
 *   error: boolean,
 *   onRetry: () => void,
 *   search: string,
 *   onClearSearch: () => void,
 *   roleOptions: { value: string, label: string }[],
 *   roleSavingId: number|null,
 *   onRoleChange: (user: object, newRole: string) => void,
 *   onStatusRequest: (user: object) => void,
 *   pageSize: number,
 *   locale: string,
 *   t: (key: string, opts?: object) => string,
 * }} props
 */
export function UserAdminTable({
  users, loading, error, onRetry,
  search, onClearSearch,
  roleOptions, roleSavingId, onRoleChange, onStatusRequest,
  pageSize, locale, t,
}) {
  return (
    <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("table.user")}</TableHead>
            <TableHead>{t("table.email")}</TableHead>
            <TableHead>{t("table.role")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="text-center">{t("table.verified")}</TableHead>
            <TableHead>{t("table.createdAt")}</TableHead>
            <TableHead className="w-32">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: pageSize }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="py-16 text-center text-sm text-destructive">
                {t("table.loadError")}{" "}
                <button className="underline underline-offset-2" onClick={onRetry}>
                  {t("table.retry")}
                </button>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                {t("table.noResults")}
                {search && (
                  <button className="ml-1 underline underline-offset-2 hover:text-foreground" onClick={onClearSearch}>
                    {t("table.clearSearch")}
                  </button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            users.map((u) => (
              <TableRow key={u.id} className={u.isDisabled ? "opacity-60" : undefined}>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={u} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {u.firstName} {u.lastName}
                      </p>
                      {u.hasTwoFactor && (
                        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <KeyRound className="size-3" /> {t("table.twoFactorEnabled")}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>

                <TableCell>
                  <RoleCombobox
                    value={u.role}
                    onChange={(val) => onRoleChange(u, val)}
                    disabled={roleSavingId === u.id}
                    roles={roleOptions}
                    noResultsLabel={t("table.noResults")}
                    placeholder={t("table.role")}
                  />
                </TableCell>

                <TableCell><UserStatusBadge isDisabled={u.isDisabled} t={t} /></TableCell>

                <TableCell className="text-center">
                  <div className="flex justify-center"><EmailVerifiedIcon verified={u.isEmailVerified} t={t} /></div>
                </TableCell>

                <TableCell className="text-xs text-muted-foreground">{formatDate(u.createdAt, locale)}</TableCell>

                <TableCell>
                  {u.isDisabled ? (
                    <Button
                      variant="outline" size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => onStatusRequest(u)}
                    >
                      <UserCheck className="size-3.5" /> {t("actions.enable")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline" size="sm"
                      className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onStatusRequest(u)}
                    >
                      <UserX className="size-3.5" /> {t("actions.disable")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}