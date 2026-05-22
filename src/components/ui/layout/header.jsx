import { Search } from "./search"
import { Navigation } from "./navigation"

export function Header() {
  return (
    <header className={`border-b bg-background`}>
      <div className="container mx-auto px-4 py-4">
        {/* TODO: Add logo, navigation links, user menu, etc. */}
        <Navigation />
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">Cyna App</div>
          <div className="flex items-center gap-4">
            <Search />
            {/* Placeholder for user actions */}
          </div>
        </div>
      </div>
    </header>
  )
}