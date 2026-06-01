import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProduct, getSimilarProducts } from "@/api/products";
import { Layout } from "@/components/ui/layout/layout";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info"; // <-- Nouvel import !
import { FeaturedProducts } from "@/components/home/featured-products"; // <-- Réutilisation maline

export function Product() {
  const { id } = useParams();
  const { t } = useTranslation("product");
  
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // On exécute nos deux mocks (Détails + Similaires) en parallèle
        const [productData, similarData] = await Promise.all([
          getProduct(id),
          getSimilarProducts(id)
        ]);
        
        setProduct(productData);
        setSimilarProducts(similarData);
      } catch (error) {
        console.error("Erreur lors du chargement du produit", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  // Si on passe d'un produit à un autre via les recommandations, on veut remonter en haut de page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-primary">
          Chargement en cours...
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout>
      <main className="p-8 max-w-7xl mx-auto w-full py-12">
        
        {/* Le bloc principal : Galerie (gauche) + Infos (droite) */}
        <div className="flex flex-col md:flex-row gap-12 w-full mb-24">
          <ProductGallery images={product.images} productName={product.name} />
          
          <ProductInfo product={product} /> {/* <-- Intégration du composant */}
        </div>

      </main>

      {/* Les produits similaires en pleine largeur juste au-dessus du footer */}
      {similarProducts && similarProducts.length > 0 && (
        <div className="bg-slate-50 border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("similarServicesTitle")}
            </h2>
            {/* On réutilise le composant de la Home, il fera parfaitement l'affaire ! */}
            <FeaturedProducts products={similarProducts} />
          </div>
        </div>
      )}
    </Layout>
  );
}