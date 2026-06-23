/**
 * @file components/admin/user/status-indicators.jsx
 * @description Small badge/icon indicators for account status and email
 * verification, used in the admin user table.
 */

import { ShieldCheck, ShieldOff, MailCheck, MailWarning } from "lucide-react"
import { Badge } from "@/components/ui/badge"

/**
 * @param {{ isDisabled: boolean, t: (key: string) => string }} props
 */
export function UserStatusBadge({ isDisabled, t }) {
  return isDisabled ? (
    <Badge variant="destructive" className="gap-1">
      <ShieldOff className="size-3" /> {t("status.disabled")}
    </Badge>
  ) : (
    <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
      <ShieldCheck className="size-3" /> {t("status.active")}
    </Badge>
  )
}

/**
 * @param {{ verified: boolean, t: (key: string) => string }} props
 */
export function EmailVerifiedIcon({ verified, t }) {
  return verified ? (
    <span title={t("verified.yes")}>
      <MailCheck className="size-4 text-green-600" />
    </span>
  ) : (
    <span title={t("verified.no")}>
      <MailWarning className="size-4 text-amber-500" />
    </span>
  )
}