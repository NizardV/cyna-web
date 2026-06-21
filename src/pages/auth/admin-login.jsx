/**
 * @file pages/auth/admin-login.jsx
 * @description Admin login with email + password + TOTP code — bootstrap-aware.
 * POST /auth/admin/login  { email, password, totpCode? }
 *
 * Flow:
 *   1. Submit email + password only (no totpCode).
 *      - Backend has no 2FA configured yet for this account → logs in directly
 *        and returns { requiresTwoFactorSetup: true }. We redirect straight to
 *        the 2FA enrollment page — never stuck.
 *      - Backend has 2FA active and no code was sent → 401 with
 *        { totpRequired: true }. We just reveal the TOTP step, no error shown
 *        (it's expected, not a failure).
 *      - Bad credentials → 401 with no totpRequired flag → show error, stay here.
 *   2. Submit email + password + totpCode.
 *      - Valid → logged in, go to /admin.
 *      - Invalid/expired code → 401 with totpRequired: true → show error, stay
 *        on the code step, clear the field.
 */

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShieldCheck, ArrowLeft, Eye, EyeOff, Smartphone } from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Spinner }  from "@/components/ui/spinner"
import { Layout }   from "@/components/layout/layout"
import { OtpInput } from "@/components/auth/otp-input"
import { apiClient } from "@/api/client.js"
import { useAuth }  from "@/hooks/use-auth"

// ---------------------------------------------------------------------------
// Stepper pill
// ---------------------------------------------------------------------------

function StepPill({ step, active, done }) {
  return (
    <div
      className={[
        "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
        done  ? "bg-[#7C3AED] text-white"
             : active ? "bg-gray-900 text-white"
             : "bg-gray-200 text-gray-500",
      ].join(" ")}
    >
      {step}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPwd,  setShowPwd]  = useState(false)
  const [totp,     setTotp]     = useState("")
  const [phase,    setPhase]    = useState(1) // 1 = credentials, 2 = TOTP
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  const credentialsOk = email.trim() && password.trim()
  const totpOk         = totp.trim().length === 6

  /**
   * Single submit function for both phases — phase is decided by whether
   * totpCode is included, and the backend tells us what to do next.
   */
  const submit = async (totpCode) => {
    setLoading(true)
    setError("")
    try {
      const data = await apiClient.post("/auth/admin/login", {
        email,
        password,
        totpCode
      })

      // Success — either bootstrap (no 2FA yet) or full 2FA success.
      login()
      if (data?.requiresTwoFactorSetup) {
        navigate("/account/security/2fa")
      } else {
        navigate("/admin")
      }
    } catch (err) {
      const body = err?.response?.data ?? {}
      if (body.totpRequired) {
        // Credentials were fine — we just need (or got wrong) a TOTP code.
        setPhase(2)
        setError(totpCode ? (body.message ?? "Code TOTP invalide ou expiré.") : "")
        if (totpCode) setTotp("")
      } else {
        // Bad credentials, disabled account, or insufficient role.
        setError(body.message ?? "Identifiants invalides.")
        setPhase(1)
        setPassword("")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCredentials = async (e) => {
    e.preventDefault()
    if (!credentialsOk) return
    
    setLoading(true)
    setError("")
    try {
      // Premier appel sans totpCode — détecte le cas bootstrap
      const data = await apiClient.post("/auth/admin/login", { email, password })
      // Bootstrap : 2FA pas encore configuré → connexion directe
      login()
      navigate("/account/security/2fa")
    } catch (err) {
      const body = err?.data ?? {}
      if (body.totpRequired) {
        setPhase(2)
      } else {
        setError(err.message ?? "Identifiants invalides.")
        setPassword("")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTotp = (e) => {
    e.preventDefault()
    if (!totpOk) return
    submit(totp.trim())
  }

  return (
    <Layout hideSearch hideNav hideUserSection>
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

          {/* Icon + stepper */}
          <div className="flex flex-col items-center mb-6 gap-3">
            <div className="flex items-center justify-center size-12 rounded-lg bg-[#EDE9FE]">
              <ShieldCheck className="size-6 text-[#7C3AED]" />
            </div>
            <div className="flex items-center gap-2">
              <StepPill step={1} active={phase === 1} done={phase > 1} />
              <div className="w-8 h-px bg-gray-200" />
              <StepPill step={2} active={phase === 2} done={false} />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold mb-1 text-gray-900">
            Espace administrateur
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">
            {phase === 1
              ? "Connexion sécurisée avec authentification à deux facteurs."
              : "Saisissez le code TOTP de votre application d'authentification."
            }
          </p>

          {/* ── Phase 1 : credentials ───────────────────────────────────────── */}
          {phase === 1 && (
            <form onSubmit={handleCredentials} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  placeholder="admin@cyna.fr"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={!credentialsOk || loading}
              >
                {loading ? <><Spinner className="mr-2" /> Vérification…</> : "Continuer →"}
              </Button>
            </form>
          )}

          {/* ── Phase 2 : TOTP ──────────────────────────────────────────────── */}
          {phase === 2 && (
            <form onSubmit={handleTotp} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-lg border border-[#DDD6FE] bg-[#EDE9FE]/40 p-3 flex items-start gap-3">
                <Smartphone className="size-4 text-[#7C3AED] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[#5B21B6]">Application d'authentification</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ouvrez Google Authenticator, Authy ou toute autre application TOTP
                    et saisissez le code à 6 chiffres affiché pour <strong>{email}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-center">Code TOTP</Label>
                <OtpInput value={totp} onChange={setTotp} disabled={loading} />
                <p className="text-center text-xs text-gray-400">
                  Le code change toutes les 30 secondes.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                disabled={!totpOk || loading}
              >
                {loading ? <><Spinner className="mr-2" /> Vérification…</> : "Se connecter"}
              </Button>

              <button
                type="button"
                onClick={() => { setPhase(1); setTotp(""); setError("") }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
              >
                ← Modifier mes identifiants
              </button>
            </form>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Connexion utilisateur standard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}