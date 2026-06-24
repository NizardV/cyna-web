import { ProductCard } from "@/components/product/product-card";
import { useTranslation } from "react-i18next";

/**
 * Grille des produits similaires mis en avant sur la page produit.
 *
 * @param {{ products: object[] }} props
 */
export function SimilarProducts({ products }) {
  const { t } = useTranslation("product");

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-slate-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* L'espace est géré ici avec "mb-10" (margin-bottom) au lieu de "mb-2" */}
        <h2 className="text-2xl font-bold text-gray-900 mb-10">
          {t("similarServicesTitle")}
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