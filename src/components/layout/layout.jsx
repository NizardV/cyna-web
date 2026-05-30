import { Header } from "./header";
import { Footer } from "./footer";

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
  return (
    <div className="flex flex-col min-h-screen bg-[#f4f4f6]">
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
