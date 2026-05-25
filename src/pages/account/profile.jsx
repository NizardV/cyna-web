/**
 * @file pages/account/profile.jsx
 * Uses shared AccountNav component for sidebar navigation.
 */

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Layout } from "@/components/ui/layout/layout"
import { AccountNav } from "@/components/ui/account/account-nav"
import { getMe, updateProfile, updatePassword } from "@/api/user.js"
import { getSubscriptions } from "@/api/orders.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// FeedbackBanner
// ---------------------------------------------------------------------------

function FeedbackBanner({ type, message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        "mb-4 rounded-none border px-4 py-3 text-xs",
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
// SubscriptionItem — purple border accent
// ---------------------------------------------------------------------------

function SubscriptionItem({ sub }) {
  return (
    <div className="flex items-center justify-between rounded-none border border-primary bg-primary/5 p-4">
      <div>
        <h4 className="text-xs font-bold text-foreground">{sub.productName}</h4>
        <p className="text-xs text-muted-foreground">
          {sub.quantity} utilisateurs • Renouvellement auto le{" "}
          {new Date(sub.endsAt).toLocaleDateString("fr-FR")}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="destructive" size="sm">Résilier</Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProfileSkeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="border-b">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <div className="col-span-2 flex justify-end">
                <Skeleton className="h-8 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function Profile() {
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

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
      <main className="flex w-full flex-col gap-8 py-8 md:flex-row">

        {/* Sidebar — AccountNav with skeleton while user loads */}
        <div className="w-full md:w-52 md:shrink-0">
          <AccountNav user={loadingUser ? undefined : user ?? undefined} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-4">
          <h1 className="text-lg font-bold text-foreground">Profil &amp; Sécurité</h1>

          {loadingUser ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* Informations personnelles */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Informations Personnelles</CardTitle>
                  <CardDescription>
                    Gérez vos informations de contact et votre adresse e-mail.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <FeedbackBanner type={profileFeedback.type} message={profileFeedback.message} />
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                          id="name"
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <div className="flex">
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                            required
                            className={user?.isConfirmed ? "rounded-r-none" : ""}
                          />
                          {user?.isConfirmed && (
                            <span className="inline-flex items-center border border-l-0 border-input rounded-lg rounded-l-none bg-muted px-2.5 text-xs text-muted-foreground">
                              Validé
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
                </CardContent>
              </Card>

              {/* Sécurité */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Sécurité du compte</CardTitle>
                  <CardDescription>
                    Mettez à jour votre mot de passe pour sécuriser l'accès à vos services SaaS.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <FeedbackBanner type={passwordFeedback.type} message={passwordFeedback.message} />
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5 md:col-span-2 md:max-w-xs">
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
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
                </CardContent>
              </Card>

              {/* Abonnements */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Abonnements SaaS actifs</CardTitle>
                      <CardDescription>Gérez vos licences en cours.</CardDescription>
                    </div>
                    <Link to="/account/orders" className="text-xs font-bold text-primary hover:underline">
                      Voir tout →
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {loadingSubs ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : subscriptions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aucun abonnement actif pour le moment.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {subscriptions.map((sub) => (
                        <SubscriptionItem key={sub.id} sub={sub} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </Layout>
  )
}