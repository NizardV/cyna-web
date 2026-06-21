/**
 * @file pages/auth/forgot-password.jsx
 * @description Step 1 of 3 — user enters their email to receive a reset OTP.
 * POST /auth/forgot-password
 */

import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react"
import { Button }  from "@/components/ui/button"
import { Input }   from "@/components/ui/input"
import { Label }   from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Layout }  from "@/components/layout/layout"
import { apiClient } from "@/api/client.js"

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ForgotPassword() {
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
      await apiClient.post("/auth/forgot-password", { email })
      setSubmitted(true)
    } catch (err) {
      // Anti-enumeration: backend always 200, so real errors are network/server
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Layout hideSearch hideNav hideUserSection>
        <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">

            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-[#EDE9FE]">
              <Mail className="size-7 text-[#7C3AED]" />
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Vérifiez votre boîte mail
            </h1>
            <p className="text-sm text-gray-500 mb-1">
              Si <span className="font-medium text-gray-800">{email}</span> correspond à un compte,
              vous recevrez un code à 6 chiffres valable <strong>15 minutes</strong>.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Pensez à vérifier vos spams.
            </p>

            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}`}
              className="block w-full"
            >
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Saisir le code reçu →
              </Button>
            </Link>

            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              Renvoyer un code
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <Layout hideSearch hideNav hideUserSection>
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-[#EDE9FE]">
              <ShieldCheck className="size-6 text-[#7C3AED]" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold mb-1 text-gray-900">
            Mot de passe oublié ?
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">
            Saisissez votre email et nous vous enverrons un code de réinitialisation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@example.com"
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
              {loading ? <><Spinner className="mr-2" /> Envoi en cours…</> : "Envoyer le code"}
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