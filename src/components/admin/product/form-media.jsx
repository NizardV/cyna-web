import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Star } from "lucide-react"
import { cn } from "@/lib/utils"

// Accepte uniquement http:// et https:// — rejette les valeurs partielles comme "example.com"
function isValidUrl(url) {
  if (!url) return true // champ vide = pas d'erreur
  try {
    const { protocol } = new URL(url)
    return protocol === "http:" || protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Formulaire de saisie des métadonnées média d'un produit (image, catégorie, mise en avant).
 *
 * @param {{
 *   value: { imageUrl: string, categoryId: string, isFeatured: boolean, displayOrder: number },
 *   onChange: (value: object) => void,
 *   categories: object[]
 * }} props
 */
export function FormMedia({ value, onChange, categories }) {
  const { t } = useTranslation("admin-products")
  const [urlError, setUrlError] = useState(false)

  const set = (field) => (e) => {
    let val
    if (e.target.type === "checkbox") val = e.target.checked
    else if (e.target.type === "number") val = e.target.value === "" ? "" : Number(e.target.value)
    else val = e.target.value
    onChange({ ...value, [field]: val })
  }

  const handleUrlBlur = () => setUrlError(!isValidUrl(value.imageUrl))
  const handleUrlChange = (e) => {
    if (urlError) setUrlError(false)
    set("imageUrl")(e)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("media.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="space-y-1.5">
          <Label>{t("media.imageUrl")}</Label>
          <Input
            value={value.imageUrl}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder="https://example.com/image.jpg"
            className={cn(urlError && "border-destructive focus-visible:ring-destructive")}
          />
          {urlError && (
            <p className="text-xs text-destructive">{t("media.imageUrlInvalid")}</p>
          )}
          {!urlError && value.imageUrl ? (
            <img
              src={value.imageUrl}
              alt={t("media.imageAlt")}
              className="mt-2 h-28 w-48 rounded-md object-cover border bg-muted"
              onError={e => { e.target.style.display = "none" }}
            />
          ) : !urlError && (
            <div className="mt-2 h-28 w-48 rounded-md border bg-muted/50 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t("media.category")}</Label>
          <select
            value={value.categoryId}
            onChange={set("categoryId")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t("media.noCategory")}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={value.isFeatured}
              onChange={set("isFeatured")}
              className="h-4 w-4 rounded border border-input accent-primary"
            />
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {t("media.featured")}
            </span>
          </label>

          {value.isFeatured && (
            <div className="ml-6 space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("media.displayOrder")}</Label>
              <Input
                type="number"
                min="1"
                max="99"
                value={value.displayOrder ?? ""}
                onChange={set("displayOrder")}
                className="h-8 w-24 text-sm"
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">{t("media.displayOrderHelp")}</p>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
