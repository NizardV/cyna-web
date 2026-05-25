/**
 * @file main.jsx
 * @description App entry point.
 *
 * Mock mode is enabled via VITE_MOCK_API=true in .env.local
 * The mock layer is loaded BEFORE the app renders to ensure
 * all handlers are registered before any component fetches data.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/sonner"
import './index.css'
import App from './App'
import "./lib/i18n";

async function bootstrap() {
  // Load mock handlers before anything renders
  if (import.meta.env.VITE_MOCK_API === "true") {
    await import("./mocks/index.js");
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
      <Toaster />
    </StrictMode>
  );
}

bootstrap();