import { Header } from "./header"
import { Footer } from "./footer"

export function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Plus de container ici ! Juste flex-1 pour pousser le footer en bas */}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}