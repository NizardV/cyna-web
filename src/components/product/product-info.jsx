import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/api/cart";
import { toast } from "sonner";

export function ProductInfo({ product }) {
  const { t } = useTranslation("product");
  
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  if (!product) return null;

  const isAvailable = product.status === "available";

  // Extraction intelligente des prix depuis notre tableau BDD
  const monthlyPlan = product.pricingPlans?.find(p => p.billingPeriod === "monthly");
  const yearlyPlan = product.pricingPlans?.find(p => p.billingPeriod === "yearly");
  
  // On détermine le plan actuel en fonction du choix de l'utilisateur
  const currentPlan = billingPeriod === "monthly" ? monthlyPlan : yearlyPlan;
  const currentPrice = currentPlan ? currentPlan.price : "N/A";
  const yearlyDiscount = yearlyPlan ? yearlyPlan.discountPercent : 0;

  const handleAddToCart = async () => {
    await addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      duration: billingPeriod,
      unitPrice: currentPlan?.price ?? 0,
    });
    toast.success(t("addedToCart"));
    navigate("/cart");
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col">
      
      {/* 1. Badge de disponibilité */}
      <span className={cn(
        "font-bold text-sm mb-4 flex items-center gap-2",
        isAvailable ? "text-green-600" : "text-red-500"
      )}>
        <span className={cn("w-2 h-2 rounded-full", isAvailable ? "bg-green-600" : "bg-red-500")} />
        {isAvailable ? t("availableImmediately") : t("serviceUnavailable")}
      </span>

      {/* 2. Titre et Description */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        {product.description}
      </p>

      {/* 3. Caractéristiques Techniques */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-8 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
          {t("technicalSpecsTitle")}
        </h3>
        <ul className="space-y-3">
          
          {/* On boucle sur les caractéristiques fournies par l'API */}
          {product.technicalSpecs?.map((spec, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg> 
              <span>{spec}</span>
            </li>
          ))}

        </ul>
      </div>

      {/* 4. Tarification & Call-to-Action */}
      <div className="mt-auto border-t border-gray-200 pt-6">
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <p className="text-4xl font-extrabold text-primary">{currentPrice}€</p>
          
          {/* Menu déroulant pour basculer les prix */}
          <select 
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            className="border border-gray-200 rounded-md text-sm p-2 text-gray-600 focus:outline-none focus:border-primary bg-white cursor-pointer"
          >
            <option value="monthly">{t("perUserMonth")}</option>
            {yearlyPlan && (
              // i18next va remplacer {{discount}} par la vraie valeur !
              <option value="yearly">{t("perUserYear", { discount: yearlyDiscount })}</option>
            )}
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {isAvailable ? (
            <>
              <Button size="lg" className="flex-1 h-14 text-lg rounded-xl shadow-lg shadow-primary/30" onClick={handleAddToCart}>
                {t("subscribeNow")}
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-14 text-base rounded-xl" onClick={() => navigate("/contact")}>
                {t("try14Days")}
              </Button>
            </>
          ) : (
            <Button disabled size="lg" className="flex-1 h-14 text-lg rounded-xl">
              {t("serviceUnavailableBtn")}
            </Button>
          )}
        </div>
      </div>
      
    </div>
  );
}