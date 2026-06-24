# Structure du projet et conventions

## Arborescence

```
Cyna-Web/
├── public/
│   └── locales/                    ← Fichiers JSON de traduction
│       ├── fr/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── admin-login.json
│       │   ├── admin-products.json
│       │   ├── admin-users.json
│       │   ├── auth-extra.json
│       │   ├── cart.json
│       │   ├── categories.json
│       │   ├── checkout.json
│       │   ├── confirm-email.json
│       │   ├── contact.json
│       │   ├── forgot-password.json
│       │   ├── home.json
│       │   ├── layout.json
│       │   ├── order-history.json
│       │   ├── product.json
│       │   ├── profile.json
│       │   ├── reset-password.json
│       │   ├── search.json
│       │   └── security-2fa.json
│       ├── en/
│       ├── ar/
│       └── he/
│
├── src/
│   ├── api/                        ← Appels HTTP (un fichier par domaine)
│   │   ├── client.js               ← ApiClient singleton + mock interceptor
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── admin-users.js
│   │   └── cart.js
│   │
│   ├── components/
│   │   ├── ui/                     ← Composants shadcn/ui (Button, Card, Input…)
│   │   ├── layout/                 ← Header, Footer, Layout, LangSwitcher, Search
│   │   ├── auth/                   ← AuthCard, OtpInput, PasswordStrength
│   │   ├── home/                   ← HomeCarousel, CategoryGrid, FeaturedProducts
│   │   ├── product/                ← ProductGallery, ProductInfo, ProductPricing, PricingTiersTable
│   │   ├── cart/                   ← CartRow, CartSummary, CartSkeleton
│   │   ├── search/                 ← ProductCard, filtres, SearchPagination
│   │   ├── catalog/                ← CategoryHeader
│   │   ├── account/                ← AccountNav, OrderGroup, Subscription
│   │   └── admin/
│   │       ├── product/            ← Card, FormGeneral, FormMedia, FormPricing, FormSpecs, Table
│   │       └── user/               ← UserTable, UserToolbar, RoleCombobox, StatusIndicators
│   │
│   ├── contexts/
│   │   └── auth-context.jsx        ← AuthContext (user, login, logout, isAdmin)
│   │
│   ├── hooks/
│   │   └── use-auth.js             ← useAuth() + VITE_OVERRIDE_ROLE
│   │
│   ├── lib/
│   │   ├── utils.js                ← cn(), formatPrice(), formatDate(), buildPageRange()
│   │   ├── pricing-utils.js        ← BillingPeriod, findTier, pricingPlansToState…
│   │   └── i18n.js                 ← Configuration i18next
│   │
│   ├── mocks/                      ← Couche mock (actif si VITE_MOCK_API=true)
│   │   ├── index.js                ← Point d'entrée — importe tous les handlers
│   │   ├── registry.js             ← MockRegistry singleton
│   │   ├── store.js                ← Source unique de données en mémoire
│   │   ├── factories/
│   │   │   └── factories.js        ← makeUser, makeProduct, makeCategory…
│   │   └── handlers/
│   │       ├── auth.js             ← login, register, otp, confirm-email, admin/login, 2fa
│   │       ├── products.js
│   │       ├── orders.js           ← commandes, panier, dashboard, carousel
│   │       ├── home.js
│   │       └── admin-users.js
│   │
│   ├── pages/
│   │   ├── auth/                   ← AdminLogin, ForgotPassword, ResetPassword, ConfirmEmail
│   │   ├── admin/
│   │   │   ├── categories.jsx
│   │   │   ├── users.jsx
│   │   │   └── product/            ← products.jsx, product-form.jsx
│   │   ├── account/                ← profile.jsx, order-history.jsx, security-2fa.jsx
│   │   └── specials/               ← loading.jsx, not-found.jsx, unauthorized.jsx
│   │
│   ├── App.jsx                     ← Arbre de routes React Router v6
│   ├── wrapper.jsx                 ← UserRoute, AdminRoute, AuthRoute, UserAuthRoute
│   └── main.tsx                    ← Point d'entrée — initialise mocks avant tout rendu
│
├── .env.example
├── vite.config.ts
├── Dockerfile
├── nginx.conf
├── ci-web.yml                      ← Pipeline CI Azure DevOps
└── cd-cloud-web.yml                ← Pipeline CD OVH
```

---

## Conventions de nommage

### Fichiers

| Type | Convention | Exemple |
|------|-----------|---------|
| Page | `kebab-case.jsx` | `admin-login.jsx` |
| Composant | `kebab-case.jsx` | `product-pricing.jsx` |
| Hook | `use-kebab-case.js` | `use-auth.js` |
| Contexte | `kebab-case-context.jsx` | `auth-context.jsx` |
| API | `kebab-case.js` | `admin-users.js` |
| Handler mock | `kebab-case.js` | `auth.js` |
| Utilitaire | `kebab-case.js` | `pricing-utils.js` |

### Exports

```jsx
// Page / composant racine : export nommé en PascalCase
export function AdminLogin() { … }
export function ProductGallery() { … }

// Hook : export nommé en camelCase
export function useAuth() { … }

// Singleton : export nommé en camelCase
export const apiClient = new ApiClient()
export const mockRegistry = new MockRegistry()
```

### Alias d'import

L'alias `@/` pointe vers `src/`. Toujours utiliser l'alias pour les imports absolus :

```jsx
// ✅ Correct
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/api/client"

// ❌ Interdit
import { useAuth } from "../../../hooks/use-auth"
```

---

## Règles fondamentales

### Couche API — isolation totale

Les pages et composants ne doivent **jamais** appeler `apiClient` directement. Toute logique réseau passe par les fichiers `src/api/*.js` :

```jsx
// ✅ Correct — la page importe la fonction métier
import { loginUser } from "@/api/auth"
const data = await loginUser({ email, password })

// ❌ Interdit — la page ne touche pas apiClient
import { apiClient } from "@/api/client"
const data = await apiClient.post("/auth/login", { email, password })
```

### Couleurs — toujours via variables CSS

```jsx
// ✅ Via classes Tailwind utilisant les variables du thème
<div className="bg-background text-foreground">
<Button className="bg-primary text-primary-foreground">

// ❌ Couleurs en dur
<div style={{ backgroundColor: "#562BF5" }}>
```

### État des formulaires — setState local, jamais de store global

L'application ne possède pas de store Zustand/Redux. L'état d'un formulaire vit dans le composant page via `useState`. Les données serveur ne sont pas cachées — chaque montage de page relance un fetch.

```jsx
// ✅ Pattern standard d'un formulaire
const [formData, setFormData] = useState({ email: "", password: "" })
const [loading,  setLoading]  = useState(false)
const [error,    setError]    = useState("")
```

### Toasts — via Sonner

Les retours utilisateur (succès, erreur) passent exclusivement par `toast()` de Sonner, jamais par des `alert()` ou `confirm()` sauf cas exceptionnel (`window.confirm` uniquement pour les suppressions critiques) :

```jsx
import { toast } from "sonner"

toast.success(t("categories.deleteSuccess"))
toast.error(t("categories.deleteErrorReferenced"))
```

---

## Variables d'environnement

Définies dans `.env.local` (non commité) à partir du modèle `.env.example`.

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `VITE_API_URL` | Oui | URL de base du backend .NET (`/api` par défaut via proxy Vite) |
| `VITE_MOCK_API` | Non | `true` → active la couche mock interne (`MockRegistry`, aucune requête réseau) |
| `VITE_MOCK_DELAY` | Non | Délai simulé en ms (défaut : `400`) |
| `VITE_OVERRIDE_ROLE` | Non | `true` → déduit le rôle admin depuis le préfixe `/admin` dans l'URL |

### Mode mock — développement sans backend

```env
VITE_MOCK_API=true
VITE_API_URL=http://localhost:5104    # ignoré en mode mock, mais requis
VITE_OVERRIDE_ROLE=true               # optionnel — accès admin sans login
```

### Mode backend réel

```env
VITE_MOCK_API=false
VITE_API_URL=http://localhost:5104
```

> Le proxy Vite redirige les requêtes `/api/*` → `https://localhost:7169` (port HTTPS du backend .NET local, certificat auto-signé ignoré via `secure: false`).

---

## Gradle / Build

| Commande | Description |
|----------|-------------|
| `npm install` | Installe les dépendances |
| `npm run dev` | Démarre le serveur de développement (HMR) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build localement |
| `npm run lint` | ESLint sur l'ensemble du projet |

### Compatibilité CI / Windows

Le CI tourne sur `node:22-slim` (Linux). Si des dépendances sont modifiées depuis Windows, régénérer le lockfile dans un conteneur Linux avant de commiter :

```powershell
docker run --rm -v "${PWD}:/app" -w /app node:22-slim npm install
```