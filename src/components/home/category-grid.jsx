import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"

/**
 * Grille des catégories en page d'accueil, chaque carte est un lien vers le catalogue de la catégorie.
 *
 * @param {{ categories: Array<{ id: string|number, slug: string, name: string, imageUrl: string }> }} props
 */
export function CategoryGrid({ categories }) {
  const { t } = useTranslation("home");

  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          {t("categoriesTitle")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog/category/${category.slug}`}
              className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-64 flex items-end cursor-pointer"
            >
              <img
                src={category.imageUrl}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              <h3 className="relative z-10 p-6 text-xl font-bold text-white w-full text-center tracking-wide">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}