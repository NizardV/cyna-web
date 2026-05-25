/**
 * @file pages/account/profile.jsx
 * Rebuilt to match moncompte.html maquette.
 * Sidebar nav with icons + rounded-md items. Subscription card with purple accent.
 */

import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Layout } from "@/components/ui/layout/layout"
import { getMe, updateProfile, updatePassword } from "@/api/user.js"
import { getSubscriptions } from "@/api/orders.js"
import { logout } from "@/api/auth.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// AccountSidebar — matches moncompte.html aside exactly
// ---------------------------------------------------------------------------

function AccountSidebar({ user, onLogout, loggingOut }) {
  const navItems = [
    {
      to: "/account/profile",
      label: "Profil & Sécurité",
      icon: (
        <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      to: "/account/subscriptions",
      label: "Mes Abonnements SaaS",
      icon: (
        <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      to: "/account/orders",
      label: "Facturation & Paiement",
      icon: (
        <svg className="mr-3 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                    {icon}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}

          <div className="mt-8">
            <button
              onClick={onLogout}
              disabled={loggingOut}
              className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <svg className="mr-3 h-5 w-5 shrink-0 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        </nav>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// FeedbackBanner
// ---------------------------------------------------------------------------

function FeedbackBanner({ type, message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        "mb-4 rounded-lg border px-4 py-3 text-sm",
        type === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-800"
      )}
    >
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SubscriptionItem — purple border accent as in maquette
// ---------------------------------------------------------------------------

function SubscriptionItem({ sub }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-4">
      <div>
        <h4 className="font-bold text-foreground">{sub.productName}</h4>
        <p className="text-sm text-muted-foreground">
          {sub.quantity} utilisateurs • Renouvellement auto le{" "}
          {new Date(sub.endsAt).toLocaleDateString("fr-FR")}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Modifier</Button>
        <Button variant="destructive" size="sm" className="border-red-200 bg-white text-destructive hover:bg-red-50">
          Résilier
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section card — matches maquette card style (white, border, rounded-xl, shadow)
// ---------------------------------------------------------------------------

function SectionCard({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-6">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-1 h-3 w-72" />
          </div>
          <div className="grid grid-cols-2 gap-6 p-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <div className="col-span-2 flex justify-end">
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  const [profileForm, setProfileForm] = useState({ name: "", email: "" })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState({ type: "", message: "" })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState({ type: "", message: "" })

  const [subscriptions, setSubscriptions] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(true)

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data)
        setProfileForm({ name: data.name ?? "", email: data.email ?? "" })
        setLoadingUser(false)
      })
      .catch(() => setLoadingUser(false))

    getSubscriptions()
      .then((data) => {
        setSubscriptions(data.filter((s) => s.status === "active"))
        setLoadingSubs(false)
      })
      .catch(() => setLoadingSubs(false))
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await logout() } catch { localStorage.removeItem("cyna_token") }
    finally { setLoggingOut(false); navigate("/") }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileFeedback({ type: "", message: "" })
    try {
      const updated = await updateProfile(profileForm)
      setUser(updated)
      setProfileFeedback({ type: "success", message: "Informations mises à jour avec succès." })
    } catch (err) {
      setProfileFeedback({ type: "error", message: err.message || "Une erreur est survenue." })
    } finally { setProfileSaving(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordFeedback({ type: "", message: "" })
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", message: "Les mots de passe ne correspondent pas." })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: "error", message: "Le mot de passe doit contenir au moins 8 caractères." })
      return
    }
    setPasswordSaving(true)
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      setPasswordFeedback({ type: "success", message: "Mot de passe mis à jour avec succès." })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setPasswordFeedback({ type: "error", message: err.message || "Une erreur est survenue." })
    } finally { setPasswordSaving(false) }
  }

  return (
    <Layout>
      <main className="bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row">

            <AccountSidebar user={user} onLogout={handleLogout} loggingOut={loggingOut} />

            <div className="flex-1 min-w-0 space-y-6">
              <h1 className="text-2xl font-bold text-foreground">Profil &amp; Sécurité</h1>

              {loadingUser ? (
                <ProfileSkeleton />
              ) : (
                <>
                  {/* Informations personnelles */}
                  <SectionCard
                    title="Informations Personnelles"
                    description="Gérez vos informations de contact et votre adresse e-mail."
                  >
                    <FeedbackBanner type={profileFeedback.type} message={profileFeedback.message} />
                    <form onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <Label htmlFor="name" className="mb-1 block text-sm font-medium">
                            Nom complet
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="mb-1 block text-sm font-medium">
                            Adresse e-mail
                          </Label>
                          <div className="flex rounded-md shadow-sm">
                            <Input
                              id="email"
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                              required
                              className="rounded-r-none"
                            />
                            {user?.isConfirmed && (
                              <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                Validé ✓
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end md:col-span-2">
                          <Button type="submit" disabled={profileSaving}>
                            {profileSaving ? "Enregistrement…" : "Sauvegarder les modifications"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </SectionCard>

                  {/* Sécurité */}
                  <SectionCard
                    title="Sécurité du compte"
                    description="Mettez à jour votre mot de passe pour sécuriser l'accès à vos services SaaS."
                  >
                    <FeedbackBanner type={passwordFeedback.type} message={passwordFeedback.message} />
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <Label htmlFor="currentPassword" className="mb-1 block text-sm font-medium">
                            Mot de passe actuel
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="••••••••"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                            required
                            className="md:w-1/2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPassword" className="mb-1 block text-sm font-medium">
                            Nouveau mot de passe
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                            Confirmer le mot de passe
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="flex justify-end md:col-span-2">
                          <Button type="submit" variant="outline" disabled={passwordSaving}>
                            {passwordSaving ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </SectionCard>

                  {/* Abonnements */}
                  <SectionCard title="Abonnements SaaS actifs" description="Gérez vos licences en cours.">
                    <div className="-mt-2 mb-4 flex justify-end">
                      <Link to="/account/orders" className="text-sm font-bold text-primary hover:underline">
                        Voir tout →
                      </Link>
                    </div>
                    {loadingSubs ? (
                      <div className="space-y-2">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                      </div>
                    ) : subscriptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucun abonnement actif pour le moment.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {subscriptions.map((sub) => (
                          <SubscriptionItem key={sub.id} sub={sub} />
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}