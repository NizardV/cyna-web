/**
 * @file components/admin/categories/translation-fields.jsx
 * @description Champs de traduction (nom + description) pour une locale donnée.
 */

import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**
 * @param {{
 *   locale: "fr" | "en",
 *   values: { name: string, description: string },
 *   onChange: (locale: string, field: string, value: string) => void,
 *   errors: { name?: string }
 * }} props
 */
export function TranslationFields({ locale, values, onChange, errors }) {
  const { t }     = useTranslation("categories")
  const { t: tc } = useTranslation("common")

  const langLabel = locale === "fr" ? tc("admin.langFr") : tc("admin.langEn")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`cat-name-${locale}`}>
          {langLabel} — {t("form.name")}{" "}
          {locale === "fr" ? (
            <span className="text-destructive">{t("form.nameRequired")}</span>
          ) : (
            <span className="text-xs font-normal text-muted-foreground">
              {tc("admin.optional")}
            </span>
          )}
        </Label>
        <Input
          id={`cat-name-${locale}`}
          value={values.name}
          onChange={(e) => onChange(locale, "name", e.target.value)}
          placeholder={t("form.namePlaceholder")}
          aria-invalid={!!errors?.name}
        />
        {errors?.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`cat-desc-${locale}`}>{t("form.description")}</Label>
        <Textarea
          id={`cat-desc-${locale}`}
          value={values.description}
          onChange={(e) => onChange(locale, "description", e.target.value)}
          placeholder={t("form.descriptionPlaceholder")}
          rows={3}
        />
      </div>
    </div>
  )
}