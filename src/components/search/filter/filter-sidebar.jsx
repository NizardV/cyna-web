import { useTranslation } from "react-i18next"
import { FilterContent } from "./filter-content"

export function FilterSidebar({ categories, filters, onChange, hideCategories = false }) {
  const { t } = useTranslation("search")

  return (
    <aside className="w-56 shrink-0">
      <h2 className="mb-4 text-sm font-bold text-foreground">{t("filter.title")}</h2>
      <FilterContent 
        categories={categories} 
        filters={filters} 
        onChange={onChange} 
        hideCategories={hideCategories} 
      />
    </aside>
  )
}