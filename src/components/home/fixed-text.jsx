import { useTranslation } from "react-i18next";

export function FixedText({ text }) {
  const { t } = useTranslation("home");

  // Si le texte n'est pas encore chargé ou absent de la BDD, on n'affiche rien
  if (!text) return null;

  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {/* Traduction mise à jour pour coller au CDCF */}
          {t("fixedTextTitle")}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
          {text}
        </p>
      </div>
    </section>
  );
}