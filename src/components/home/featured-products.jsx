import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { addToCart } from "@/api/cart";
import { toast } from "sonner";

export function FeaturedProducts({ products }) {
  const { t } = useTranslation("home");

  if (!products || products.length === 0) return null;

  const handleAddToCart = async (product, monthlyPlan) => {
    await addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      duration: "monthly",
      unitPrice: monthlyPlan?.price ?? 0,
    });
    toast.success(t("addedToCart"));
  };

  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          {t("topProductsTitle")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
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
                      <button
                        onClick={() => handleAddToCart(product, monthlyPlan)}
                        className="mt-4 w-full rounded-lg bg-[#7C3AED] py-2.5 text-sm font-medium text-white transition hover:bg-[#6D28D9] active:scale-95"
                      >
                        {t("addToCart")}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 font-extrabold text-lg">{t("unavailable")}</p>
                      <button
                        disabled
                        className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
                      >
                        {t("outOfStock")}
                      </button>
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
