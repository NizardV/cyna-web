# Admin — Tableau de bord (`/admin/dashboard`)

> **Cas spécial** — Le dashboard est actuellement un **placeholder** en attente d'implémentation. Cette page documente l'état existant, le bouton mock, et ce qui reste à faire.

---

## État actuel

```jsx
// src/App.jsx
<Route path="/admin/dashboard" element={<Loading />} />
```

La route est enregistrée et protégée par `<AdminRoute />`, mais le composant renvoie pour l'instant `<Loading />` (spinner d'écran de chargement). Le composant Dashboard réel **n'existe pas encore**.

---

## Le bouton mock (VITE_OVERRIDE_ROLE)

### Problème résolu

En développement, naviguer vers `/admin/*` sans être admin authentifié provoque une redirection vers `/`. Pour contourner ça sans avoir à se connecter manuellement à chaque rechargement, le projet expose une variable d'environnement :

```bash
# .env.local
VITE_OVERRIDE_ROLE=true
```

### Comment ça fonctionne

```js
// src/hooks/use-auth.js
const ROLE_OVERRIDE = import.meta.env.VITE_OVERRIDE_ROLE === "true"

const isAdminView = ROLE_OVERRIDE
  ? pathname.startsWith("/admin")  // ← déterminé par l'URL
  : context.isAdmin               // ← déterminé par le token JWT
```

Quand `VITE_OVERRIDE_ROLE=true` :
- Toute URL commençant par `/admin` est considérée comme une vue admin
- `<AdminRoute />` laisse passer sans vérifier l'authentification réelle
- `<UserRoute />` redirige vers `/admin/dashboard` si on est sur `/admin/*`

> Ce flag est **purement front et dev-only**. Il n'affecte pas les appels API (qui eux restent soumis au vrai token).

### Activation

```bash
# Démarrer avec l'override admin activé
VITE_OVERRIDE_ROLE=true VITE_MOCK_API=true npm run dev
```

Ou dans `.env.local` :
```
VITE_OVERRIDE_ROLE=true
VITE_MOCK_API=true
```

### Gardes de route concernées

```
UserRoute     : si OVERRIDE + URL /admin/* → redirect /admin/dashboard
AdminRoute    : si OVERRIDE + URL /admin/* → passe (Outlet)
UserAuthRoute : si OVERRIDE + URL /admin/* → redirect /admin/dashboard
```

---

## Données KPI prévues

L'endpoint mock `GET /admin/dashboard` est déjà enregistré dans `src/mocks/handlers/orders.js` :

```
GET /admin/dashboard
Réponse : { revenue, orders, salesPerDay, salesPerCategory }
```

Les KPIs attendus pour le futur composant Dashboard :

| KPI | Description |
|-----|-------------|
| `revenue` | Chiffre d'affaires total (€) |
| `orders` | Nombre de commandes |
| `salesPerDay` | Tableau de ventes journalières (graphique) |
| `salesPerCategory` | Répartition par catégorie (camembert / barres) |

---

## Ce qui reste à faire

```
[ ] Créer src/pages/admin/dashboard.jsx
[ ] Remplacer element={<Loading />} par element={<AdminDashboard />} dans App.jsx
[ ] Implémenter les widgets KPI (revenue, orders, chart salesPerDay, chart salesPerCategory)
[ ] Connecter au endpoint GET /admin/dashboard
[ ] Ajouter les traductions admin.json → "dashboard.*"
```

---

## Navigation vers le dashboard

Après un login admin réussi, la redirection vers `/admin` n'est pas encore gérée côté App.jsx. Les redirections actuelles :

```
/admin      → pas de route catch-all → 404
/admin/dashboard → <Loading /> (placeholder)
```

À terme, il faudra :
1. Soit ajouter `<Route index element={<Navigate to="dashboard" />} />` sous `<AdminRoute />`
2. Soit gérer la redirection dans `AdminLogin` directement vers `/admin/dashboard`

---

## Fichiers concernés

```
src/App.jsx                         Route /admin/dashboard → <Loading />
src/hooks/use-auth.js               VITE_OVERRIDE_ROLE → isAdminView
src/wrapper.jsx                     AdminRoute, UserRoute, UserAuthRoute
src/mocks/handlers/orders.js        GET /admin/dashboard (handler déjà existant)
src/pages/specials/loading.jsx      Composant affiché en attendant le vrai dashboard
```
