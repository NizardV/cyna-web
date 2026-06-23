import { useTranslation } from "react-i18next"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

const LANGUAGES = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ar", label: "AR", flag: "🇸🇦" },
  { code: "he", label: "HE", flag: "🇮🇱" },
]

/**
 * Sélecteur de langue affiché dans le Header.
 * Persiste le choix dans localStorage (clé `i18n_lang`) et notifie i18next.
 */
export function LangSwitcher() {
  const { i18n } = useTranslation()
  const current = LANGUAGES.find((l) => l.code === i18n.language?.split("-")[0]) ?? LANGUAGES[0]

  return (
    <Combobox
      value={current.code}
      onValueChange={(val) => {
        if (val) {
          i18n.changeLanguage(val)
          localStorage.setItem("i18n_lang", val)
        }
      }}
    >
      <ComboboxTrigger
        render={
          <button
            className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            aria-label="Changer de langue"
          />
        }
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{current.label}</span>
      </ComboboxTrigger>

      <ComboboxContent align="end" className="w-32">
        <ComboboxList>
          {LANGUAGES.map(({ code, label, flag }) => (
            <ComboboxItem key={code} value={code}>
              <span aria-hidden="true">{flag}</span>
              {label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}