/**
 * @file pages/auth/forgot-password.jsx
 * @description Step 1 of 3 — user enters their email to receive a reset OTP.
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react"
import { Button }  from "@/components/ui/button"
import { Input }   from "@/components/ui/input"
import { Label }   from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AuthCard, AuthSuccessCard } from "@/components/auth/auth-card"
import { forgotPassword } from "@/api/auth.js"

export function ForgotPassword() {
  const { t } = useTranslation("forgot-password")

  const [email,     setEmail]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState("")

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError("")
    try {
      await forgotPassword({ email })
      setSubmitted(true)
    } catch {
      // Anti-enumeration: backend always 200, so real errors are network/server
      setError(t("errorGeneric"))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthSuccessCard icon={<Mail className="size-7 text-[#7C3AED]" />} title={t("success.title")}>
        <p className="text-sm text-gray-500 mb-1">{t("success.description", { email })}</p>
        <p className="text-xs text-gray-400 mb-8">{t("success.spamHint")}</p>

        <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="block w-full">
          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            {t("success.enterCode")}
          </Button>
        </Link>

        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
        >
          {t("success.resend")}
        </button>
      </AuthSuccessCard>
    )
  }

  return (
    <AuthCard
      icon={<ShieldCheck className="size-6 text-[#7C3AED]" />}
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="size-3.5" /> {t("backToLogin")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError("") }}
            disabled={loading}
            autoFocus
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          disabled={!isValid || loading}
        >
          {loading ? <><Spinner className="mr-2" /> {t("sending")}</> : t("submit")}
        </Button>
      </form>
    </AuthCard>
  )
}