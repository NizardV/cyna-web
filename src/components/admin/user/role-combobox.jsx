/**
 * @file components/admin/user/role-combobox.jsx
 * @description Per-row role picker, styled as a badge. Receives already-
 * localized role options from the parent so this component stays dumb/reusable.
 */

import {
  Combobox, ComboboxInput, ComboboxContent, ComboboxList,
  ComboboxItem, ComboboxEmpty,
} from "@/components/ui/combobox"

const ROLE_BADGE_CLASS = {
  SuperAdmin: "bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#EDE9FE]",
  Admin:      "bg-blue-100 text-blue-700 hover:bg-blue-100",
  User:       "bg-muted text-muted-foreground hover:bg-muted",
}

/**
 * @param {{
 *   value: string,
 *   onChange: (val: string) => void,
 *   disabled?: boolean,
 *   roles: { value: string, label: string }[],
 *   noResultsLabel: string,
 *   placeholder: string,
 * }} props
 */
export function RoleCombobox({ value, onChange, disabled, roles, noResultsLabel, placeholder }) {
  const currentLabel = roles.find((r) => r.value === value)?.label ?? value

  return (
    <Combobox value={value} onValueChange={(val) => val && onChange(val)}>
      <ComboboxInput
        showClear={false}
        readOnly
        disabled={disabled}
        placeholder={placeholder}
        className={[
          "h-7 w-40 cursor-pointer rounded-full border-none text-xs font-medium",
          ROLE_BADGE_CLASS[value] ?? "bg-muted text-muted-foreground",
        ].join(" ")}
        value={currentLabel}
      />
      <ComboboxContent>
        <ComboboxList>
          {roles.map((r) => (
            <ComboboxItem key={r.value} value={r.value}>{r.label}</ComboboxItem>
          ))}
          <ComboboxEmpty>{noResultsLabel}</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}