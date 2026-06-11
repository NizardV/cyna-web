import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

// value : string[]
export function FormSpecs({ value, onChange }) {
  const { t }             = useTranslation("admin-products")
  const [draft, setDraft] = useState("")

  const addTag = () => {
    const trimmed = draft.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setDraft("")
  }

  // FIX : on reçoit `spec` (la valeur) depuis le map, pas `i` (l'index).
  // On filtre par valeur pour éviter tout décalage d'index.
  const removeTag = (spec) => onChange(value.filter((s) => s !== spec))

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      addTag()
    }
    if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("specs.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label>{t("specs.label")}</Label>

        {value.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.map((spec) => (
              <span
                key={spec}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-foreground"
              >
                {spec}
                <button
                  type="button"
                  onClick={() => removeTag(spec)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("specs.placeholder")}
        />
        <p className="text-xs text-muted-foreground">{t("specs.help")}</p>
      </CardContent>
    </Card>
  )
}