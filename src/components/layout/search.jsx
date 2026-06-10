import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import { useNavigate } from "react-router-dom"

export function Search() {
  const navigate = useNavigate()

  return (
    <Button variant="outline" onClick={() => navigate("/search")}>
      <SearchIcon className="text-muted-foreground" />
    </Button>
  )
}