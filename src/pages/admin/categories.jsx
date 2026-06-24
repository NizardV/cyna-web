/**
 * @file pages/admin/categories.jsx
 * @description Page CRUD admin pour la gestion des catégories.
 * Orchestration uniquement — le rendu est délégué aux composants
 * sous components/admin/categories/.
 */

import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { PlusIcon, Search } from "lucide-react"

import {
  searchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  buildTranslationsPayload,
  extractTranslationsFromDto,
} from "@/api/categories.js"
import { useDebounce } from "@/hooks/useDebounce.js"

import { Button } from "@/components/ui/button"
import { Input }  from "@/components/ui/input"
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { buildPageRange } from "@/lib/utils"
import { Layout } from "@/components/layout/layout"

import {
  CategoryTable,
  CreateCategoryDialog,
  EditCategoryDialog,
  DeleteCategoryDialog,
} from "@/components/admin/categories"

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5

const SORT_COLS = {
  displayOrder: { asc: "displayOrder", desc: "displayOrder_desc" },
  name:         { asc: "name",         desc: "name_desc" },
  productCount: { asc: "productCount", desc: "productCount_desc" },
}

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
// Page
// ---------------------------------------------------------------------------

export function AdminCategories() {
  const { t } = useTranslation("categories")

  // ── List state ──────────────────────────────────────────────────────────
  const [rows,       setRows]       = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [sortBy,     setSortBy]     = useState("displayOrder")
  const debouncedSearch = useDebounce(search, 500)

  // ── Dialog state ─────────────────────────────────────────────────────────
  const [createOpen,   setCreateOpen]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Form state ───────────────────────────────────────────────────────────
  const [formValues, setFormValues] = useState(emptyForm())
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  // ── Data loading ─────────────────────────────────────────────────────────
  const load = useCallback(() => {
    setLoading(true)
    const params = { page: String(page), pageSize: String(PAGE_SIZE), sortBy }
    if (debouncedSearch) params.q = debouncedSearch

    searchCategories(params)
      .then((data) => {
        setRows(data.items ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
      })
      .catch(() => toast.error(t("toast.loadError")))
      .finally(() => setLoading(false))
  }, [page, sortBy, debouncedSearch, t])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [debouncedSearch, sortBy])

  // ── Validation ───────────────────────────────────────────────────────────
  const validateForm = useCallback((values) => {
    const errors = {}
    if (!values.translations.fr.name.trim()) {
      errors["translations.fr.name"] = t("form.nameError")
    }
    return errors
  }, [t])

  // ── Form handlers (shared between create and edit) ───────────────────────
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

  // ── Create ────────────────────────────────────────────────────────────────
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

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (cat) => {
    setEditTarget(cat)
    setFormValues({
      slug:         cat.slug ?? "",
      imageUrl:     cat.imageUrl ?? "",
      displayOrder: cat.displayOrder != null ? String(cat.displayOrder) : "",
      translations: cat.translations?.length
        ? extractTranslationsFromDto(cat)
        : {
            fr: { name: cat.name ?? "",        description: cat.description ?? "" },
            en: { name: "",                    description: "" },
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

  // ── Delete ────────────────────────────────────────────────────────────────
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

        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Toolbar */}
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

        {/* Table */}
        <CategoryTable
          rows={rows}
          loading={loading}
          sortBy={sortBy}
          search={search}
          onSort={(col) => setSortBy((prev) => toggleSort(col, prev))}
          onEdit={openEdit}
          onDelete={(cat) => setDeleteTarget(cat)}
          onClearSearch={() => setSearch("")}
        />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text={t("pagination.previous")}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {pages.map((p, i) =>
                  p === null ? (
                    <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => setPage(p)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    text={t("pagination.next")}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <p className="text-xs text-muted-foreground">
              {t("pagination.page", { current: page, total: totalPages })}
            </p>
          </div>
        )}

        {/* Dialogs */}
        <CreateCategoryDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          formValues={formValues}
          formErrors={formErrors}
          saving={saving}
          onChange={handleFormChange}
          onTranslationChange={handleTranslationChange}
          onSubmit={handleCreate}
        />
        <EditCategoryDialog
          target={editTarget}
          onClose={() => setEditTarget(null)}
          formValues={formValues}
          formErrors={formErrors}
          saving={saving}
          onChange={handleFormChange}
          onTranslationChange={handleTranslationChange}
          onSubmit={handleEdit}
        />
        <DeleteCategoryDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
          onConfirm={handleDelete}
        />
      </div>
    </Layout>
  )
}