/**
 * @file pages/auth/confirm-email.jsx
 * @description OTP email confirmation page (after register or email change).
 */

import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { MailCheck, ArrowLeft, Check } from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Spinner }  from "@/components/ui/spinner"
import { AuthCard, AuthSuccessCard } from "@/components/auth/auth-card"
import { OtpInput } from "@/components/auth/otp-input"
import { confirmEmail, forgotPassword } from "@/api/auth.js"

export function ConfirmEmail() {
  const { t } = useTranslation("confirm-email")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email,   setEmail]   = useState(searchParams.get("email") ?? "")
  const [code,    setCode]    = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isReady      = isEmailValid && code.trim().length === 6

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isReady) return
    setLoading(true)
    setError("")
    try {
      await confirmEmail({ email, code: code.trim() })
      setSuccess(true)
    } catch {
      setError(t("errorInvalidCode"))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!isEmailValid) return
    try {
      // No standalone "resend verification" route on the backend yet —
      // forgot-password issues a fresh OTP to the same inbox as a stand-in.
      await forgotPassword({ email })
      setError("")
    } catch {
      setError(t("errorResend"))
    }
  }

  if (success) {
    return (
      <AuthSuccessCard icon={<Check className="size-7 text-green-600" strokeWidth={2.5} />} title={t("success.title")}>
        <p className="text-sm text-gray-500 mb-8">{t("success.description")}</p>
        <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" onClick={() => navigate("/")}>
          {t("success.cta")}
        </Button>
      </AuthSuccessCard>
    )
  }

  return (
    <AuthCard
      icon={<MailCheck className="size-6 text-[#7C3AED]" />}
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
        </div>

        <Button
          type="submit"
          className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          disabled={!isReady || loading}
        >
          {loading ? <><Spinner className="mr-2" /> {t("submitting")}</> : t("submit")}
        </Button>

        <p className="text-center text-xs text-gray-400">
          {t("noCode")}{" "}
          <button type="button" onClick={handleResend} className="text-[#7C3AED] underline underline-offset-2 hover:text-[#6D28D9]">
            {t("resend")}
          </button>
        </p>
      </form>
    </AuthCard>
  )
}