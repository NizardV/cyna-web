import { Search, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export function Header({ hideSearch = false, hideNav = false, hideUserSection = false }) {
  const { user } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#7C3AED]">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-lg">CYNA</span>
        </Link>

        {!hideSearch && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une solution (RDC, EDR...)"
                className="pl-9"
              />
            </div>
          </div>
        )}

        {!hideNav && (
          <nav className="flex items-center gap-6 flex-1 justify-center">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Accueil
            </Link>
            <Link to="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Catégories
            </Link>
            <Link to="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </nav>
        )}

        {!hideUserSection && (
          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </div>
            ) : (
              <>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <User className="h-5 w-5 text-gray-700" />
                </button>
                <Link to="/login">
                  <Button className="bg-gray-900 text-white hover:bg-gray-800 gap-2">
                    <Lock className="h-4 w-4" />
                    Espace Client
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
