import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuration du proxy pour rediriger les requêtes API vers le backend .NET
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7169',
        changeOrigin: true,
        secure: false, // Permet d'ignorer les alertes de certificat SSL local de .NET
        rewrite: (path) => path.replace(/^\/api/, '') // Enlève le préfixe /api avant d'envoyer au backend
      }
    }
  }
})
