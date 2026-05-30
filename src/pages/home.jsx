import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchHomeData } from "@/api/home";
import { Layout } from "@/components/ui/layout/layout";
import { HomeCarousel } from "@/components/home/home-carousel";
import { FixedText } from "@/components/home/fixed-text";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";

export function Home() {
  const { t } = useTranslation("home");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // On récupère toutes nos données depuis notre super Mock API
        const homeData = await fetchHomeData(); 
        setData(homeData);
      } catch (error) {
        console.error("Erreur lors du chargement des données de la page d'accueil", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-primary">
          {t("loading")}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HomeCarousel slides={data?.carouselSlides} />
      
      <FixedText text={data?.missionText} />

      <CategoryGrid categories={data?.categories} />
      
      <FeaturedProducts products={data?.featuredProducts} />
    </Layout>
  );
}