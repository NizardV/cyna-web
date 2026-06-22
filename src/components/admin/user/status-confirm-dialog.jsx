/**
 * @file components/admin/user/status-confirm-dialog.jsx
 * @description Confirmation dialog shown before disabling/enabling a user account.
 */

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"

/**
 * @param {{
 *   target: object|null,           // the AdminUserDto being toggled, or null when closed
 *   onCancel: () => void,
 *   onConfirm: () => void,
 *   saving: boolean,
 *   t: (key: string, opts?: object) => string,
 * }} props
 */
export function UserStatusConfirmDialog({ target, onCancel, onConfirm, saving, t }) {
  const willEnable = target?.isDisabled
  const fullName = target ? `${target.firstName} ${target.lastName}` : ""

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {willEnable ? t("dialog.enableTitle") : t("dialog.disableTitle")}
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              {willEnable
                ? t("dialog.enableDescription", { name: fullName })
                : t("dialog.disableDescription", { name: fullName })}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            {t("dialog.cancel")}
          </Button>
          <Button
            variant={willEnable ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={saving}
          >
            {saving
              ? t("dialog.saving")
              : willEnable ? t("dialog.confirmEnable") : t("dialog.confirmDisable")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}