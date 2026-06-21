/**
 * @file pages/account/security-2fa.jsx
 * @description Admin 2FA enrollment: generate a TOTP secret, show it as a QR
 * code + manual entry key, then confirm activation with a first code.
 *
 * POST /auth/2fa/setup    → { secret, otpAuthUrl }
 * POST /auth/2fa/confirm  → { totpCode }
 *
 * Reachable from account security settings. Requires an authenticated session
 * (any role can technically call /auth/2fa/setup, but it's only meaningful
 * for Admin / SuperAdmin who must then use /auth/admin/login).
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Copy, Check, Smartphone, AlertTriangle } from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Spinner }  from "@/components/ui/spinner"
import { Layout }   from "@/components/layout/layout"
import { AccountNav } from "@/components/account/account-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OtpInput } from "@/components/auth/otp-input"
import { apiClient } from "@/api/client.js"
import { getMe } from "@/api/user.js"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// CopyField — secret key with copy-to-clipboard
// ---------------------------------------------------------------------------

function CopyField({ value }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Impossible de copier automatiquement.")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-xs font-mono tracking-wider text-foreground">
        {value}
      </code>
      <Button type="button" variant="outline" size="icon-sm" onClick={handleCopy} title="Copier">
        {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function Security2FA() {
  const navigate = useNavigate()

  const [user,        setUser]        = useState(null)
  const [loadingUser, setLoadingUser]  = useState(true)

  const [setup,    setSetup]    = useState(null)   // { secret, otpAuthUrl }
  const [loading,  setLoading]  = useState(true)
  const [code,     setCode]     = useState("")
  const [error,    setError]    = useState("")
  const [confirming, setConfirming] = useState(false)
  const [activated, setActivated]   = useState(false)

  useEffect(() => {
    getMe().then(setUser).catch(() => {}).finally(() => setLoadingUser(false))
  }, [])

  useEffect(() => {
    apiClient.post("/auth/2fa/setup")
      .then((data) => setSetup(data))
      .catch(() => setError("Impossible de générer la clé 2FA. Réessayez plus tard."))
      .finally(() => setLoading(false))
  }, [])

  const isReady = code.trim().length === 6

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!isReady) return
    setConfirming(true)
    setError("")
    try {
      await apiClient.post("/auth/2fa/confirm", { totpCode: code.trim() })
      setActivated(true)
      toast.success("Authentification à deux facteurs activée.")
    } catch {
      setError("Code invalide. Vérifiez l'heure de votre téléphone et réessayez.")
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

        {/* Sidebar */}
        <div className="w-full md:w-52 md:shrink-0">
          <AccountNav user={loadingUser ? undefined : user ?? undefined} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#EDE9FE]">
              <ShieldCheck className="size-5 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Double authentification</h1>
              <p className="text-xs text-muted-foreground">
                Sécurisez votre compte administrateur avec un code TOTP.
              </p>
            </div>
          </div>

          {activated ? (
            <Card>
              <CardContent className="py-10 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
                  <Check className="size-7 text-green-600" strokeWidth={2.5} />
                </div>
                <h2 className="text-base font-bold text-foreground mb-1">2FA activé avec succès</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Vous devrez désormais utiliser la connexion administrateur avec votre code TOTP.
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => navigate("/admin")}>
                    Accéder au tableau de bord
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/account/profile")}>
                    Retour au profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">

              {/* Step 1 — Scan */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>1. Scannez le QR code</CardTitle>
                  <CardDescription>
                    Avec Google Authenticator, Authy, ou toute autre application TOTP.
                  </CardDescription>
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
                        alt="QR code 2FA"
                        className="size-[140px] shrink-0 rounded-lg ring-1 ring-foreground/10"
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Vous ne pouvez pas scanner ? Entrez cette clé manuellement :
                        </p>
                        <CopyField value={setup?.secret ?? ""} />
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                          <Smartphone className="size-3.5" />
                          Type : Basé sur le temps (TOTP), 6 chiffres, 30 secondes.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2 — Confirm */}
              {!loading && setup && (
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>2. Confirmez l'activation</CardTitle>
                    <CardDescription>
                      Saisissez le code à 6 chiffres affiché dans votre application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <form onSubmit={handleConfirm} className="space-y-4">
                      {error && (
                        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                          {error}
                        </div>
                      )}
                      <div className="flex justify-center">
                        <OtpInput value={code} onChange={setCode} disabled={confirming} />
                      </div>
                      <div className="flex justify-center">
                        <Button
                          type="submit"
                          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white min-w-44"
                          disabled={!isReady || confirming}
                        >
                          {confirming ? <><Spinner className="mr-2" /> Activation…</> : "Activer le 2FA"}
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