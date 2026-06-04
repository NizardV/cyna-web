import { useState } from "react";
import { User, Lock, ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Search } from "./search";

export function Header({ hideNav = false, hideUserSection = false }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">

      {/* ── Barre principale ── */}
      <div className="flex items-center px-4 py-3 md:px-6 md:py-4 gap-4">

        {/* Zone gauche : Logo + Search — flex-1 pour pousser la nav au centre */}
        <div className="flex items-center gap-4 flex-1">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#7C3AED]">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg">CYNA</span>
          </Link>

          {/* Search — cachée sur mobile */}
          <div className="hidden md:flex w-full max-w-xs">
            <Search />
          </div>
        </div>

        {/* Zone centre : Nav desktop — sans flex-1, donc vraiment centrée */}
        {!hideNav && (
          <nav className="hidden md:flex items-center gap-6 shrink-0">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Accueil
            </Link>
            <Link to="/catalog" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Catalogue
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </nav>
        )}

        {/* Zone droite : Actions — flex-1 + justify-end pour symétrie avec la gauche */}
        <div className="flex items-center gap-2 flex-1 justify-end">

          {!hideUserSection && (
            <>
              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
              </Link>

              {user ? (
                <Link to="/account/profile" className="hidden md:flex items-center gap-2 hover:opacity-80 transition">
                  <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <User className="h-5 w-5 text-gray-700" />
                  </Link>
                  <Link to="/login" className="hidden md:block">
                    <Button className="bg-gray-900 text-white hover:bg-gray-800 gap-2">
                      <Lock className="h-4 w-4" />
                      Espace Client
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}

          {/* Burger — mobile uniquement */}
          {!hideNav && (
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Menu mobile déroulant ── */}
      {menuOpen && !hideNav && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">

          {/* Search mobile */}
          <div className="pt-3 pb-2">
            <Search />
          </div>

          {/* Liens nav */}
          <nav className="flex flex-col gap-1 pt-1">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Accueil
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Catalogue
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              Contact
            </Link>
          </nav>

          {/* Bouton Espace Client mobile */}
          {!hideUserSection && !user && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 gap-2">
                  <Lock className="h-4 w-4" />
                  Espace Client
                </Button>
              </Link>
            </div>
          )}

          {/* Avatar mobile si connecté */}
          {!hideUserSection && user && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <Link
                to="/account/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
