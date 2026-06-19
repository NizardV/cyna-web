import { Header } from "./header";
import { Footer } from "./footer";
import { useTranslation } from "react-i18next"

/**
 * Enveloppe de mise en page standard : Header + slot principal + Footer.
 * Toutes les props de masquage sont transmises directement à Header et Footer.
 *
 * @param {{
 *   children: React.ReactNode,
 *   hideSearch?: boolean,
 *   hideNav?: boolean,
 *   hideUserSection?: boolean,
 *   hideDescription?: boolean,
 *   hideInfoSection?: boolean,
 *   hideLegalSection?: boolean,
 *   hideSocial?: boolean
 * }} props
 */
export function Layout({
  children,
  hideSearch = false,
  hideNav = false,
  hideUserSection = false,
  hideDescription = false,
  hideInfoSection = false,
  hideLegalSection = false,
  hideSocial = false,
}) {
  const { i18n } = useTranslation()
  const dir = i18n.dir(i18n.language)

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f4f6]" dir={dir}>
      <Header
        hideSearch={hideSearch}
        hideNav={hideNav}
        hideUserSection={hideUserSection}
      />
      <main className="flex-1">
        {children}
      </main>
      <Footer
        hideDescription={hideDescription}
        hideInfoSection={hideInfoSection}
        hideLegalSection={hideLegalSection}
        hideSocial={hideSocial}
      />
    </div>
  );
}
