/**
 * @file components/admin/categories/category-form.jsx
 * @description Formulaire de création / édition d'une catégorie.
 * Composition : tabs par locale → TranslationFields, aperçu image → ImagePreview.
 */

import { useTranslation } from "react-i18next"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TranslationFields } from "./translation-fields"
import { ImagePreview } from "./image-preview"

const LOCALES = /** @type {const} */ (["fr", "en"])

/**
 * @param {{
 *   values: {
 *     slug: string,
 *     imageUrl: string,
 *     displayOrder: string,
 *     translations: { fr: { name: string, description: string }, en: { name: string, description: string } }
 *   },
 *   onChange: (field: string, value: unknown) => void,
 *   onTranslationChange: (locale: string, field: string, value: string) => void,
 *   errors: Record<string, string>
 * }} props
 */
export function CategoryForm({ values, onChange, onTranslationChange, errors }) {
  const { t }     = useTranslation("categories")
  const { t: tc } = useTranslation("common")

  return (
    <div className="flex flex-col gap-5">
      <Tabs defaultValue="fr">
        <TabsList className="mb-2">
          <TabsTrigger value="fr">{tc("admin.langFr")}</TabsTrigger>
          <TabsTrigger value="en">{tc("admin.langEn")}</TabsTrigger>
        </TabsList>

        {LOCALES.map((locale) => (
          <TabsContent key={locale} value={locale}>
            <TranslationFields
              locale={locale}
              values={values.translations[locale]}
              onChange={onTranslationChange}
              errors={locale === "fr" ? { name: errors["translations.fr.name"] } : {}}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-slug">
          {t("form.slug")}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {t("form.slugHint")}
          </span>
        </Label>
        <Input
          id="cat-slug"
          value={values.slug}
          onChange={(e) => onChange("slug", e.target.value)}
          placeholder={t("form.slugPlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-img">{t("form.imageUrl")}</Label>
        <div className="flex flex-col items-center gap-3">
          <Input
            id="cat-img"
            value={values.imageUrl}
            onChange={(e) => onChange("imageUrl", e.target.value)}
            placeholder={t("form.imageUrlPlaceholder")}
            type="url"
            className="flex-1 w-full"
          />
          <ImagePreview src={values.imageUrl} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-order">{t("form.displayOrder")}</Label>
        <Input
          id="cat-order"
          value={values.displayOrder}
          onChange={(e) => onChange("displayOrder", e.target.value)}
          type="number"
          min={0}
          className="w-28"
        />
      </div>
    </div>
  )
}