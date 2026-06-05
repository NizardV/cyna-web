import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Layout } from "@/components/layout/layout"

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        {title}
      </h2>
      <div className="text-gray-600 space-y-2 text-sm leading-relaxed">{children}</div>
    </div>
  )
}

export function CGU() {
  const { t } = useTranslation("cgu")

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-sm text-gray-400 mb-12">{t("lastUpdated")}</p>

        <Section title={t("sections.object.title")}>
          <p>{t("sections.object.p1")}</p>
          <p>{t("sections.object.p2")}</p>
        </Section>

        <Section title={t("sections.access.title")}>
          <p>{t("sections.access.p1")}</p>
          <p>{t("sections.access.p2")}</p>
        </Section>

        <Section title={t("sections.services.title")}>
          <p>{t("sections.services.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t("sections.services.soc")}</li>
            <li>{t("sections.services.edr")}</li>
            <li>{t("sections.services.xdr")}</li>
            <li>{t("sections.services.siem")}</li>
            <li>{t("sections.services.zt")}</li>
            <li>{t("sections.services.mdm")}</li>
          </ul>
        </Section>

        <Section title={t("sections.billing.title")}>
          <p>{t("sections.billing.p1")}</p>
          <p>{t("sections.billing.p2")}</p>
          <p>{t("sections.billing.p3")}</p>
        </Section>

        <Section title={t("sections.obligations.title")}>
          <p>{t("sections.obligations.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t("sections.obligations.i1")}</li>
            <li>{t("sections.obligations.i2")}</li>
            <li>{t("sections.obligations.i3")}</li>
            <li>{t("sections.obligations.i4")}</li>
            <li>{t("sections.obligations.i5")}</li>
          </ul>
        </Section>

        <Section title={t("sections.availability.title")}>
          <p>{t("sections.availability.p1")}</p>
          <p>{t("sections.availability.p2")}</p>
        </Section>

        <Section title={t("sections.data.title")}>
          <p>
            {t("sections.data.p1")}{" "}
            <Link to="/privacy" className="text-primary underline">
              {t("sections.data.link")}
            </Link>
            {t("sections.data.p2")}
          </p>
        </Section>

        <Section title={t("sections.termination.title")}>
          <p>{t("sections.termination.p1")}</p>
          <p>{t("sections.termination.p2")}</p>
        </Section>

        <Section title={t("sections.changes.title")}>
          <p>{t("sections.changes.p1")}</p>
        </Section>

        <Section title={t("sections.law.title")}>
          <p>{t("sections.law.p1")}</p>
        </Section>
      </div>
    </Layout>
  )
}
