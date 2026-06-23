import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn, formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/home/product-card"

/**
 * Grille des produits mis en avant (top produits) sur la page d'accueil.
 * Calcule le prix d'entrée à partir des pricingTiers du premier plan disponible.
 *
 * @param {{ products: object[] }} props
 */
export function FeaturedProducts({ products }) {
  const { t } = useTranslation("home");

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          {t("topProductsTitle")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
        </div>
      </div>
    </section>
  );
}
