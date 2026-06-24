import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { loginUser } from "@/api/auth";

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation(["auth", "auth-extra"]);
  const { login, setLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const isFormValid = formData.email.trim() && formData.password.trim();

  const handleFormFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRememberMeToggle = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(t("login.fillAllFields"));
      return;
    }

    setLoadingState(true);
    setLoading(true);
    setError("");

    try {
      await loginUser({ email: formData.email, password: formData.password });
      login();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("login.error"));
    } finally {
      setLoadingState(false);
      setLoading(false);
    }
  };

  return (
    <Layout hideSearch hideNav hideUserSection>
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center size-12 rounded-lg bg-[#EDE9FE]">
              <Lock className="size-6 text-[#7C3AED]" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold mb-2">{t("login.title")}</h1>
          <p className="text-center text-gray-600 mb-6">
            {t("login.subtitle")}
            <Link to="/register" className="text-[#7C3AED] font-semibold hover:underline">
              {t("login.subtitleLink")}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("login.emailPlaceholder")}
                value={formData.email}
                onChange={handleFormFieldChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("login.passwordPlaceholder")}
                value={formData.password}
                onChange={handleFormFieldChange}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeToggle}
                  disabled={loading}
                  className="size-4 cursor-pointer rounded border-gray-300"
                />
                <span className="text-gray-700">{t("login.rememberMe")}</span>
              </label>
              <Link to="/forgot-password" className="text-[#7C3AED] font-semibold hover:underline">
                {t("login.forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 text-white hover:bg-gray-800"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2" />
                  {t("login.signingIn")}
                </>
              ) : (
                t("login.submit")
              )}
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <Link
              to="/admin/login"
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              {t("auth-extra:adminLoginLink")}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}