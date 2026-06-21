/**
 * @file components/ui/account/subscription.jsx
 *
 * Aligné sur SubscriptionDto (v1) :
 *   { id, status, productName, planName,
 *     currentPeriodStart, currentPeriodEnd, autoRenew }
 *
 * Remplacements :
 *   sub.endsAt      → sub.currentPeriodEnd
 *   sub.quantity    → supprimé (pas dans le DTO v1)
 *   sub.planName    → affiché à la place
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"

// ---------------------------------------------------------------------------
// CancelSubscriptionDialog
// ---------------------------------------------------------------------------

/**
 * Dialog de confirmation de résiliation d'un abonnement.
 *
 * @param {{
 *   sub: object|null,
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   onConfirm: () => void,
 *   loading: boolean
 * }} props
 */
export function CancelSubscriptionDialog({ sub, open, onOpenChange, onConfirm, loading }) {
  const { t } = useTranslation("profile")

  const renewalDate = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("fr-FR")
    : "—"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("subscriptions.cancelDialog.title", { defaultValue: "Résilier l'abonnement" })}
          </DialogTitle>
          <DialogDescription>
            {t("subscriptions.cancelDialog.description", {
              defaultValue: "Êtes-vous sûr de vouloir résilier cet abonnement ? Cette action est irréversible.",
            })}
          </DialogDescription>
        </DialogHeader>

        {sub && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-0.5">
            <p className="text-xs font-bold text-foreground">{sub.productName}</p>
            {sub.planName && (
              <p className="text-xs text-muted-foreground">{sub.planName}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("subscriptions.renewal", {
                date: renewalDate,
                defaultValue: `Renouvellement le ${renewalDate}`,
              })}
            </p>
          </div>
        )}

        <DialogFooter showCloseButton>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? t("subscriptions.cancelDialog.cancelling", { defaultValue: "Résiliation…" })
              : t("subscriptions.cancelDialog.confirm",   { defaultValue: "Confirmer la résiliation" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// SubscriptionItem
// ---------------------------------------------------------------------------

/**
 * @param {{ sub: object, onCancelRequest: (sub: object) => void }} props
 * sub shape: SubscriptionDto { id, status, productName, planName,
 *   currentPeriodStart, currentPeriodEnd, autoRenew }
 */
export function SubscriptionItem({ sub, onCancelRequest }) {
  const { t } = useTranslation("profile")

  const renewalDate = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("fr-FR")
    : "—"

  return (
    <div className="flex items-center justify-between rounded-none border border-primary bg-primary/5 p-4 gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-bold text-foreground truncate">{sub.productName}</h4>
          {sub.planName && (
            <Badge variant="secondary" className="text-xs font-normal">
              {sub.planName}
            </Badge>
          )}
          {sub.autoRenew && (
            <Badge variant="outline" className="text-xs border-green-300 text-green-600">
              {t("subscriptions.autoRenew", { defaultValue: "Renouvellement auto" })}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("subscriptions.renewal", {
            date: renewalDate,
            defaultValue: `Renouvellement le ${renewalDate}`,
          })}
        </p>
      </div>

      <Button
        variant="destructive"
        size="sm"
        className="shrink-0"
        onClick={() => onCancelRequest(sub)}
      >
        {t("subscriptions.cancel")}
      </Button>
    </div>
  )
}