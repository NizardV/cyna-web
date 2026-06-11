/**
 * @file components/ui/account/account-nav.jsx
 *
 * Aligné sur UserProfileDto (v1) :
 *   { id, email, firstName, lastName, role, isEmailVerified, createdAt }
 */

import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { logout } from "@/api/auth.js"
import { IconUser } from "../icons/IconUser"
import { IconLogOut } from "../icons/IconLogOut"
import { IconReceipt } from "../icons/IconReceipt"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(firstName = "", lastName = "") {
  const first = firstName[0]?.toUpperCase() ?? ""
  const last  = lastName[0]?.toUpperCase() ?? ""
  return `${first}${last}` || "?"
}

function getFullName(user, guestLabel) {
  if (!user) return guestLabel
  const parts = [user.firstName, user.lastName].filter(Boolean)
  return parts.length ? parts.join(" ") : guestLabel
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

/**
 * Navigation latérale du compte utilisateur.
 * @param {{ user?: object }} props
 */
export function AccountNav({ user }) {
  const navigate = useNavigate()
  const { t } = useTranslation("common")
  const [loggingOut, setLoggingOut] = useState(false)

  const NAV_ITEMS = [
    { to: "/account/profile", labelKey: "accountNav.profile",  Icon: IconUser    },
    { to: "/account/orders",  labelKey: "accountNav.billing",  Icon: IconReceipt },
  ]

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      localStorage.removeItem("cyna_token")
    } finally {
      setLoggingOut(false)
      navigate("/")
    }
  }

  return (
    <nav
      className="flex w-full flex-col gap-0.5 md:w-52 md:shrink-0"
      aria-label={t("accountNav.profile")}
    >
      {/* En-tête utilisateur */}
      <div className="mb-3 flex items-center gap-3 px-2 py-2">
        <Avatar size="default">
          <AvatarFallback className={cn(
            "font-semibold text-xs",
            user
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {user ? getInitials(user.firstName, user.lastName) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {getFullName(user, t("accountNav.guest"))}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email ?? t("accountNav.notConnected")}
          </p>
        </div>
      </div>

      <div className="mb-2 h-px bg-border" />

      {/* Liens */}
      {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded px-2.5 py-2 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={isActive ? "text-primary" : "text-muted-foreground"} />
              {t(labelKey)}
            </>
          )}
        </NavLink>
      ))}

      <div className="my-2 h-px bg-border" />

      <Button
        onClick={handleLogout}
        disabled={loggingOut}
        variant="destructive"
      >
        <IconLogOut className="text-destructive" />
        {loggingOut ? t("accountNav.loggingOut") : t("accountNav.logout")}
      </Button>
    </nav>
  )
}