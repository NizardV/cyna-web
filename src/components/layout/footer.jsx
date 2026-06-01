import { Link } from "react-router-dom";
import { Share2, Share } from "lucide-react";

export function Footer({ hideDescription = false, hideInfoSection = false, hideLegalSection = false, hideSocial = false }) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="px-6 py-12">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#7C3AED]">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-white">CYNA</span>
            </Link>
            {!hideDescription && (
              <p className="text-sm leading-relaxed">
                Votre partenaire de confiance pour la sécurité de vos infrastructures IT. Solutions SaaS performantes et évolutives.
              </p>
            )}
          </div>

          {!hideInfoSection && (
            <div>
              <h3 className="font-semibold text-white mb-4">INFORMATIONS</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition">
                    À propos de Cyna
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Contactez-nous
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {!hideLegalSection && (
            <div>
              <h3 className="font-semibold text-white mb-4">LÉGAL</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Conditions Générales (CGU)
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {!hideSocial && (
            <div>
              <h3 className="font-semibold text-white mb-4">SUIVEZ-NOUS</h3>
              <div className="flex gap-4">
                <a href="#" className="p-2 hover:bg-gray-800 rounded-lg transition">
                  <Share2 className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 hover:bg-gray-800 rounded-lg transition">
                  <Share className="h-5 w-5" />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-500">© 2024 Cyna. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
