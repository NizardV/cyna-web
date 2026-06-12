import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterContent } from "./filter-content"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

/**
 * Tiroir de filtres pour mobile (Sheet montant depuis le bas).
 * Affiche un badge indiquant le nombre de filtres actifs.
 *
 * @param {{
 *   categories: object[],
 *   filters: object,
 *   onChange: (patch: object) => void,
 *   hideCategories?: boolean
 * }} props
 */
export function FilterDrawer({ categories, filters, onChange, hideCategories = false }) {
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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-1.5">
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
          <FilterContent 
            categories={categories} 
            filters={filters} 
            onChange={onChange} 
            hideCategories={hideCategories} 
          />
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