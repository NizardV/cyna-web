import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { useNavigate } from "react-router-dom"

/**
 * Bouton de recherche dans le Header.
 * Redirige vers `/search` au clic (la saisie se fait sur la page dédiée).
 */
export function Search() {
  const navigate = useNavigate()

  return (
    <Button variant="outline" onClick={() => navigate("/search")}>
      <SearchIcon className="text-muted-foreground" />
    </Button>
  )
}