import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { registerUser } from "@/api/auth";

const PASSWORD_RULES = [
  { id: "length", label: "8 caractères minimum", test: (pwd) => pwd.length >= 8 },
  { id: "uppercase", label: "Une majuscule", test: (pwd) => /[A-Z]/.test(pwd) },
  { id: "number", label: "Un chiffre", test: (pwd) => /[0-9]/.test(pwd) },
  { id: "special", label: "Un caractère spécial", test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const passwordValidation = PASSWORD_RULES.map((rule) => ({
    ...rule,
    satisfied: rule.test(formData.password),
  }));

  const isPasswordValid = passwordValidation.every((rule) => rule.satisfied);
  const isFormValid = formData.fullName.trim() && formData.email.trim() && isPasswordValid;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePasswordFocus = () => {
    setShowPasswordRules(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Veuillez remplir tous les champs et respecter les critères de mot de passe.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-center text-2xl font-bold mb-2">Inscription réussie!</h2>
          <p className="text-center text-gray-600 mb-6">
            Un e-mail de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.
          </p>
          <Link to="/login">
            <Button className="w-full" variant="default">
              Retourner à la connexion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold mb-2">Créer un compte</h1>
        <p className="text-center text-gray-600 mb-6">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-[#7C3AED] font-semibold hover:underline">
            Connectez-vous
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jean Dupont"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vous@entreprise.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              disabled={loading}
            />
            {showPasswordRules && formData.password && (
              <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                {passwordValidation.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    {rule.satisfied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                    <span
                      className={`text-sm ${
                        rule.satisfied ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-[#7C3AED] text-white hover:bg-[#6d28d9]"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>

          <div className="rounded-lg border border-[#DDD6FE] bg-[#EDE9FE]/60 p-4">
            <p className="text-sm font-semibold text-[#7C3AED] mb-1">Étape suivante</p>
            <p className="text-sm text-gray-700">
              Après validation, un e-mail de confirmation vous sera envoyé pour activer votre compte de manière sécurisée.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
