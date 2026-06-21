/**
 * @file pages/auth/confirm-email.jsx
 * @description OTP email confirmation page.
 * POST /auth/confirm-email  { email, code }
 *
 * Reached after:
 *   - Registration  → the user is redirected here from the success screen
 *   - Profile email change → shown as a banner/redirect once the profile is saved
 *
 * ?email= pre-fills the email field.
 */

import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { MailCheck, ArrowLeft, Check } from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Spinner }  from "@/components/ui/spinner"
import { Layout }   from "@/components/layout/layout"
import { OtpInput } from "@/components/auth/otp-input"
import { apiClient } from "@/api/client.js"

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ConfirmEmail() {
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
      await apiClient.post("/auth/confirm-email", { email, code: code.trim() })
      setSuccess(true)
    } catch {
      setError("Code invalide ou expiré. Vérifiez votre email ou demandez un nouveau code.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!isEmailValid) return
    try {
      // The backend doesn't expose a standalone "resend" route; re-triggering
      // forgot-password with email triggers a new verification code.
      // Alternatively wire to a dedicated /auth/resend-verification if added.
      await apiClient.post("/auth/forgot-password", { email })
      setError("")
    } catch {
      setError("Impossible de renvoyer le code. Réessayez dans quelques instants.")
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
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email confirmé !</h1>
            <p className="text-sm text-gray-500 mb-8">
              Votre adresse email a été vérifiée avec succès.
            </p>
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() => navigate("/")}
            >
              Continuer vers l'accueil
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
              <MailCheck className="size-6 text-[#7C3AED]" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold mb-1 text-gray-900">
            Vérifiez votre email
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">
            Un code à 6 chiffres a été envoyé à votre adresse email.
            Il expire dans <strong>30 minutes</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email (editable in case the user arrived without ?email=) */}
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

            {/* OTP boxes */}
            <div className="space-y-2">
              <Label className="block text-center">Code de vérification</Label>
              <OtpInput value={code} onChange={setCode} disabled={loading} />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              disabled={!isReady || loading}
            >
              {loading
                ? <><Spinner className="mr-2" /> Vérification…</>
                : "Confirmer mon email"
              }
            </Button>

            <p className="text-center text-xs text-gray-400">
              Vous n'avez pas reçu de code ?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-[#7C3AED] underline underline-offset-2 hover:text-[#6D28D9]"
              >
                Renvoyer
              </button>
            </p>

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