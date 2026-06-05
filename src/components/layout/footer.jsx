import { Link } from "react-router-dom";
import { MapPin, Mail, Phone } from "lucide-react";

function LinkedinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export function Footer({
  hideDescription = false,
  hideInfoSection = false,
  hideLegalSection = false,
  hideSocial = false,
}) {
  return (
    <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Grille : logo prend 2 cols sur 4 ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Logo + description + coordonnées — 2 colonnes */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">CYNA</span>
            </Link>

            {!hideDescription && (
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
                Votre partenaire de confiance pour la sécurité de vos infrastructures IT.
                Solutions SaaS performantes et évolutives.
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p>67 rue de Penthièvre, 75028 Paris</p>
                  <p>69 Rue Aristide Briand, 21000 Dijon</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+33100000000" className="hover:text-white transition">+33 (0)1 00 00 00 00</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:contact@cyna.fr" className="hover:text-white transition">contact@cyna-diiage.fr</a>
              </div>
            </div>
          </div>

          {/* Informations — 1 colonne */}
          {!hideInfoSection && (
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
                Informations
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-gray-400 hover:text-[#7C3AED] transition text-sm">
                    À propos de Cyna
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="text-gray-400 hover:text-[#7C3AED] transition text-sm">
                    Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-[#7C3AED] transition text-sm">
                    Contactez-nous
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Légal — 1 colonne */}
          {!hideLegalSection && (
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
                Légal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/mentions-legales" className="text-gray-400 hover:text-[#7C3AED] transition text-sm">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link to="/cgu" className="text-gray-400 hover:text-[#7C3AED] transition text-sm">
                    Conditions Générales (CGU)
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-[#7C3AED] transition text-sm">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* ── Barre copyright ── */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">CYNA PROJET DIIAGE. © 2025 Tous droits réservés.</p>

          {!hideSocial && (
            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/company/cyna-it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-500 hover:text-white transition text-sm"
              >
                <LinkedinIcon className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href="https://x.com/cyna_it"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-500 hover:text-white transition text-sm"
              >
                <XIcon className="h-4 w-4" />
                Twitter
              </a>
            </div>
          )}
        </div>

      </div>
    </footer>
  );
}
