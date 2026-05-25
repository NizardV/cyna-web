import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"

// ---------------------------------------------------------------------------
// YearCombobox — replaces the Select for year filtering
// ---------------------------------------------------------------------------

export function YearCombobox({ value, onChange, years, t }) {
  // Build items: "all" + each year string
  const items = [
    { value: "all", label: t("allYears") },
    ...years.map((y) => ({ value: String(y), label: t("year", { year: y }) })),
  ]

  const selectedLabel = items.find((i) => i.value === value)?.label ?? t("allYears")

  return (
    <Combobox
      value={value}
      onValueChange={onChange}
    >
      <ComboboxInput
        placeholder={selectedLabel}
        className="w-40"
        showClear={value !== "all"}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>{t("noResults", { defaultValue: "Aucun résultat" })}</ComboboxEmpty>
          {items.map((item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}