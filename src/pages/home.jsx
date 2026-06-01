import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/layout"

export function Home() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  return (
    <Layout>
      <h1>{t("welcome")}</h1>
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("fr")}>Français</button>
    </Layout>
  );
}