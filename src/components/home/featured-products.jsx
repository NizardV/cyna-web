import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FeaturedProducts({ products }) {
  const { t } = useTranslation("home");

  // Sécurité : si on n'a pas encore de produits, on n'affiche rien
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          {t("topProductsTitle")}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            // Logique clé : On cherche l'abonnement mensuel dans le tableau des plans
            const monthlyPlan = product.pricingPlans?.find(plan => plan.billingPeriod === "monthly") || product.pricingPlans?.[0];
            const displayPrice = monthlyPlan ? monthlyPlan.price : "N/A";

            return (
              <div 
                key={product.id} 
                className={cn(
                  "bg-white rounded-xl border border-gray-200 p-5 flex flex-col transition-colors",
                  product.status === "available" ? "hover:border-primary/50 hover:shadow-sm" : "bg-gray-50 opacity-75"
                )}
              >
                <Link 
                  to={`/products/${product.id}`} 
                  className="group flex flex-col flex-grow focus:outline-none"
                >
                  <div className={cn("h-32 rounded-lg mb-4 flex items-center justify-center transition-colors", product.status === "available" ? "bg-gray-50 group-hover:bg-gray-100" : "bg-gray-100")}>
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold", product.status === "available" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500")}>
                      {/* On prend la première lettre du produit pour le logo temporaire */}
                      {product.name.charAt(0)}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  
                  <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                    {product.description}
                  </p>
                </Link>
                
                
                <div className="mt-auto pt-4">
                  {product.status === "available" ? (
                    <>
                      <p className="text-primary font-extrabold text-lg">
                        {displayPrice}€ <span className="text-sm font-normal text-gray-500">{t("perMonth")}</span>
                      </p>
                      <Link to={`/products/${product.id}`} className="block mt-4">
                        <Button className="w-full" variant="secondary">
                          {t("addToCart")}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 font-extrabold text-lg">{t("unavailable")}</p>
                      <Button disabled className="mt-4 w-full" variant="outline">
                        {t("outOfStock")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}