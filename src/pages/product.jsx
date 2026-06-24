import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProduct, getSimilarProducts } from "@/api/products";
import { Layout } from "@/components/layout/layout";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { PricingTiersTable } from "@/components/product/pricing-tiers-table";
import { ProductPricing } from "@/components/product/product-pricing";
import { SimilarProducts } from "@/components/product/similar-product";
import { findTier, isOverTier, UnitType } from "@/lib/pricing-utils";

/**
 * Page détail d'un produit : galerie, informations, paliers de tarification,
 * panneau d'achat et produits similaires.
 * Réinitialise les quantités à chaque changement de période de facturation.
 */
export function Product() {
  const { id } = useParams();
  const { t } = useTranslation("product");
  const { t: tc } = useTranslation("common");

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

  const currentPlan    = product?.pricingPlans?.find(p => p.billingPeriod === billingPeriod);
  const hasUserTiers   = currentPlan?.pricingTiers?.some(t => t.unitType === UnitType.USER);
  const hasDeviceTiers = currentPlan?.pricingTiers?.some(t => t.unitType === UnitType.DEVICE);
  const tierUser       = hasUserTiers   ? findTier(currentPlan.pricingTiers, UnitType.USER,   quantityUsers)   : null;
  const tierDevice     = hasDeviceTiers ? findTier(currentPlan.pricingTiers, UnitType.DEVICE, quantityDevices) : null;
  const totalPrice     = (tierUser   ? tierUser.unitPrice   * quantityUsers   : 0)
                       + (tierDevice ? tierDevice.unitPrice * quantityDevices : 0);
  const isQuoteRequired = Boolean(currentPlan) && (
    isOverTier(currentPlan.pricingTiers, UnitType.USER,   quantityUsers) ||
    isOverTier(currentPlan.pricingTiers, UnitType.DEVICE, quantityDevices)
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
          {tc("product.loading")}
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <p className="text-6xl">🔍</p>
          <h1 className="text-2xl font-bold text-gray-900">{tc("product.notFound")}</h1>
          <p className="text-gray-500">{tc("product.notFoundDesc")}</p>
          <Link
            to="/catalog"
            className="mt-2 text-sm font-medium text-primary underline underline-offset-4"
          >
            {tc("product.backToCatalog")}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="p-8 max-w-7xl mx-auto w-full py-12">

        <div className="flex flex-col md:flex-row gap-12 w-full mb-8">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo
            product={product}
            billingPeriod={billingPeriod}
            onBillingPeriodChange={handleBillingPeriodChange}
          />
        </div>

        {currentPlan && (
          <div className="mb-6">
            <PricingTiersTable
              tiers={currentPlan.pricingTiers}
              activeTierUser={tierUser}
              activeTierDevice={tierDevice}
            />
          </div>
        )}

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
      {similarProducts && similarProducts.length > 0 && (
          <SimilarProducts products={similarProducts} />
      )}
    </Layout>
  );
}