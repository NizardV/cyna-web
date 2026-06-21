/**
 * @file pages/auth/reset-password.jsx
 * @description Steps 2+3 — enter OTP code + choose new password.
 * POST /auth/reset-password  { email, code, newPassword }
 *
 * The email is pre-filled from ?email= query param (set by forgot-password).
 * The user can override it if they land here directly.
 */

import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { KeyRound, ArrowLeft, Check, Circle, Eye, EyeOff } from "lucide-react"
import { Button }  from "@/components/ui/button"
import { Input }   from "@/components/ui/input"
import { Label }   from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Layout }  from "@/components/layout/layout"
import { OtpInput } from "@/components/auth/otp-input"
import { apiClient } from "@/api/client.js"

// ---------------------------------------------------------------------------
// Password rules (mirrors RegisterRequestDto : minLength 8)
// ---------------------------------------------------------------------------

const PWD_RULES = [
  { id: "length",    label: "8 caractères minimum",    test: (p) => p.length >= 8 },
  { id: "uppercase", label: "Une majuscule",           test: (p) => /[A-Z]/.test(p) },
  { id: "number",    label: "Un chiffre",              test: (p) => /[0-9]/.test(p) },
  { id: "special",   label: "Un caractère spécial",   test: (p) => /[^A-Za-z0-9]/.test(p) },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email,       setEmail]       = useState(searchParams.get("email") ?? "")
  const [code,        setCode]        = useState("")
  const [password,    setPassword]    = useState("")
  const [showPwd,     setShowPwd]     = useState(false)
  const [showRules,   setShowRules]   = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")
  const [success,     setSuccess]     = useState(false)

  const rules = PWD_RULES.map((r) => ({ ...r, ok: r.test(password) }))
  const isPwdValid = rules.every((r) => r.ok)
  const isReady    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && code.trim().length === 6 && isPwdValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isReady) return
    setLoading(true)
    setError("")
    try {
      await apiClient.post("/auth/reset-password", {
        email,
        code: code.trim(),
        newPassword: password,
      })
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.message ?? "Code invalide ou expiré. Vérifiez le code reçu par email.")
    } finally {
      setLoading(false)
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <Layout hideSearch hideNav hideUserSection>
        <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-green-100">
              <Check className="size-7 text-green-600" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Mot de passe réinitialisé</h1>
            <p className="text-sm text-gray-500 mb-8">
              Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.
            </p>
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() => navigate("/login")}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <Layout hideSearch hideNav hideUserSection>
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-[#EDE9FE]">
              <KeyRound className="size-6 text-[#7C3AED]" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold mb-1 text-gray-900">
            Nouveau mot de passe
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">
            Saisissez le code reçu par email et choisissez un nouveau mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email (pre-filled, editable) */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                placeholder="vous@example.com"
                disabled={loading}
                required
              />
            </div>

            {/* OTP */}
            <div className="space-y-2">
              <Label className="block text-center">
                Code à 6 chiffres
              </Label>
              <OtpInput value={code} onChange={setCode} disabled={loading} />
              <p className="text-center text-xs text-gray-400 mt-1">
                Le code expire dans 15 minutes.{" "}
                <Link
                  to={`/forgot-password`}
                  className="text-[#7C3AED] underline underline-offset-2"
                >
                  Renvoyer un code
                </Link>
              </p>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Nouveau mot de passe</Label>
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
                <div className="mt-2 space-y-1.5 rounded-lg bg-gray-50 p-3">
                  {rules.map((r) => (
                    <div key={r.id} className="flex items-center gap-2">
                      {r.ok
                        ? <Check  className="size-3.5 text-green-500" strokeWidth={2.5} />
                        : <Circle className="size-3.5 text-gray-300" />
                      }
                      <span className={`text-xs ${r.ok ? "text-green-700" : "text-gray-500"}`}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              disabled={!isReady || loading}
            >
              {loading
                ? <><Spinner className="mr-2" /> Réinitialisation…</>
                : "Réinitialiser le mot de passe"
              }
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Retour à la connexion
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  )
}