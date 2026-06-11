import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FilterContent({ categories, filters, onChange, hideCategories = false }) {
  const { t } = useTranslation("search")

  return (
    <div className="space-y-4">
      {/* Recherche textuelle */}
      <div className="border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.search")}</p>
        <Input
          type="search"
          placeholder={t("filter.searchPlaceholder")}
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {/* Catégories (Masquable) */}
      {!hideCategories && (
        <div className="border-b border-border pb-4">
          <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.categories")}</p>
          <div className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <Label key={cat.id} className="flex cursor-pointer items-center gap-2 font-normal text-muted-foreground">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.id)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...filters.categories, cat.id]
                      : filters.categories.filter((id) => id !== cat.id)
                    onChange({ categories: next })
                  }}
                  className="accent-primary"
                />
                {cat.name}
              </Label>
            ))}
          </div>
        </div>
      )}

      {/* Budget */}
      <div className="border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.budget")}</p>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          value={filters.maxPrice || 1000}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          className="w-full accent-primary"
        />
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>0€</span>
          <span>{filters.maxPrice ? `${filters.maxPrice}€` : t("filter.budgetMax")}</span>
        </div>
      </div>

      {/* Disponibilité */}
      <Label className="flex cursor-pointer items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
          className="accent-primary"
        />
        {t("filter.onlyAvailable")}
      </Label>
    </div>
  )
}