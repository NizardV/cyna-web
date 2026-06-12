/**
 * @file pages/account/profile.jsx
 * Uses shared AccountNav component for sidebar navigation.
 * Subscription cancellation uses a confirmation Dialog before calling the API.
 */

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/layout/layout"
import { AccountNav } from "@/components/account/account-nav"
import { getMe, updateProfile, updatePassword, getSubscriptions } from "@/api/user.js"
import { apiClient } from "@/api/client.js"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CancelSubscriptionDialog, SubscriptionItem } from "@/components/account/subscription"

// ---------------------------------------------------------------------------
// API helper — cancel a subscription
// Calls DELETE /subscriptions/:id (mock handler already registered)
// ---------------------------------------------------------------------------

const cancelSubscription = (id) =>
  apiClient.delete("/subscriptions/:id", { params: { id } })

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

/**
 * Page profil : modification des informations personnelles, mot de passe et gestion des abonnements actifs.
 */
export function Profile() {
  const { t } = useTranslation("profile")

  const {setUser: setGlobalUser } = useAuth()

  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "" })
  const [profileSaving, setProfileSaving] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  })
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [subscriptions, setSubscriptions] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(true)

  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data)
        setProfileForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? ""
        })
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
    try {
      const updated = await updateProfile(profileForm)
      setUser(updated)

      if (setGlobalUser) {
        setGlobalUser(updated)
      }

      toast.success(t("personalInfo.success"))
    } catch (err) {
      toast.error(err.message || t("personalInfo.error"))
    } finally { setProfileSaving(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("security.errorMismatch"))
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(t("security.errorLength"))
      return
    }
    setPasswordSaving(true)
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      toast.success(t("security.success"))
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      toast.error(err.message || t("security.error"))
    } finally { setPasswordSaving(false) }
  }

  const handleCancelRequest = (sub) => {
    setCancelTarget(sub)
  }

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelSubscription(cancelTarget.id)
      setSubscriptions((prev) => prev.filter((s) => s.id !== cancelTarget.id))
      setCancelTarget(null)
      toast.success(t("subscriptions.cancelDialog.successMessage", {
        defaultValue: "Abonnement résilié avec succès.",
      }))
    } catch (err) {
      setCancelTarget(null)
      toast.error(err.message || t("subscriptions.cancelDialog.errorMessage", {
        defaultValue: "Une erreur est survenue lors de la résiliation.",
      }))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Layout>
      <main className="flex w-full flex-col gap-8 py-8 md:flex-row">

        <div className="w-full md:w-52 md:shrink-0">
          <AccountNav user={loadingUser ? undefined : user ?? undefined} />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>

          {loadingUser ? (
            <ProfileSkeleton />
          ) : (
            <>
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>{t("personalInfo.title")}</CardTitle>
                  <CardDescription>{t("personalInfo.description")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <Label htmlFor="email">{t("personalInfo.email")}</Label>
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
                              {t("personalInfo.verified")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end md:col-span-2">
                        <Button type="submit" disabled={profileSaving}>
                          {profileSaving ? t("personalInfo.saving") : t("personalInfo.save")}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>{t("security.title")}</CardTitle>
                  <CardDescription>{t("security.description")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5 md:col-span-2 md:max-w-xs">
                        <Label htmlFor="currentPassword">{t("security.currentPassword")}</Label>
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
                        <Label htmlFor="newPassword">{t("security.newPassword")}</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="confirmPassword">{t("security.confirmPassword")}</Label>
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
                          {passwordSaving ? t("security.updating") : t("security.update")}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("subscriptions.title")}</CardTitle>
                      <CardDescription>{t("subscriptions.description")}</CardDescription>
                    </div>
                    <Link to="/account/orders" className="text-xs font-bold text-primary hover:underline">
                      {t("subscriptions.viewAll")}
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
                    <p className="text-xs text-muted-foreground">{t("subscriptions.empty")}</p>
                  ) : (
                    <div className="space-y-3">
                      {subscriptions.map((sub) => (
                        <SubscriptionItem
                          key={sub.id}
                          sub={sub}
                          onCancelRequest={handleCancelRequest}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Cancel confirmation dialog — rendered outside the card flow */}
      <CancelSubscriptionDialog
        sub={cancelTarget}
        open={!!cancelTarget}
        onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
        onConfirm={handleCancelConfirm}
        loading={cancelling}
      />
    </Layout>
  )
}