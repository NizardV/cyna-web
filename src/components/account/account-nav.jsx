/**
 * @file components/ui/account/account-nav.jsx
 *
 * Aligné sur UserProfileDto (v1) :
 *   { id, email, firstName, lastName, role, isEmailVerified, createdAt }
 *
 * Correction : user.name → `${user.firstName} ${user.lastName}`
 */

import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
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

/**
 * Génère les initiales depuis firstName + lastName.
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
function getInitials(firstName = "", lastName = "") {
  const first = firstName[0]?.toUpperCase() ?? ""
  const last  = lastName[0]?.toUpperCase() ?? ""
  return `${first}${last}` || "?"
}

/**
 * Nom complet affiché.
 * @param {{ firstName?: string, lastName?: string }} user
 * @returns {string}
 */
function getFullName(user) {
  if (!user) return "Invité"
  const parts = [user.firstName, user.lastName].filter(Boolean)
  return parts.length ? parts.join(" ") : "Invité"
}

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { to: "/account/profile", label: "Profil & Sécurité",     Icon: IconUser    },
  { to: "/account/orders",  label: "Facturation & Paiement", Icon: IconReceipt },
]

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

/**
 * Navigation latérale du compte utilisateur.
 * @param {{ user?: object }} props  user = UserProfileDto | undefined
 */
export function AccountNav({ user }) {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

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
      aria-label="Navigation du compte"
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
            {getFullName(user)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email ?? "Non connecté"}
          </p>
        </div>
      </div>

      <div className="mb-2 h-px bg-border" />

      {/* Liens */}
      {NAV_ITEMS.map(({ to, label, Icon }) => (
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
              {label}
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
        {loggingOut ? "Déconnexion…" : "Se déconnecter"}
      </Button>
    </nav>
  )
}