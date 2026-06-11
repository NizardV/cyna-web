import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Valeurs alignées sur l'enum .NET ProductStatus
const STATUS_VALUES = ["Available", "Unavailable", "OutOfStock", "Preview"]
const LANGS = ["fr", "en"]

export function FormGeneral({ value, onChange }) {
  const { t } = useTranslation("admin-products")
  const [lang, setLang] = useState("fr")

  const setField = (base) => (e) =>
    onChange({ ...value, [`${base}${lang === "fr" ? "Fr" : "En"}`]: e.target.value })

  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value })

  const nameFr = value.nameFr ?? ""
  const nameEn = value.nameEn ?? ""
  const descFr = value.descriptionFr ?? ""
  const descEn = value.descriptionEn ?? ""

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("general.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="flex items-center gap-1 p-1 bg-muted rounded-md w-fit">
          {LANGS.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                lang === l
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`general.lang.${l}`)}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label>
            {t("general.name")}
            {lang === "fr" && <span className="text-destructive"> *</span>}
          </Label>
          <Input
            key={`name-${lang}`}
            value={lang === "fr" ? nameFr : nameEn}
            onChange={setField("name")}
            placeholder={t("general.namePlaceholder")}
            autoFocus={lang === "fr"}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("general.description")}</Label>
          <Textarea
            key={`desc-${lang}`}
            value={lang === "fr" ? descFr : descEn}
            onChange={setField("description")}
            placeholder={t("general.descriptionPlaceholder")}
            rows={4}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("general.status")}</Label>
          <select
            value={value.status}
            onChange={set("status")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {STATUS_VALUES.map(v => (
              <option key={v} value={v}>{t(`status.${v.toLowerCase()}`)}</option>
            ))}
          </select>
        </div>

      </CardContent>
    </Card>
  )
}
