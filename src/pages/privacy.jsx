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

export function Privacy() {
  const { t } = useTranslation("privacy")

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-sm text-gray-400 mb-12">{t("lastUpdated")}</p>

        <Section title={t("sections.controller.title")}>
          <p>{t("sections.controller.p1")}</p>
          <p className="font-medium text-gray-800">{t("sections.controller.company")}</p>
          <p>{t("sections.controller.dpo")}</p>
        </Section>

        <Section title={t("sections.data.title")}>
          <p>{t("sections.data.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t("sections.data.identity")}</li>
            <li>{t("sections.data.billing")}</li>
            <li>{t("sections.data.connection")}</li>
            <li>{t("sections.data.usage")}</li>
          </ul>
          <p className="mt-2">{t("sections.data.note")}</p>
        </Section>

        <Section title={t("sections.purposes.title")}>
          <p>{t("sections.purposes.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t("sections.purposes.i1")}</li>
            <li>{t("sections.purposes.i2")}</li>
            <li>{t("sections.purposes.i3")}</li>
            <li>{t("sections.purposes.i4")}</li>
            <li>{t("sections.purposes.i5")}</li>
            <li>{t("sections.purposes.i6")}</li>
          </ul>
        </Section>

        <Section title={t("sections.basis.title")}>
          <p>{t("sections.basis.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li><strong>{t("sections.basis.contract").split("—")[0]}</strong>—{t("sections.basis.contract").split("—")[1]}</li>
            <li><strong>{t("sections.basis.legal").split("—")[0]}</strong>—{t("sections.basis.legal").split("—")[1]}</li>
            <li><strong>{t("sections.basis.interest").split("—")[0]}</strong>—{t("sections.basis.interest").split("—")[1]}</li>
            <li><strong>{t("sections.basis.consent").split("—")[0]}</strong>—{t("sections.basis.consent").split("—")[1]}</li>
          </ul>
        </Section>

        <Section title={t("sections.retention.title")}>
          <ul className="list-disc list-inside space-y-1">
            <li>{t("sections.retention.account")}</li>
            <li>{t("sections.retention.billing")}</li>
            <li>{t("sections.retention.logs")}</li>
            <li>{t("sections.retention.cookies")}</li>
          </ul>
        </Section>

        <Section title={t("sections.sharing.title")}>
          <p>{t("sections.sharing.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t("sections.sharing.stripe")}</li>
            <li>{t("sections.sharing.ovh")}</li>
            <li>{t("sections.sharing.legal")}</li>
          </ul>
        </Section>

        <Section title={t("sections.rights.title")}>
          <p>{t("sections.rights.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t("sections.rights.access")}</li>
            <li>{t("sections.rights.rectification")}</li>
            <li>{t("sections.rights.erasure")}</li>
            <li>{t("sections.rights.portability")}</li>
            <li>{t("sections.rights.opposition")}</li>
            <li>{t("sections.rights.limitation")}</li>
          </ul>
          <p className="mt-2">
            {t("sections.rights.contact")}{" "}
            <a href="mailto:dpo@cyna.fr" className="text-primary underline">dpo@cyna.fr</a>.{" "}
            {t("sections.rights.cnil")}{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {t("sections.rights.cnilLink")}
            </a>.
          </p>
        </Section>

        <Section title={t("sections.cookies.title")}>
          <p>{t("sections.cookies.intro")}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>{t("sections.cookies.session")}</li>
            <li>{t("sections.cookies.prefs")}</li>
            <li>{t("sections.cookies.security")}</li>
          </ul>
          <p className="mt-2">{t("sections.cookies.note")}</p>
        </Section>

        <Section title={t("sections.security.title")}>
          <p>{t("sections.security.p1")}</p>
        </Section>

        <Section title={t("sections.contact.title")}>
          <p>
            {t("sections.contact.p1")}{" "}
            <Link to="/contact" className="text-primary underline">
              {t("sections.contact.link")}
            </Link>{" "}
            {t("sections.contact.or")}
          </p>
        </Section>
      </div>
    </Layout>
  )
}
