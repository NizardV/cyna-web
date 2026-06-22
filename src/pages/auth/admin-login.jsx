/**
 * @file pages/auth/admin-login.jsx
 * @description Admin login with email + password + TOTP code — bootstrap-aware.
 *
 * Flow:
 *   1. Submit email + password only (no totpCode).
 *      - No 2FA configured yet → logged in directly, `requiresTwoFactorSetup: true`
 *        → redirect straight to the 2FA enrollment page. Never stuck.
 *      - 2FA active, no code sent → 401 `{ totpRequired: true }` → reveal step 2,
 *        no error shown (expected, not a failure).
 *      - Bad credentials → 401 with no totpRequired flag → show error, stay here.
 *   2. Submit email + password + totpCode.
 *      - Valid → logged in, go to /admin.
 *      - Invalid/expired code → 401 `{ totpRequired: true }` + message → stay on
 *        step 2, clear the field.
 */

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ShieldCheck, ArrowLeft, Eye, EyeOff, Smartphone } from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Spinner }  from "@/components/ui/spinner"
import { AuthCard } from "@/components/auth/auth-card"
import { OtpInput } from "@/components/auth/otp-input"
import { adminLogin } from "@/api/auth.js"
import { useAuth }  from "@/hooks/use-auth"

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

export function AdminLogin() {
  const { t } = useTranslation("admin-login")
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
   * Single submit path for both phases. `totpCode` is null on the first
   * attempt — the backend tells us, via response flags, what to do next.
   */
  const submit = async (totpCode) => {
    setLoading(true)
    setError("")
    try {
      const data = await adminLogin({ email, password, totpCode })

      // Success — either bootstrap (no 2FA yet) or full 2FA success.
      login()
      navigate(data?.requiresTwoFactorSetup ? "/account/security/2fa" : "/admin")
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

  const handleCredentials = (e) => {
    e.preventDefault()
    if (!credentialsOk) return
    submit(null)
  }

  const handleTotp = (e) => {
    e.preventDefault()
    if (!totpOk) return
    submit(totp.trim())
  }

  return (
    <AuthCard
      icon={
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="size-6 text-[#7C3AED]" />
        </div>
      }
      title={t("title")}
      subtitle={phase === 1 ? t("subtitlePhase1") : t("subtitlePhase2")}
      footer={
        <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="size-3.5" /> {t("standardLoginLink")}
        </Link>
      }
    >
      <div className="flex items-center justify-center gap-2 mb-6 -mt-2">
        <StepPill step={1} active={phase === 1} done={phase > 1} />
        <div className="w-8 h-px bg-gray-200" />
        <StepPill step={2} active={phase === 2} done={false} />
      </div>

      {phase === 1 && (
        <form onSubmit={handleCredentials} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              placeholder={t("emailPlaceholder")}
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("passwordLabel")}</Label>
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
            {loading ? <><Spinner className="mr-2" /> {t("verifying")}</> : t("continue")}
          </Button>
        </form>
      )}

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
              <p className="text-xs font-medium text-[#5B21B6]">{t("appHint.title")}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("appHint.description", { email })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block text-center">{t("totpLabel")}</Label>
            <OtpInput value={totp} onChange={setTotp} disabled={loading} digitLabel={(n) => t("otpDigit", { n })} />
            <p className="text-center text-xs text-gray-400">{t("totpHint")}</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            disabled={!totpOk || loading}
          >
            {loading ? <><Spinner className="mr-2" /> {t("verifying")}</> : t("submit")}
          </Button>

          <button
            type="button"
            onClick={() => { setPhase(1); setTotp(""); setError("") }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            {t("editCredentials")}
          </button>
        </form>
      )}
    </AuthCard>
  )
}