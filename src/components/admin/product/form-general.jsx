import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const STATUS_VALUES = ["Active", "Inactive", "Archived"]

export function FormGeneral({ value, onChange }) {
  const { t } = useTranslation("admin")
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("general.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="space-y-1.5">
          <Label>{t("general.name")} <span className="text-destructive">*</span></Label>
          <Input
            value={value.name}
            onChange={set("name")}
            placeholder={t("general.namePlaceholder")}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("general.description")}</Label>
          <Textarea
            value={value.description}
            onChange={set("description")}
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
