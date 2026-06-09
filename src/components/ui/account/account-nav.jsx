/**
 * @description Navigation latérale du compte utilisateur.
 * Affiche les liens Profil & Sécurité, Mes Abonnements SaaS, Facturation & Paiement
 * et Se déconnecter. Correspond au panneau visible dans la maquette.
 */

import { NavLink } from "react-router-dom"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { IconUser } from "../icons/IconUser"
import { IconLogOut } from "../icons/IconLogOut"
import { IconReceipt } from "../icons/IconReceipt"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Génère les initiales d'un nom complet (ex: "Jean Dupont" → "JD").
 * @param {string} name
 * @returns {string}
 */
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

// ---------------------------------------------------------------------------
// Éléments de navigation
// ---------------------------------------------------------------------------

/** @type {{ to: string, label: string, Icon: React.FC }[]} */
const NAV_ITEMS = [
  { to: "/account/profile", label: "Profil & Sécurité", Icon: IconUser },
  { to: "/account/orders", label: "Facturation & Paiement", Icon: IconReceipt },
]

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

/**
 * Navigation latérale du compte utilisateur.
 * @param {{ user?: { firstName?: string, lastName?: string, email?: string } }} props
 */
export function AccountNav({ user }) {
  // 🔄 ALIGNEMENT : On récupère la méthode logout centralisée de ton contexte
  const { logout: contextLogout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  /**
   * Déconnecte l'utilisateur via le contexte global.
   */
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      // Éxécute le POST /auth/logout, détruit les cookies et vide l'état user
      await contextLogout()
    } catch (err) {
      console.error("Échec de la déconnexion", err)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <nav
      className="flex w-full flex-col gap-0.5 md:w-52 md:shrink-0"
      aria-label="Navigation du compte"
    >
      {/* En-tête utilisateur - Affiche un fallback si user n'existe pas */}
      <div className="mb-3 flex items-center gap-3 px-2 py-2">
        <Avatar size="default">
          <AvatarFallback className={cn(
            "font-semibold text-xs",
            user
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {user ? getInitials(`${user.firstName} ${user.lastName}`) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {user ? `${user.firstName} ${user.lastName}` : "Invité"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email || "Non connecté"}
          </p>
        </div>
      </div>

      {/* Séparateur visuel */}
      <div className="mb-2 h-px bg-border" />

      {/* Liens de navigation */}
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

      {/* Séparateur avant déconnexion */}
      <div className="my-2 h-px bg-border" />

      {/* Bouton déconnexion */}
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