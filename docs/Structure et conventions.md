# Structure du projet et conventions

## Arborescence

```
Cyna-Web/
├── public/
│   └── locales/          # Fichiers de traduction i18n (en, fr)
├── src/
│   ├── api/              # Couche d'accès à l'API
│   │   ├── client.js     # Singleton ApiClient avec interception mock
│   │   └── *.js          # Modules par ressource (products, auth, orders…)
│   ├── components/       # Composants réutilisables
│   │   └── ui/           # Composants d'interface (shadcn/ui)
│   ├── contexts/         # Contextes React globaux
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires (cn, i18n…)
│   ├── mocks/            # Couche mock (désactivée en production)
│   │   ├── factories/    # Générateurs de données avec Faker
│   │   ├── handlers/     # Handlers par domaine métier
│   │   ├── index.js      # Point d'entrée — enregistre tous les handlers
│   │   └── registry.js   # Singleton MockRegistry
│   ├── pages/            # Pages de l'application
│   │   └── specials/     # Pages système (404, 403, Loading)
│   ├── App.jsx           # Routeur principal
│   ├── main.tsx          # Point d'entrée de l'application
│   └── index.css         # Variables CSS globales et thème
├── .env.example          # Variables d'environnement (template)
├── .env.local            # Variables locales (non versionné)
├── components.json       # Configuration shadcn/ui
├── eslint.config.js      # Configuration ESLint
├── vite.config.ts        # Configuration Vite
├── tsconfig.app.json     # TypeScript pour le code applicatif
└── tsconfig.node.json    # TypeScript pour les outils (vite.config…)
```

---

## Conventions de nommage

### Fichiers

| Type | Convention | Exemple |
|------|-----------|---------|
| Composants React | `kebab-case.tsx` | `product-card.tsx` |
| Pages | `kebab-case.jsx` | `mock-demo.jsx` |
| Hooks | `camelCase.js` | `useDebounce.js` |
| Utilitaires | `camelCase.ts` | `utils.ts` |
| Modules API | `kebab-case.js` | `products.js` |
| Handlers mock | `kebab-case.js` | `products.js` |

### Composants

- Un composant par fichier
- Export nommé pour les composants de page (`export function Home`)
- Export par défaut pour les composants spéciaux (`export default Loading`)

### Variables d'environnement

Toutes les variables exposées au client Vite sont préfixées `VITE_` :

```
VITE_API_URL       # URL de base de l'API backend
VITE_MOCK_API      # "true" pour activer le mode mock
VITE_MOCK_DELAY    # Délai simulé en ms (ex. 400)
```

Ne jamais mettre de secrets dans des variables `VITE_` — elles sont embarquées dans le bundle.

---

## Conventions de code

### Imports

Ordre recommandé :
1. Bibliothèques externes (`react`, `react-router-dom`…)
2. Alias internes (`@/components/…`, `@/lib/…`)
3. Imports relatifs (`./client.js`, `../hooks/useDebounce.js`)

### Alias `@/`

L'alias `@/` pointe vers `src/`. Préférez-le aux chemins relatifs profonds :

```js
// ✅ Bien
import { cn } from "@/lib/utils"

// ❌ À éviter
import { cn } from "../../../lib/utils"
```

### Styling

- **Tailwind CSS v4** pour tous les styles utilitaires
- **CSS variables** (définies dans `index.css`) pour les couleurs et tokens du thème
- **`cn()`** (clsx + tailwind-merge) pour les classes conditionnelles :

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class")} />
```

### Internationalisation

Toutes les chaînes visibles par l'utilisateur passent par `react-i18next` :

```jsx
import { useTranslation } from "react-i18next"

const { t } = useTranslation()
return <h1>{t("welcome")}</h1>
```

Les fichiers de traduction sont dans `public/locales/{langue}/translation.json`.

---

## Couche API — principe général

La couche `src/api/` expose des fonctions métier qui délèguent toutes à `apiClient` :

```
Page/Composant
    └── appelle getProducts()           ← src/api/products.js
            └── apiClient.get("/products")  ← src/api/client.js
                    └── mock ou fetch réel
```

Le composant ne sait jamais si la réponse vient du mock ou du vrai backend. Pour les détails, voir `docs/api/`.

---

## Variables CSS et thème

Le thème est défini dans `src/index.css` avec des variables CSS en `oklch`. Les modes clair et sombre sont gérés via la classe `.dark` sur le `<html>`.

shadcn/ui et Tailwind lisent ces variables automatiquement — ne pas coder de couleurs en dur dans les composants.