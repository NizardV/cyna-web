/**
 * @file downloads.jsx
 * @description Page de téléchargement de l'application Android CYNA.
 */
import { Download, Smartphone } from "lucide-react"
import { Layout } from "../components/layout/layout"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

const APK_URL =
  "https://github.com/DiiageCUCDB/DI1-P5-E3_Cyna-App/releases/latest/download/app-debug.apk"

export function Downloads() {
  return (
    <Layout>
      <div className="flex items-center justify-center py-24 px-4">
        <Card className="max-w-md w-full text-center shadow-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-[#7C3AED]/10 p-5 rounded-full">
                <Smartphone className="w-12 h-12 text-[#7C3AED]" />
              </div>
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="text-[#7C3AED] border-[#7C3AED]/30">
                Android
              </Badge>
              <CardTitle className="text-2xl">Application CYNA</CardTitle>
              <CardDescription>
                Télécharge l'application CYNA sur ton appareil Android.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              asChild
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]"
            >
              <a href={APK_URL} download>
                <Download className="w-4 h-4 mr-2" />
                Télécharger l'APK
              </a>
            </Button>

            <p className="text-xs text-muted-foreground">
              Pense à activer{" "}
              <span className="font-medium text-foreground">Sources inconnues</span>{" "}
              dans Paramètres → Sécurité avant d'installer.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}