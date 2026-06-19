/**
 * @file pages/admin/categories.jsx
 * @description Page CRUD admin pour la gestion des catégories.
 */

import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  PlusIcon, Pencil, Trash2, Search,
  ArrowUpDown, ArrowUp, ArrowDown, ImageOff,
} from "lucide-react"

import {
  searchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  buildTranslationsPayload,
  extractTranslationsFromDto,
} from "@/api/categories.js"
import { useDebounce } from "@/hooks/useDebounce.js"

import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Badge }    from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Label }    from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { buildPageRange } from "@/lib/utils"
import { Layout }   from "@/components/layout/layout"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5

const LOCALES = /** @type {const} */ (["fr", "en"])

const SORT_COLS = {
  displayOrder: { asc: "displayOrder", desc: "displayOrder_desc" },
  name:         { asc: "name",         desc: "name_desc" },
  productCount: { asc: "productCount", desc: "productCount_desc" },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toggleSort(col, current) {
  const { asc, desc } = SORT_COLS[col]
  return current === asc ? desc : asc
}

const emptyTranslations = () => ({
  fr: { name: "", description: "" },
  en: { name: "", description: "" },
})

const emptyForm = () => ({
  slug:         "",
  imageUrl:     "",
  displayOrder: "",
  translations: emptyTranslations(),
})

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIcon({ col, sortBy }) {
  const asc  = SORT_COLS[col]?.asc
  const desc = SORT_COLS[col]?.desc
  if (sortBy === asc)  return <ArrowUp   className="ml-1 inline size-3" />
  if (sortBy === desc) return <ArrowDown className="ml-1 inline size-3" />
  return <ArrowUpDown className="ml-1 inline size-3 opacity-40" />
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="size-9 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-3.5 w-52" /></TableCell>
      <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-8 rounded-full" /></TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// ImagePreview
// ---------------------------------------------------------------------------

function ImagePreview({ src }) {
  const { t } = useTranslation("common")
  const [status, setStatus] = useState("idle")

  useEffect(() => {
    if (!src) { setStatus("idle"); return }
    setStatus("loading")
  }, [src])

  if (!src) return null

  return (
    <div className="relative size-20 shrink-0 rounded-lg overflow-hidden ring-1 ring-foreground/10">
      {status === "loading" && (
        <Skeleton className="absolute inset-0 rounded-lg" />
      )}
      <img
        src={src}
        alt=""
        className={[
          "size-full object-cover transition-opacity duration-200 w-2xs",
          status === "loaded" ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
          <ImageOff className="size-5" />
          <span className="text-[10px] px-1 text-center leading-tight">{t("admin.invalidUrl")}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TranslationFields
// ---------------------------------------------------------------------------

function TranslationFields({ locale, values, onChange, errors }) {
  const { t }  = useTranslation("categories")
  const { t: tc } = useTranslation("common")
  const langLabel = locale === "fr" ? tc("admin.langFr") : tc("admin.langEn")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`cat-name-${locale}`}>
          {langLabel} — {t("form.name")}{" "}
          {locale === "fr" && (
            <span className="text-destructive">{t("form.nameRequired")}</span>
          )}
          {locale === "en" && (
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

// ---------------------------------------------------------------------------
// CategoryForm
// ---------------------------------------------------------------------------

function CategoryForm({ values, onChange, onTranslationChange, errors }) {
  const { t } = useTranslation("categories")
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
        <div className="flex items-center flex-col gap-3">
          <Input
            id="cat-img"
            value={values.imageUrl}
            onChange={(e) => onChange("imageUrl", e.target.value)}
            placeholder={t("form.imageUrlPlaceholder")}
            type="url"
            className="flex-1"
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

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function AdminCategories() {
  const { t } = useTranslation("categories")

  const [rows,       setRows]       = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)

  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("displayOrder")
  const debouncedSearch = useDebounce(search, 500)

  const [createOpen,   setCreateOpen]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [formValues, setFormValues] = useState(emptyForm())
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const validateForm = useCallback((values) => {
    const errors = {}
    if (!values.translations.fr.name.trim()) {
      errors["translations.fr.name"] = t("form.nameError")
    }
    return errors
  }, [t])

  const load = useCallback(() => {
    setLoading(true)
    const params = {
      page:     String(page),
      pageSize: String(PAGE_SIZE),
      sortBy,
    }
    if (debouncedSearch) params.q = debouncedSearch

    searchCategories(params)
      .then((data) => {
        setRows(data.items ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        toast.error(t("toast.loadError"))
      })
  }, [page, sortBy, debouncedSearch, t])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [debouncedSearch, sortBy])

  const handleSort = (col) => setSortBy((prev) => toggleSort(col, prev))

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleTranslationChange = (locale, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], [field]: value },
      },
    }))
    const errKey = `translations.${locale}.${field}`
    if (formErrors[errKey]) setFormErrors((prev) => ({ ...prev, [errKey]: undefined }))
  }

  const buildDto = (values) => ({
    slug:         values.slug.trim() || undefined,
    imageUrl:     values.imageUrl.trim() || undefined,
    displayOrder: values.displayOrder !== "" ? Number(values.displayOrder) : undefined,
    translations: buildTranslationsPayload(values.translations),
  })

  const openCreate = () => {
    setFormValues(emptyForm())
    setFormErrors({})
    setCreateOpen(true)
  }

  const handleCreate = async () => {
    const errors = validateForm(formValues)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSaving(true)
    try {
      await createCategory(buildDto(formValues))
      toast.success(t("toast.created", { name: formValues.translations.fr.name }))
      setCreateOpen(false)
      load()
    } catch {
      toast.error(t("toast.createError"))
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (cat) => {
    setEditTarget(cat)
    setFormValues({
      slug:         cat.slug         ?? "",
      imageUrl:     cat.imageUrl     ?? "",
      displayOrder: cat.displayOrder != null ? String(cat.displayOrder) : "",
      translations: cat.translations?.length
        ? extractTranslationsFromDto(cat)
        : {
            fr: { name: cat.name ?? "", description: cat.description ?? "" },
            en: { name: "", description: "" },
          },
    })
    setFormErrors({})
  }

  const handleEdit = async () => {
    const errors = validateForm(formValues)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSaving(true)
    try {
      await updateCategory(editTarget.id, buildDto(formValues))
      toast.success(t("toast.updated", { name: formValues.translations.fr.name }))
      setEditTarget(null)
      load()
    } catch {
      toast.error(t("toast.updateError"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      toast.success(t("toast.deleted", { name: deleteTarget.name }))
      setDeleteTarget(null)
      load()
    } catch {
      toast.error(t("toast.deleteError"))
    } finally {
      setDeleting(false)
    }
  }

  const pages = buildPageRange(page, totalPages)

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6">

        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search.placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={openCreate} size="sm">
            <PlusIcon />
            {t("newCategory")}
          </Button>
        </div>

        {!loading && (
          <p className="text-xs text-muted-foreground">
            {search
              ? t("counterFor", { count: total, search })
              : t("counter",    { count: total })}
          </p>
        )}

        <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">{t("table.image")}</TableHead>
                <TableHead>
                  <button className="inline-flex items-center font-medium hover:text-foreground" onClick={() => handleSort("name")}>
                    {t("table.name")} <SortIcon col="name" sortBy={sortBy} />
                  </button>
                </TableHead>
                <TableHead>{t("table.slug")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("table.description")}</TableHead>
                <TableHead>
                  <button className="inline-flex items-center font-medium hover:text-foreground" onClick={() => handleSort("productCount")}>
                    {t("table.products")} <SortIcon col="productCount" sortBy={sortBy} />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="inline-flex items-center font-medium hover:text-foreground" onClick={() => handleSort("displayOrder")}>
                    {t("table.order")} <SortIcon col="displayOrder" sortBy={sortBy} />
                  </button>
                </TableHead>
                <TableHead className="w-20">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                    {t("empty.noResults")}
                    {search && (
                      <button className="ml-1 underline underline-offset-2 hover:text-foreground" onClick={() => setSearch("")}>
                        {t("empty.clearSearch")}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="size-9 rounded-md object-cover bg-muted" onError={(e) => { e.currentTarget.style.display = "none" }} />
                      ) : (
                        <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                          <ImageOff className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{cat.slug}</code>
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                      {cat.description ?? <span className="italic opacity-50">—</span>}
                    </TableCell>
                    <TableCell><Badge variant="secondary">{cat.productCount}</Badge></TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{cat.displayOrder}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)} title={t("actions.edit")}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(cat)} title={t("actions.delete")}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious text={t("pagination.previous")} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-disabled={page === 1} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {pages.map((p, i) =>
                  p === null ? (
                    <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext text={t("pagination.next")} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-disabled={page === totalPages} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-xs text-muted-foreground">{t("pagination.page", { current: page, total: totalPages })}</p>
          </div>
        )}

        {/* Dialog — Création */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{t("dialogs.create.title")}</DialogTitle>
              <DialogDescription>{t("dialogs.create.description")}</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 px-1">
              <CategoryForm values={formValues} onChange={handleFormChange} onTranslationChange={handleTranslationChange} errors={formErrors} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>{t("dialogs.create.cancel")}</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? t("dialogs.create.submitting") : t("dialogs.create.submit")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog — Édition */}
        <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{t("dialogs.edit.title")}</DialogTitle>
              <DialogDescription>{t("dialogs.edit.description")}</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 px-1">
              <CategoryForm values={formValues} onChange={handleFormChange} onTranslationChange={handleTranslationChange} errors={formErrors} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>{t("dialogs.edit.cancel")}</Button>
              <Button onClick={handleEdit} disabled={saving}>{saving ? t("dialogs.edit.submitting") : t("dialogs.edit.submit")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog — Suppression */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.delete.title")}</DialogTitle>
              <DialogDescription asChild>
                <div>
                  <span dangerouslySetInnerHTML={{ __html: t("dialogs.delete.description", { name: deleteTarget?.name ?? "" }) }} />{" "}
                  {deleteTarget?.productCount > 0 ? (
                    <span className="text-destructive">
                      {t("dialogs.delete.warningProducts", { count: deleteTarget.productCount })}
                    </span>
                  ) : (
                    <span>{t("dialogs.delete.warningNoProducts")}</span>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>{t("dialogs.delete.cancel")}</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? t("dialogs.delete.submitting") : t("dialogs.delete.submit")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  )
}