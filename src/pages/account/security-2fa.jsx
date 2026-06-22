/**
 * @file pages/account/security-2fa.jsx
 * @description Admin 2FA enrollment: generate a TOTP secret, show it as a QR
 * code + manual entry key, then confirm activation with a first code.
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ShieldCheck, Copy, Check, Smartphone, AlertTriangle } from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Label }    from "@/components/ui/label"
import { Spinner }  from "@/components/ui/spinner"
import { Layout }   from "@/components/layout/layout"
import { AccountNav } from "@/components/account/account-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OtpInput } from "@/components/auth/otp-input"
import { setupTwoFactor, confirmTwoFactor } from "@/api/auth.js"
import { getMe } from "@/api/user.js"
import { toast } from "sonner"

function CopyField({ value, copiedLabel, copyLabel }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error(copiedLabel)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs font-mono tracking-wider text-foreground">
        {value}
      </code>
      <Button type="button" variant="outline" size="icon-sm" onClick={handleCopy} title={copyLabel}>
        {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )
}

export function Security2FA() {
  const { t } = useTranslation("security-2fa")
  const navigate = useNavigate()

  const [user,        setUser]        = useState(null)
  const [loadingUser, setLoadingUser]  = useState(true)

  const [setup,    setSetup]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [code,     setCode]     = useState("")
  const [error,    setError]    = useState("")
  const [confirming, setConfirming] = useState(false)
  const [activated, setActivated]   = useState(false)

  useEffect(() => {
    getMe().then(setUser).catch(() => {}).finally(() => setLoadingUser(false))
  }, [])

  useEffect(() => {
    setupTwoFactor()
      .then((data) => setSetup(data))
      .catch(() => setError(t("errorSetup")))
      .finally(() => setLoading(false))
  }, [t])

  const isReady = code.trim().length === 6

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!isReady) return
    setConfirming(true)
    setError("")
    try {
      await confirmTwoFactor({ totpCode: code.trim() })
      setActivated(true)
      toast.success(t("toastActivated"))
    } catch {
      setError(t("errorInvalidCode"))
      setCode("")
    } finally {
      setConfirming(false)
    }
  }

  const qrImageSrc = setup
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(setup.otpAuthUrl)}`
    : null

  return (
    <Layout>
      <main className="flex w-full flex-col gap-8 py-8 md:flex-row">

        <div className="w-full md:w-52 md:shrink-0">
          <AccountNav user={loadingUser ? undefined : user ?? undefined} />
        </div>

        <div className="min-w-0 flex-1 max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#EDE9FE]">
              <ShieldCheck className="size-5 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
              <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          {activated ? (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
                  <Check className="size-7 text-green-600" strokeWidth={2.5} />
                </div>
                <h2 className="text-base font-bold text-foreground mb-1">{t("activatedTitle")}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t("activatedDescription")}</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => navigate("/admin")}>{t("goToDashboard")}</Button>
                  <Button variant="outline" onClick={() => navigate("/account/profile")}>{t("backToProfile")}</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>{t("step1.title")}</CardTitle>
                  <CardDescription>{t("step1.description")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <Spinner />
                    </div>
                  ) : error && !setup ? (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertTriangle className="size-4 shrink-0" />
                      {error}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                      <img
                        src={qrImageSrc}
                        alt={t("step1.qrAlt")}
                        className="size-[140px] shrink-0 rounded-lg ring-1 ring-foreground/10"
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-xs text-muted-foreground">{t("step1.manualHint")}</p>
                        <CopyField
                          value={setup?.secret ?? ""}
                          copyLabel={t("step1.copy")}
                          copiedLabel={t("step1.copyError")}
                        />
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                          <Smartphone className="size-3.5" />
                          {t("step1.typeHint")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!loading && setup && (
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>{t("step2.title")}</CardTitle>
                    <CardDescription>{t("step2.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <form onSubmit={handleConfirm} className="space-y-4">
                      {error && (
                        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}
                      <div className="flex justify-center">
                        <OtpInput value={code} onChange={setCode} disabled={confirming} digitLabel={(n) => t("otpDigit", { n })} />
                      </div>
                      <div className="flex justify-center">
                        <Button
                          type="submit"
                          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white min-w-44"
                          disabled={!isReady || confirming}
                        >
                          {confirming ? <><Spinner className="mr-2" /> {t("activating")}</> : t("activate")}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}