import { useTranslation } from "react-i18next";

/**
 * Section de texte éditorial fixe sur la page d'accueil (mission/présentation Cyna).
 * Le contenu du paragraphe provient de l'API ; le titre est une clé i18n.
 *
 * @param {{ text: string }} props
 */
export function FixedText({ text }) {
  const { t } = useTranslation("home");

  if (!text) return null;

  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {t("fixedTextTitle")}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
          {text}
        </p>
      </div>
    </section>
  );
}