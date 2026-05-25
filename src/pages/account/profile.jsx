/**
 * @file pages/account/profile.jsx
 * @description Page "Profil & Sécurité" — gestion des informations personnelles,
 * changement de mot de passe et aperçu des abonnements SaaS actifs.
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// ---------------------------------------------------------------------------
// Composant FeedbackBanner
// ---------------------------------------------------------------------------

/**
 * Bandeau de confirmation ou d'erreur après une action.
 * @param {{ type: "success"|"error", message: string }} props
 */
function FeedbackBanner({ type, message }) {
  if (!message) return null

  const styles = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    error:
      "border-destructive/30 bg-destructive/5 text-destructive",
  }

  return (
    <div
      role="alert"
      className={`mb-4 rounded border px-3 py-2 text-xs ${styles[type]}`}
    >
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composant SubscriptionItem
// ---------------------------------------------------------------------------

/**
 * Ligne d'abonnement SaaS actif avec actions modifier / résilier.
 * @param {{ sub: object }} props
 */
function SubscriptionItem({ sub }) {
  return (
    <div className="flex items-center justify-between rounded border border-border bg-muted/30 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{sub.productName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {sub.quantity} utilisateurs • Renouvellement auto le{" "}
          {new Date(sub.endsAt).toLocaleDateString("fr-FR")}
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <Button variant="outline" size="xs">
          Modifier
        </Button>
        <Button variant="destructive" size="xs">
          Résilier
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton de chargement
// ---------------------------------------------------------------------------

/**
 * Squelette de chargement pour la page profil.
 */
function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-32" />
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

/**
 * Page "Profil & Sécurité" — modification des informations personnelles,
 * du mot de passe et consultation des abonnements actifs.
 */
export function Profile() {
  /** @type {[object|null, Function]} */
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Formulaire profil
  const [profileForm, setProfileForm] = useState({ name: "", email: "" })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState({ type: "", message: "" })

  // Formulaire mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState({ type: "", message: "" })

  // Abonnements actifs
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

  /** Soumet la mise à jour du profil. */
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileFeedback({ type: "", message: "" })
    try {
      const updated = await updateProfile(profileForm)
      setUser(updated)
      setProfileFeedback({
        type: "success",
        message: "Informations mises à jour avec succès.",
      })
    } catch (err) {
      setProfileFeedback({
        type: "error",
        message: err.message || "Une erreur est survenue.",
      })
    } finally {
      setProfileSaving(false)
    }
  }

  /** Soumet le changement de mot de passe. */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordFeedback({ type: "", message: "" })

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Les mots de passe ne correspondent pas.",
      })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      })
      return
    }

    setPasswordSaving(true)
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordFeedback({
        type: "success",
        message: "Mot de passe mis à jour avec succès.",
      })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setPasswordFeedback({
        type: "error",
        message: err.message || "Une erreur est survenue.",
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl py-8">
        <div className="flex flex-col gap-8 md:flex-row">

          {/* ----------------------------------------------------------------
              Navigation latérale du compte
          ---------------------------------------------------------------- */}
          <AccountNav user={user ?? undefined} />

          {/* ----------------------------------------------------------------
              Contenu principal
          ---------------------------------------------------------------- */}
          <div className="flex-1 min-w-0">
            <h1 className="mb-6 text-lg font-semibold text-foreground">
              Profil &amp; Sécurité
            </h1>

            {loadingUser ? (
              <ProfileSkeleton />
            ) : (
              <div className="flex flex-col gap-5">

                {/* ── Informations personnelles ── */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations Personnelles</CardTitle>
                    <CardDescription>
                      Gérez vos informations de contact et votre adresse e-mail.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FeedbackBanner
                      type={profileFeedback.type}
                      message={profileFeedback.message}
                    />
                    <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="name">Nom complet</Label>
                          <Input
                            id="name"
                            type="text"
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm((f) => ({ ...f, name: e.target.value }))
                            }
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="email">
                            Adresse e-mail
                            {user?.isConfirmed && (
                              <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-normal text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                Validé
                              </span>
                            )}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm((f) => ({ ...f, email: e.target.value }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={profileSaving}>
                          {profileSaving
                            ? "Enregistrement…"
                            : "Sauvegarder les modifications"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* ── Sécurité du compte ── */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité du compte</CardTitle>
                    <CardDescription>
                      Mettez à jour votre mot de passe pour sécuriser l'accès à vos
                      services SaaS.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FeedbackBanner
                      type={passwordFeedback.type}
                      message={passwordFeedback.message}
                    />
                    <form
                      onSubmit={handlePasswordSubmit}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="currentPassword">
                          Mot de passe actuel
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((f) => ({
                              ...f,
                              currentPassword: e.target.value,
                            }))
                          }
                          required
                          className="max-w-xs"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((f) => ({
                                ...f,
                                newPassword: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="confirmPassword">
                            Confirmer le mot de passe
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((f) => ({
                                ...f,
                                confirmPassword: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          variant="outline"
                          disabled={passwordSaving}
                        >
                          {passwordSaving
                            ? "Mise à jour…"
                            : "Mettre à jour le mot de passe"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* ── Abonnements SaaS actifs ── */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Abonnements SaaS actifs</CardTitle>
                        <CardDescription>
                          Gérez vos licences en cours.
                        </CardDescription>
                      </div>
                      <Link
                        to="/account/orders"
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        Voir tout →
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingSubs ? (
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-14 w-full rounded" />
                        <Skeleton className="h-14 w-full rounded" />
                      </div>
                    ) : subscriptions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Aucun abonnement actif pour le moment.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {subscriptions.map((sub) => (
                          <SubscriptionItem key={sub.id} sub={sub} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}