import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { FormGeneral } from "@/components/admin/product/form-general"
import { FormMedia }   from "@/components/admin/product/form-media"
import { FormSpecs }   from "@/components/admin/product/form-specs"
import { FormPricing } from "@/components/admin/product/form-pricing"
import { defaultPricingState, pricingPlansToState, stateToPricingPlans, validatePricing } from "@/lib/pricing-utils"
import { getProductAdmin, createProduct, updateProduct } from "@/api/products"
import { getCategories } from "@/api/categories"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

const DEFAULT_GENERAL = { nameFr: "", nameEn: "", descriptionFr: "", descriptionEn: "", status: "Available" }
const DEFAULT_MEDIA   = { imageUrl: "", categoryId: "", isFeatured: false, displayOrder: 1 }

/**
 * Page formulaire produit (admin) : création et édition avec sections Général, Médias, Spécifications, Tarifs.
 * En mode édition, charge le produit via l'endpoint admin qui expose les deux locales et les pricingTiers.
 */
export function AdminProductForm() {
  const { t }       = useTranslation("admin-products")
  const { id }      = useParams()
  const navigate    = useNavigate()
  const isEdit      = !!id
  // Ref anti-double-fetch (React StrictMode monte les composants deux fois en dev)
  const initialized = useRef(false)

  const [general,    setGeneral]    = useState(DEFAULT_GENERAL)
  const [media,      setMedia]      = useState(DEFAULT_MEDIA)
  const [specs,      setSpecs]      = useState([])
  const [pricing,    setPricing]    = useState(defaultPricingState)
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    getCategories().then(setCategories).catch(() => {
      toast.error(t("form.errors.categoriesFailed"))
    })

    if (isEdit) {
      // Endpoint admin : renvoie les deux locales, categoryId, status PascalCase
      // et des pricingTiers au format { maxQty, unitPrice } attendu par le formulaire.
      getProductAdmin(id)
        .then(p => {
          setGeneral({
              nameFr: p.nameFr ?? p.name ?? "",
              nameEn: p.nameEn ?? p.name ?? "",
              descriptionFr: p.descriptionFr ?? p.description ?? "",
              descriptionEn: p.descriptionEn ?? p.description ?? "",
              status: p.status ?? "Available",
            })
          setMedia({ imageUrl: p.imageUrl ?? "", categoryId: p.categoryId ?? "", isFeatured: p.isFeatured ?? false, displayOrder: p.displayOrder ?? 1 })
          setSpecs(Array.isArray(p.technicalSpecs) ? p.technicalSpecs : [])
          setPricing(pricingPlansToState(p.pricingPlans ?? []))
          setLoading(false)
        })
        .catch(() => { toast.error(t("form.errors.notFound")); navigate("/admin/products") })
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!general.nameFr.trim()) { toast.error(t("form.errors.nameRequired")); return }

    const pricingErrors = validatePricing(pricing, t)
    if (pricingErrors.length > 0) {
      pricingErrors.forEach(msg => toast.error(msg))
      return
    }

    setSubmitting(true)
    try {
      // Destructure avant le spread pour éviter d'envoyer les valeurs brutes (string) à l'API
      const { categoryId: rawCategoryId, displayOrder: rawDisplayOrder, ...restMedia } = media
      const { nameFr, nameEn, descriptionFr, descriptionEn, ...restGeneral } = general
      const payload = {
        ...restGeneral,
        nameFr,
        nameEn,
        descriptionFr,
        descriptionEn,
        name: nameFr || nameEn,
        description: descriptionFr || descriptionEn,
        ...restMedia,
        categoryId:    rawCategoryId ? parseInt(rawCategoryId, 10) : undefined,
        displayOrder:  restMedia.isFeatured ? (Number(rawDisplayOrder) || 1) : undefined,
        technicalSpecs: specs,
        pricingPlans:   stateToPricingPlans(pricing),
      }
      if (isEdit) {
        await updateProduct(id, payload)
        toast.success(t("form.success.updated"))
      } else {
        await createProduct(payload)
        toast.success(t("form.success.created"))
      }
      navigate("/admin/products")
    } catch {
      toast.error(t("form.errors.saveFailed"))
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Card>
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost" size="sm"
                onClick={() => navigate("/admin/products")}
                className="gap-1.5 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("form.back")}
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {isEdit ? t("form.editTitle") : t("form.newTitle")}
                </h1>
                {isEdit && (
                  <p className="text-xs text-muted-foreground">{t("form.productId", { id })}</p>
                )}
              </div>
            </div>

            {/* Enter sur un input ne soumet pas le formulaire */}
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault() }}
              className="space-y-4"
            >
              <FormGeneral value={general} onChange={setGeneral} />
              <FormMedia   value={media}   onChange={setMedia}   categories={categories} />
              <FormSpecs   value={specs}   onChange={setSpecs} />
              <FormPricing value={pricing} onChange={setPricing} />

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="min-w-36">
                  {submitting ? t("form.saving") : isEdit ? t("form.update") : t("form.create")}
                </Button>
                <Button
                  type="button" variant="outline"
                  onClick={() => navigate("/admin/products")}
                  disabled={submitting}
                >
                  {t("form.cancel")}
                </Button>
              </div>
            </form>
          </>
        )}

      </main>
    </Layout>
  )
}
