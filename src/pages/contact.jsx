import { useTranslation } from "react-i18next"
import { Layout } from "@/components/layout/layout"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export function Contact() {
  const { t } = useTranslation("contact")

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-gray-500 mb-12">{t("subtitle")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{t("cards.email.label")}</p>
              <a href={`mailto:${t("cards.email.value")}`} className="text-sm text-gray-600 hover:text-primary transition">
                {t("cards.email.value")}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{t("cards.phone.label")}</p>
              <a href="tel:+33100000000" className="text-sm text-gray-600 hover:text-primary transition">
                {t("cards.phone.value")}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{t("cards.address.label")}</p>
              <p className="text-sm text-gray-600">
                {t("cards.address.line1")}<br />
                {t("cards.address.line2")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{t("cards.hours.label")}</p>
              <p className="text-sm text-gray-600">
                {t("cards.hours.line1")}<br />
                {t("cards.hours.line2")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-200 bg-slate-50">
          <h2 className="text-base font-bold text-gray-900 mb-1">{t("support.title")}</h2>
          <p className="text-sm text-gray-600">
            {t("support.p1")}{" "}
            <a href={`mailto:${t("support.email")}`} className="text-primary underline">
              {t("support.email")}
            </a>.
          </p>
        </div>
      </div>
    </Layout>
  )
}
