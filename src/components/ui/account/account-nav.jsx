/**
 * @file components/account/account-nav.jsx
 * @description Navigation latérale du compte utilisateur.
 * Affiche les liens Profil & Sécurité, Mes Abonnements SaaS, Facturation & Paiement
 * et Se déconnecter. Correspond au panneau visible dans la maquette.
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
 * @param {{ user?: { name?: string, email?: string } }} props
 */
export function AccountNav({ user }) {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  /**
   * Déconnecte l'utilisateur : appel API puis redirection vers l'accueil.
   */
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } catch {
      // On supprime le token local même si l'API échoue
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
      {/* En-tête utilisateur - Affiche un fallback si user n'existe pas */}
      <div className="mb-3 flex items-center gap-3 px-2 py-2">
        <Avatar size="default">
          <AvatarFallback className={cn(
            "font-semibold text-xs",
            user 
              ? "bg-primary/10 text-primary" 
              : "bg-muted text-muted-foreground"
          )}>
            {user ? getInitials(user.name) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {user?.name || "Invité"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email || "Non connecté"}
          </p>
        </div>
      </div>

      {/* Séparateur visuel - toujours affiché dans ce cas */}
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