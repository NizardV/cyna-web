import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

// ---------------------------------------------------------------------------
// CancelSubscriptionDialog — confirmation before revoking
// ---------------------------------------------------------------------------

export function CancelSubscriptionDialog({ sub, open, onOpenChange, onConfirm, loading }) {
  const { t } = useTranslation("profile")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("subscriptions.cancelDialog.title", { defaultValue: "Résilier l'abonnement" })}</DialogTitle>
          <DialogDescription>
            {t("subscriptions.cancelDialog.description", {
              defaultValue: "Êtes-vous sûr de vouloir résilier cet abonnement ? Cette action est irréversible.",
              productName: sub?.productName ?? "",
            })}
          </DialogDescription>
        </DialogHeader>

        {sub && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-bold text-foreground">{sub.productName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("subscriptions.users", { count: sub.quantity })} •{" "}
              {t("subscriptions.renewal", {
                date: new Date(sub.endsAt).toLocaleDateString(),
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
              : t("subscriptions.cancelDialog.confirm", { defaultValue: "Confirmer la résiliation" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// SubscriptionItem — purple border accent
// ---------------------------------------------------------------------------

export function SubscriptionItem({ sub, onCancelRequest }) {
  const { t } = useTranslation("profile")

  return (
    <div className="flex items-center justify-between rounded-none border border-primary bg-primary/5 p-4">
      <div>
        <h4 className="text-xs font-bold text-foreground">{sub.productName}</h4>
        <p className="text-xs text-muted-foreground">
          {t("subscriptions.users", { count: sub.quantity })} •{" "}
          {t("subscriptions.renewal", {
            date: new Date(sub.endsAt).toLocaleDateString(),
          })}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onCancelRequest(sub)}
        >
          {t("subscriptions.cancel")}
        </Button>
      </div>
    </div>
  )
}