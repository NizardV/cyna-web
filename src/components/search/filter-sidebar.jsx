import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

// ---------------------------------------------------------------------------
// FilterSidebar — panneau de filtres latéral
// ---------------------------------------------------------------------------

/**
 * Panneau de filtres latéral.
 *
 * @param {{
 *   categories: object[],
 *   filters: object,
 *   onChange: (patch: object) => void
 * }} props
 */
export function FilterContent({ categories, filters, onChange }) {
  const { t } = useTranslation("search")

  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.search")}</p>
        <Input
          type="search"
          placeholder={t("filter.searchPlaceholder")}
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div className="border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.categories")}</p>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <Label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 font-normal text-muted-foreground"
            >
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

// Sidebar desktop — inchangée
export function FilterSidebar({ categories, filters, onChange }) {
  const { t } = useTranslation("search")

  return (
    <aside className="w-56 shrink-0">
      <h2 className="mb-4 text-sm font-bold text-foreground">{t("filter.title")}</h2>
      <FilterContent categories={categories} filters={filters} onChange={onChange} />
    </aside>
  )
}

// Bouton + Sheet pour mobile
export function FilterDrawer({ categories, filters, onChange }) {
  const { t } = useTranslation("search")
  const [open, setOpen] = useState(false)

  const activeCount = [
    filters.search,
    ...filters.categories,
    filters.maxPrice && filters.maxPrice !== "1000" ? filters.maxPrice : null,
    filters.onlyAvailable || null,
  ].filter(Boolean).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("filter.title")}
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
        <SheetHeader>
          <SheetTitle>{t("filter.title")}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 px-1">
          <FilterContent categories={categories} filters={filters} onChange={onChange} />
        </div>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button className="w-full">
              {t("filter.apply", { defaultValue: "Voir les résultats" })}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function FilterSidebarSkeleton() {
  return (
    <aside className="hidden w-56 shrink-0 space-y-3 md:block">
      <Skeleton className="mb-4 h-4 w-40" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </aside>
  )
}