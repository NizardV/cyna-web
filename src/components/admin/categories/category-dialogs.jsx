/**
 * @file components/admin/categories/category-dialogs.jsx
 * @description Dialogs de création, édition et suppression de catégorie.
 */

import { useTranslation } from "react-i18next"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CategoryForm } from "./category-form"

// ---------------------------------------------------------------------------
// Create dialog
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   formValues: object,
 *   formErrors: object,
 *   saving: boolean,
 *   onChange: (field: string, value: unknown) => void,
 *   onTranslationChange: (locale: string, field: string, value: string) => void,
 *   onSubmit: () => void,
 * }} props
 */
export function CreateCategoryDialog({
  open, onOpenChange,
  formValues, formErrors, saving,
  onChange, onTranslationChange, onSubmit,
}) {
  const { t } = useTranslation("categories")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("dialogs.create.title")}</DialogTitle>
          <DialogDescription>{t("dialogs.create.description")}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-1">
          <CategoryForm
            values={formValues}
            onChange={onChange}
            onTranslationChange={onTranslationChange}
            errors={formErrors}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("dialogs.create.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? t("dialogs.create.submitting") : t("dialogs.create.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Edit dialog
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   target: object | null,
 *   onClose: () => void,
 *   formValues: object,
 *   formErrors: object,
 *   saving: boolean,
 *   onChange: (field: string, value: unknown) => void,
 *   onTranslationChange: (locale: string, field: string, value: string) => void,
 *   onSubmit: () => void,
 * }} props
 */
export function EditCategoryDialog({
  target, onClose,
  formValues, formErrors, saving,
  onChange, onTranslationChange, onSubmit,
}) {
  const { t } = useTranslation("categories")

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("dialogs.edit.title")}</DialogTitle>
          <DialogDescription>{t("dialogs.edit.description")}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-1">
          <CategoryForm
            values={formValues}
            onChange={onChange}
            onTranslationChange={onTranslationChange}
            errors={formErrors}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("dialogs.edit.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? t("dialogs.edit.submitting") : t("dialogs.edit.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Delete dialog
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   target: object | null,
 *   onClose: () => void,
 *   deleting: boolean,
 *   onConfirm: () => void,
 * }} props
 */
export function DeleteCategoryDialog({ target, onClose, deleting, onConfirm }) {
  const { t } = useTranslation("categories")

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogs.delete.title")}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <span
                dangerouslySetInnerHTML={{
                  __html: t("dialogs.delete.description", { name: target?.name ?? "" }),
                }}
              />{" "}
              {target?.productCount > 0 ? (
                <span className="text-destructive">
                  {t("dialogs.delete.warningProducts", { count: target.productCount })}
                </span>
              ) : (
                <span>{t("dialogs.delete.warningNoProducts")}</span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            {t("dialogs.delete.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? t("dialogs.delete.submitting") : t("dialogs.delete.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}