import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProduct, getSimilarProducts } from "@/api/products";
import { Layout } from "@/components/layout/layout";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { PricingTiersTable } from "@/components/product/pricing-tiers-table";
import { ProductPricing } from "@/components/product/product-pricing";
import { FeaturedProducts } from "@/components/home/featured-products";
import { findTier, UnitType } from "@/lib/pricing";

export function Product() {
  const { id } = useParams();
  const { t } = useTranslation("product");

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [billingPeriod, setBillingPeriod] = useState(null);
  const [quantityUsers, setQuantityUsers] = useState(1);
  const [quantityDevices, setQuantityDevices] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productData, similarData] = await Promise.all([
          getProduct(id),
          getSimilarProducts(id),
        ]);
        setProduct(productData);
        setSimilarProducts(similarData);
        setBillingPeriod(productData?.pricingPlans?.[0]?.billingPeriod ?? null);
      } catch (error) {
        console.error("Erreur lors du chargement du produit", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  // Dérivé du state — recalculé à chaque changement de période ou quantité
  const currentPlan    = product?.pricingPlans?.find(p => p.billingPeriod === billingPeriod);
  const hasUserTiers   = currentPlan?.pricingTiers?.some(t => t.unitType === UnitType.USER);
  const hasDeviceTiers = currentPlan?.pricingTiers?.some(t => t.unitType === UnitType.DEVICE);
  const tierUser       = hasUserTiers   ? findTier(currentPlan.pricingTiers, UnitType.USER,   quantityUsers)   : null;
  const tierDevice     = hasDeviceTiers ? findTier(currentPlan.pricingTiers, UnitType.DEVICE, quantityDevices) : null;
  const totalPrice     = (tierUser   ? tierUser.unitPrice   * quantityUsers   : 0)
                       + (tierDevice ? tierDevice.unitPrice * quantityDevices : 0);
  const isQuoteRequired = currentPlan && (
    (hasUserTiers   && quantityUsers   > currentPlan.maxUsersCheckout)   ||
    (hasDeviceTiers && quantityDevices > currentPlan.maxDevicesCheckout)
  );

  const handleBillingPeriodChange = (period) => {
    setBillingPeriod(period);
    setQuantityUsers(1);
    setQuantityDevices(0);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-primary">
          Chargement en cours...
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <p className="text-6xl">🔍</p>
          <h1 className="text-2xl font-bold text-gray-900">Produit introuvable</h1>
          <p className="text-gray-500">Ce produit n'existe pas ou a été supprimé.</p>
          <Link
            to="/catalog"
            className="mt-2 text-sm font-medium text-primary underline underline-offset-4"
          >
            ← Retour au catalogue
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="p-8 max-w-7xl mx-auto w-full py-12">

        {/* Galerie (gauche) + Info haut : badge, titre, specs, toggle (droite) */}
        <div className="flex flex-col md:flex-row gap-12 w-full mb-8">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo
            product={product}
            billingPeriod={billingPeriod}
            onBillingPeriodChange={handleBillingPeriodChange}
          />
        </div>

        {/* Grille de tarification — pleine largeur */}
        {currentPlan && (
          <div className="mb-6">
            <PricingTiersTable
              tiers={currentPlan.pricingTiers}
              activeTierUser={tierUser}
              activeTierDevice={tierDevice}
            />
          </div>
        )}

        {/* Compteurs + prix + CTA — pleine largeur */}
        {currentPlan && (
          <div className="mb-24">
            <ProductPricing
              currentPlan={currentPlan}
              billingPeriod={billingPeriod}
              quantityUsers={quantityUsers}
              quantityDevices={quantityDevices}
              onUsersChange={setQuantityUsers}
              onDevicesChange={setQuantityDevices}
              tierUser={tierUser}
              tierDevice={tierDevice}
              totalPrice={totalPrice}
              isQuoteRequired={isQuoteRequired}
              productName={product.name}
              isAvailable={product.status?.toLowerCase() === "available"}
            />
          </div>
        )}

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
