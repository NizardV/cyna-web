/**
 * @file pages/account/profile.jsx
 * Uses shared AccountNav component for sidebar navigation.
 */

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation("profile")

  return (
    <div className="flex items-center justify-between rounded-none border border-primary bg-primary/5 p-4">
      <div>
        <h4 className="text-xs font-bold text-foreground">{sub.productName}</h4>
        <p className="text-xs text-muted-foreground">
          {t("subscriptions.users", { count: sub.quantity })} •{" "}
          {t("subscriptions.renewal", {
            date: new Date(sub.endsAt).toLocaleDateString(),
          })}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="destructive" size="sm">{t("subscriptions.cancel")}</Button>
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
  const { t } = useTranslation("profile")

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
      setProfileFeedback({ type: "success", message: t("personalInfo.success") })
    } catch (err) {
      setProfileFeedback({ type: "error", message: err.message || t("personalInfo.error") })
    } finally { setProfileSaving(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordFeedback({ type: "", message: "" })
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", message: t("security.errorMismatch") })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: "error", message: t("security.errorLength") })
      return
    }
    setPasswordSaving(true)
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      setPasswordFeedback({ type: "success", message: t("security.success") })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setPasswordFeedback({ type: "error", message: err.message || t("security.error") })
    } finally { setPasswordSaving(false) }
  }

  return (
    <Layout>
      <main className="flex w-full flex-col gap-8 py-8 md:flex-row">

        {/* Sidebar */}
        <div className="w-full md:w-52 md:shrink-0">
          <AccountNav user={loadingUser ? undefined : user ?? undefined} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-4">
          <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>

          {loadingUser ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* Informations personnelles */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>{t("personalInfo.title")}</CardTitle>
                  <CardDescription>{t("personalInfo.description")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <FeedbackBanner type={profileFeedback.type} message={profileFeedback.message} />
                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name">{t("personalInfo.fullName")}</Label>
                        <Input
                          id="name"
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
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

              {/* Sécurité */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>{t("security.title")}</CardTitle>
                  <CardDescription>{t("security.description")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <FeedbackBanner type={passwordFeedback.type} message={passwordFeedback.message} />
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

              {/* Abonnements */}
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