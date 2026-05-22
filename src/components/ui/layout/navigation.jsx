import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Navigation() {
  // TODO: Define actual navigation items
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ]

  return (
    <nav className={cn("flex items-center space-x-4")}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-foreground" : "text-muted-foreground"
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}