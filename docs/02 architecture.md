# Architecture

## Vue d'ensemble

Le projet suit une **architecture frontend en couches** inspirée des principes de séparation des responsabilités, sans store global. Chaque couche a une responsabilité unique et ne dépend que de la couche inférieure.

```
┌─────────────────────────────────────────────────────────┐
│                     Couche UI                           │
│                                                         │
│  Pages (React Router) ←→ Composants (shadcn/ui custom)  │
│  /catalog    /product    /admin/*    /account/*         │
│  /auth/*     /cart       /checkout                      │
│                                                         │
│  Contexte : AuthContext (user, login, logout, isAdmin)  │
│  Hooks    : useAuth, useDebounce                        │
└───────────────────────────┬─────────────────────────────┘
                            │ imports
┌───────────────────────────▼─────────────────────────────┐
│                  Couche logique métier                  │
│                                                         │
│  lib/utils.js        → cn(), formatPrice(), formatDate()│
│  lib/pricing-utils.js → BillingPeriod, findTier()       │
│                         pricingPlansToState()           │
│  lib/i18n.js         → configuration i18next            │
└───────────────────────────┬─────────────────────────────┘
                            │ imports
┌───────────────────────────▼─────────────────────────────┐
│                    Couche API (mince)                   │
│                                                         │
│  src/api/client.js  →  ApiClient singleton              │
│    .get() .post() .put() .delete() .patch()             │
│    Injection automatique du cookie JWT (credentials)    │
│    Interception mock si VITE_MOCK_API=true              │
│                                                         │
│  src/api/auth.js          loginUser, adminLogin…        │
│  src/api/products.js      getProduct, createProduct…    │
│  src/api/categories.js    searchCategories, …           │
│  src/api/admin-users.js   getAdminUsers, disableUser…   │
│  src/api/cart.js          addToCart (localStorage)      │
└───────────┬───────────────────────────────┬─────────────┘
            │                               │
      VITE_MOCK_API=true             VITE_MOCK_API=false
            │                               │
┌───────────▼──────────┐        ┌───────────▼────────────┐
│    Couche Mock       │        │    Vite Dev Proxy      │
│                      │        │                        │
│  MockRegistry        │        │  /api → :7169 (HTTPS)  │
│  MockHandler[]       │        │  (backend .NET local)  │
│  Store (Faker)       │        └───────────┬────────────┘
│  Factories           │                    │
└──────────────────────┘            ┌───────▼────────┐
                                    │  Backend .NET  │
                                    │  api.cyna.fr   │
                                    └────────────────┘
```

---

## Flux de données complet

### Exemple : chargement des catégories admin

```
AdminCategories (page)
  │
  └─ useEffect → fetchCategories()
          │
          └─ searchCategories({ q, sortBy, page, pageSize })
                  │                           (src/api/categories.js)
                  │
                  └─ apiClient.get("/categories", { params })
                          │
                  ┌───────┴────────────────┐
                  │ VITE_MOCK_API=true     │ VITE_MOCK_API=false
                  ▼                        ▼
            interceptMock()           coreFetch()
            MockRegistry              fetch("/api/categories?…")
            ordersHandlers            → vite proxy → backend .NET
            → buildPagedResponse()         │
                  │                        │
                  └───────┬────────────────┘
                          ▼
                  { items: [...], total: 40 }
                          │
          setCategories(items)
          setTotal(total)
                          │
          AdminCategories rerender
```

---

## Architecture de la navigation

```
main.tsx
  └─ AuthProvider              ← contexte global d'authentification
       └─ DirectionProvider    ← RTL/LTR selon la langue active
            └─ App
                 └─ BrowserRouter
                      └─ Suspense (fallback: <Loading />)
                           └─ Routes
                                ├─ Routes publiques (non gardées)
                                │   /login, /register, /admin/login
                                │   /forgot-password, /reset-password
                                │   /confirm-email, /cgu, /privacy…
                                │
                                ├─ UserRoute (Outlet)
                                │   /  /search  /catalog/*  /products/:id
                                │   /cart  /checkout  /order-confirmation
                                │
                                ├─ AdminRoute (Outlet)
                                │   /admin/dashboard  /admin/categories
                                │   /admin/products   /admin/users
                                │
                                ├─ AuthRoute (Outlet)
                                │   /account/profile
                                │   /account/security/2fa
                                │
                                └─ UserAuthRoute (Outlet)
                                    /account/orders
```

---

## Flux d'authentification

```
Démarrage de l'application
    │
main.tsx → <AuthProvider>
    │
    └─ useEffect → fetchMe()    → GET /auth/me
            │
            ├─ Succès : setUser(user) — session rehydratée
            └─ Erreur : setUser(null) — non authentifié
                    │
    Toute navigation → wrapper.jsx vérifie useAuth()
            │
            ├─ UserRoute     : isAdminView ? → /admin/dashboard
            ├─ AdminRoute    : !isAdminView ? → /
            ├─ AuthRoute     : !user ? → /login
            └─ UserAuthRoute : !isAuthenticated ? → /login
                               isAdminView ? → /admin/dashboard
```

---

## Flux de connexion utilisateur

```
LoginScreen (/login)
    │  email + password
    ▼
handleSubmit()
    │
    └─ loginUser({ email, password })    → POST /auth/login
            │
            Cookie: Set-Cookie: cyna_token=<jwt>; HttpOnly
            Cookie: Set-Cookie: cyna_refresh_token=<jwt>; HttpOnly
            │
    login()    → fetchMe()    → GET /auth/me → setUser(user)
            │
    navigate("/")
```

---

## Flux de connexion admin (2FA)

```
AdminLogin (/admin/login) — Phase 1
    │  email + password
    ▼
adminLogin({ email, password, totpCode: null })    → POST /auth/admin/login
    │
    ├─ 401 → setError() + setPassword("")     [identifiants invalides]
    │
    ├─ 200 { requiresTwoFactorSetup: true }
    │       → login() + navigate("/account/security/2fa")   [bootstrap 2FA]
    │
    └─ 200 { totpRequired: true }
            → setPhase(2)   [transition silencieuse]
            │
AdminLogin — Phase 2
    │  code TOTP (6 chiffres)
    ▼
adminLogin({ email, password, totpCode })    → POST /auth/admin/login
    │
    ├─ 401 { totpRequired: true } → setError() + setTotp("")
    └─ 200 { token, user }        → login() + navigate("/admin")
```

---

## Gestion des erreurs API

```
coreFetch()
    │
    ├─ response.ok → retourne response.json()
    │
    ├─ 204 No Content → retourne null
    │
    └─ !response.ok
            │
            └─ const error = await response.json()
               throw new ApiError(error.message, response.status, error)

ApiError (src/api/client.js)
    ├─ .message  — message lisible
    ├─ .status   — code HTTP
    └─ .data     — corps de réponse complet

Traitement dans les pages :
    try { … }
    catch (err) {
      if (err.status === 409) toast.error("Déjà utilisé")
      else if (err.status === 403) toast.error("Accès refusé")
      else setError(err.message ?? t("error.generic"))
    }
```

---

## Sélection du mode réseau

```
ApiClient.get/post/put/delete/patch()
    │
    ├─ resolveMock(override)
    │       ├─ override === true  → mock forcé
    │       ├─ override === false → réseau forcé
    │       └─ override === undefined → lit VITE_MOCK_API
    │
    ├─ mock activé → interceptMock(method, path, body)
    │       │
    │       └─ MockRegistry.getHandlers()
    │               → match method + pattern (:param)
    │               → await delay(VITE_MOCK_DELAY)
    │               → resolver({ params, body })
    │               → retourne { data, status }
    │
    └─ mock désactivé → coreFetch(path, options)
            │
            └─ fetch(`${BASE_URL}${path}`, {
                 credentials: "include",    ← envoie les cookies JWT
                 headers: { "Content-Type": "application/json" }
               })
```

---

## Décisions d'architecture notables

### Pourquoi les cookies plutôt que localStorage pour le JWT ?

L'API Cyna utilise des cookies `HttpOnly` pour les tokens JWT. Le frontend n'a donc jamais accès au token directement — il est automatiquement envoyé par le navigateur via `credentials: "include"`. Cela protège contre le vol de token par XSS : un script malveillant ne peut pas lire le cookie.

### Pourquoi pas de store global (Zustand/Redux) ?

L'application est un SPA orienté pages, où chaque page est indépendante et recharge ses données à chaque montage. L'état partagé se limite à la session utilisateur (AuthContext). Ajouter un store global complexifierait l'architecture sans bénéfice réel pour ce cas d'usage.

### Pourquoi un intercepteur mock dans le client plutôt que MSW ?

Le choix d'un mock côté `ApiClient` plutôt que MSW (Service Worker) permet un fonctionnement identique dans tous les environnements (y compris Codespaces, émulateurs) sans configuration de Service Worker, et offre un override par appel (`{ mock: true }`) utile pour les tests ponctuels.

### Pourquoi shadcn/ui ?

shadcn/ui fournit des composants accessibles (Radix UI), stylisés via Tailwind CSS et entièrement possédés dans le projet (pas de package noir). Ils sont personnalisables sans surchage CSS externe.