/**
 * @file components/admin/user/user-toolbar.jsx
 * @description Search input + role filter combobox for the admin user list.
 */

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem,
} from "@/components/ui/combobox"

/**
 * @param {{
 *   search: string,
 *   onSearchChange: (val: string) => void,
 *   roleFilter: string,
 *   onRoleFilterChange: (val: string) => void,
 *   roleFilterOptions: { value: string, label: string }[],
 *   searchPlaceholder: string,
 *   roleFilterPlaceholder: string,
 *   countLabel?: string,
 * }} props
 */
export function UserToolbar({
  search, onSearchChange,
  roleFilter, onRoleFilterChange, roleFilterOptions,
  searchPlaceholder, roleFilterPlaceholder,
  countLabel,
}) {
  const currentLabel = roleFilterOptions.find((r) => r.value === roleFilter)?.label ?? ""

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <Combobox value={roleFilter} onValueChange={(val) => val && onRoleFilterChange(val)}>
        <ComboboxInput
          showClear={false}
          readOnly
          placeholder={roleFilterPlaceholder}
          className="w-48"
          value={currentLabel}
        />
        <ComboboxContent>
          <ComboboxList>
            {roleFilterOptions.map((r) => (
              <ComboboxItem key={r.value} value={r.value}>{r.label}</ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {countLabel != null && (
        <p className="ml-auto text-xs text-muted-foreground">{countLabel}</p>
      )}
    </div>
  )
}