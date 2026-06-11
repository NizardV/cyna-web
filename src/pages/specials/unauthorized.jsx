import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Unauthorized = () => {
  const location = useLocation();
  const { t } = useTranslation("common");
  const redirectTo = location.state?.redirectTo || "/";

  return (
    <div className="h-full flex items-center justify-center bg-linear-to-br from-slate-50 to-red-50 font-sans p-8">
      <div
        className="text-center bg-white p-12 md:p-10 rounded-xl shadow-2xl max-w-2xl w-full"
        role="main"
        aria-labelledby="unauthorized-title"
      >
        <p className="text-7xl md:text-8xl font-bold m-0 text-slate-900 tracking-tight" aria-hidden="true">
          {t("unauthorized.code")}
        </p>
        <h1 id="unauthorized-title" className="mt-2 text-2xl font-semibold text-slate-900">
          {t("unauthorized.title")}
        </h1>
        <p className="mt-3 text-slate-600 text-lg max-w-md mx-auto">
          {t("unauthorized.message")}
        </p>
        <Link
          to={redirectTo}
          className="inline-block mt-6 bg-red-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label={t("unauthorized.backHome")}
        >
          {t("unauthorized.backHome")}
        </Link>
      </div>
    </div>
  );
};