import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { registerUser } from "@/api/auth";

const PASSWORD_RULES = [
  { id: "length", label: "password.minLength", test: (pwd) => pwd.length >= 8 },
  { id: "uppercase", label: "password.uppercase", test: (pwd) => /[A-Z]/.test(pwd) },
  { id: "number", label: "password.number", test: (pwd) => /[0-9]/.test(pwd) },
  { id: "special", label: "password.special", test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
];

export function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { setLoading } = useAuth();

  // ALIGNEMENT : Remplacement de fullName par firstName et lastName
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const passwordValidation = PASSWORD_RULES.map((rule) => ({
    ...rule,
    satisfied: rule.test(formData.password),
  }));

  const isPasswordValid = passwordValidation.every((rule) => rule.satisfied);

  // ALIGNEMENT : Validation mise à jour
  const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && isPasswordValid;

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
      setError(t("register.fillAllFields"));
      return;
    }

    setLoadingState(true);
    setLoading(true);
    setError("");

    try {
      // ALIGNEMENT : Envoi direct du nouveau format de DTO propre
      const response = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      if (response) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("register.error"));
    } finally {
      setLoadingState(false);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout hideSearch hideNav hideUserSection>
        <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="size-16 text-green-500" />
            </div>
            <h2 className="text-center text-2xl font-bold mb-2">{t("register.success")}</h2>
            <p className="text-center text-gray-600 mb-1">{t("register.successMessage")}</p>
            <p className="text-center text-sm text-gray-500 mb-6">
              Un code de vérification à 6 chiffres a été envoyé à{" "}
              <span className="font-medium text-gray-800">{formData.email}</span>.
            </p>

            <Link to={`/confirm-email?email=${encodeURIComponent(formData.email)}`}>
              <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
                Vérifier mon email →
              </Button>
            </Link>

            <Link to="/login" className="block mt-3">
              <Button className="w-full" variant="outline">
                {t("register.returnToLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideSearch hideNav hideUserSection>
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-center text-2xl font-bold mb-2">{t("register.title")}</h1>
          <p className="text-center text-gray-600 mb-6">
            {t("register.subtitle")}
            <Link to="/login" className="text-[#7C3AED] font-semibold hover:underline ms-1">
              {t("register.subtitleLink")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ALIGNEMENT : Grille responsive pour Prénom et Nom côte à côte */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("register.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("register.emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("register.passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange}
                onFocus={handlePasswordFocus}
                disabled={loading}
                required
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
                        className={`text-sm ${rule.satisfied ? "text-green-700" : "text-gray-600"
                          }`}
                      >
                        {t(rule.label)}
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
                  {t("register.signingUp")}
                </>
              ) : (
                t("register.submit")
              )}
            </Button>

            <div className="rounded-lg border border-[#DDD6FE] bg-[#EDE9FE]/60 p-4">
              <p className="text-sm font-semibold text-[#7C3AED] mb-1">{t("register.nextStep")}</p>
              <p className="text-sm text-gray-700">{t("register.nextStepMessage")}</p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}