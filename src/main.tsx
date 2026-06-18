/**
 * @file main.jsx
 * @description App entry point.
 *
 * Mock mode is enabled via VITE_MOCK_API=true in .env.local
 * The mock layer is loaded BEFORE the app renders to ensure
 * all handlers are registered before any component fetches data.
 */
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from '@/contexts/auth-context'
import { DirectionProvider } from "@/components/ui/direction"
import { useTranslation } from "react-i18next"
import './index.css'
import App from './App'
import "./lib/i18n";
import { toast } from 'sonner'

function Root() {
  const { i18n } = useTranslation()
  const dir = i18n.dir(i18n.language)
  // Load mock handlers before anything renders
  if (import.meta.env.VITE_MOCK_ENABLED === "true") {
    import("./mocks/index.js");
  }

  useEffect(() => {
    const id = setTimeout(() => {
      toast("This website uses cookies to enhance the user experience. By continuing to browse the site, you agree to our use of cookies.", {
        action: {
          label: "Accept",
          onClick: () => toast.dismiss(),
        },
      });
    }, 100);
    return () => clearTimeout(id);
  }, []);

  return (
    <DirectionProvider direction={dir}>
      <App />
      <Toaster />
    </DirectionProvider>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
)