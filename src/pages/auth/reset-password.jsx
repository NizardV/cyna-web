/**
 * @file pages/auth/reset-password.jsx
 * @description Steps 2+3 — enter OTP code + choose new password.
 */

import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { KeyRound, ArrowLeft, Check, Eye, EyeOff } from "lucide-react"
import { Button }  from "@/components/ui/button"
import { Input }   from "@/components/ui/input"
import { Label }   from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AuthCard, AuthSuccessCard } from "@/components/auth/auth-card"
import { OtpInput } from "@/components/auth/otp-input"
import { PasswordStrength, isPasswordValid } from "@/components/auth/password-strength"
import { resetPassword } from "@/api/auth.js"

export function ResetPassword() {
  const { t } = useTranslation("reset-password")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email,     setEmail]     = useState(searchParams.get("email") ?? "")
  const [code,      setCode]      = useState("")
  const [password,  setPassword]  = useState("")
  const [showPwd,   setShowPwd]   = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")
  const [success,   setSuccess]   = useState(false)

  const pwdValid = isPasswordValid(password)
  const isReady  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && code.trim().length === 6 && pwdValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isReady) return
    setLoading(true)
    setError("")
    try {
      await resetPassword({ email, code: code.trim(), newPassword: password })
      setSuccess(true)
    } catch {
      setError(t("errorInvalidCode"))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthSuccessCard icon={<Check className="size-7 text-green-600" strokeWidth={2.5} />} title={t("success.title")}>
        <p className="text-sm text-gray-500 mb-8">{t("success.description")}</p>
        <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" onClick={() => navigate("/login")}>
          {t("success.cta")}
        </Button>
      </AuthSuccessCard>
    )
  }

  return (
    <AuthCard
      icon={<KeyRound className="size-6 text-[#7C3AED]" />}
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="size-3.5" /> {t("backToLogin")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">

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
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="block text-center">{t("codeLabel")}</Label>
          <OtpInput value={code} onChange={setCode} disabled={loading} digitLabel={(n) => t("otpDigit", { n })} />
          <p className="text-center text-xs text-gray-400 mt-1">
            {t("codeExpiry")}{" "}
            <Link to="/forgot-password" className="text-[#7C3AED] underline underline-offset-2">
              {t("resendCode")}
            </Link>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError("") }}
              onFocus={() => setShowRules(true)}
              placeholder="••••••••"
              disabled={loading}
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

          {showRules && password && (
            <PasswordStrength
              password={password}
              labels={{
                length:    t("passwordRules.length"),
                uppercase: t("passwordRules.uppercase"),
                number:    t("passwordRules.number"),
                special:   t("passwordRules.special"),
              }}
            />
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          disabled={!isReady || loading}
        >
          {loading ? <><Spinner className="mr-2" /> {t("submitting")}</> : t("submit")}
        </Button>
      </form>
    </AuthCard>
  )
}