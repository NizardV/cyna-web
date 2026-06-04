import { useTranslation } from "react-i18next"
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

export function MentionsLegales() {
  const { t } = useTranslation("mentions-legales")

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-sm text-gray-400 mb-12">{t("lastUpdated")}</p>

        <Section title={t("sections.editor.title")}>
          <p>{t("sections.editor.intro")}</p>
          <ul className="mt-2 space-y-1 list-none">
            <li>{t("sections.editor.name")}</li>
            <li>{t("sections.editor.type")}</li>
            <li>{t("sections.editor.capital")}</li>
            <li>{t("sections.editor.address")}</li>
            <li>{t("sections.editor.siret")}</li>
            <li>{t("sections.editor.rcs")}</li>
            <li>{t("sections.editor.vat")}</li>
            <li>{t("sections.editor.director")}</li>
            <li>{t("sections.editor.email")}</li>
          </ul>
        </Section>

        <Section title={t("sections.hosting.title")}>
          <p>{t("sections.hosting.intro")}</p>
          <ul className="mt-2 space-y-1 list-none">
            <li>{t("sections.hosting.name")}</li>
            <li>{t("sections.hosting.address")}</li>
            <li>{t("sections.hosting.website")}</li>
          </ul>
        </Section>

        <Section title={t("sections.ip.title")}>
          <p>{t("sections.ip.p1")}</p>
          <p>{t("sections.ip.p2")}</p>
        </Section>

        <Section title={t("sections.liability.title")}>
          <p>{t("sections.liability.p1")}</p>
          <p>{t("sections.liability.p2")}</p>
        </Section>

        <Section title={t("sections.links.title")}>
          <p>{t("sections.links.p1")}</p>
        </Section>

        <Section title={t("sections.law.title")}>
          <p>{t("sections.law.p1")}</p>
        </Section>
      </div>
    </Layout>
  )
}
