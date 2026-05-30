import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { loginUser } from "@/api/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const isFormValid = formData.email.trim() && formData.password.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await loginUser({
        email: formData.email,
        password: formData.password,
      });
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-[#EDE9FE]">
            <Lock className="h-6 w-6 text-[#7C3AED]" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold mb-2">Bon retour</h1>
        <p className="text-center text-gray-600 mb-6">
          Ou{" "}
          <Link to="/register" className="text-[#7C3AED] font-semibold hover:underline">
            créez un compte gratuitement
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

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
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={loading}
                className="h-4 w-4 cursor-pointer rounded border-gray-300"
              />
              <span className="text-gray-700">Se souvenir de moi</span>
            </label>
            <Link to="#" className="text-[#7C3AED] font-semibold hover:underline">
              Mot de passe oublié ?
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
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
