/**
 * @file components/admin/categories/image-preview.jsx
 * @description Aperçu d'image avec états loading / error / idle.
 */

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ImageOff } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function ImagePreview({ src }) {
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
          <span className="text-[10px] px-1 text-center leading-tight">
            {t("admin.invalidUrl")}
          </span>
        </div>
      )}
    </div>
  )
}