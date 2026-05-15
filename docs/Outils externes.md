# Outils externes

Ce document présente les outils de qualité et d'automatisation utilisés dans le projet.

---

## Prettier

**Rôle** : formatage automatique du code source.

Prettier reformate le code de façon déterministe à chaque sauvegarde ou commit, éliminant les débats de style au sein de l'équipe.

### Configuration (`.prettierrc`)

```json
{
  "endOfLine": "lf",
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "src/index.css",
  "tailwindFunctions": ["cn", "cva"]
}
```

Points notables :
- Pas de point-virgule (`"semi": false`)
- Guillemets doubles (`"singleQuote": false`)
- Le plugin `prettier-plugin-tailwindcss` trie automatiquement les classes Tailwind

### Utilisation

```bash
# Formater tous les fichiers TypeScript/TSX
npm run format

# Vérifier sans modifier (utile en CI)
npx prettier --check "**/*.{ts,tsx}"
```

### Fichiers ignorés (`.prettierignore`)

```
node_modules/
coverage/
pnpm-lock.yaml
package-lock.json
yarn.lock
```

---

## ESLint

**Rôle** : analyse statique du code pour détecter les erreurs et mauvaises pratiques.

### Configuration (`eslint.config.js`)

Le projet utilise le nouveau format flat config d'ESLint v9 :

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
  },
])
```

Règles activées :
- **`@typescript-eslint/recommended`** — règles TypeScript strictes
- **`eslint-plugin-react-hooks`** — vérifie les dépendances des hooks (`useEffect`, `useCallback`…)
- **`eslint-plugin-react-refresh`** — évite les exports incompatibles avec le HMR de Vite

### Utilisation

```bash
# Lancer le lint
npm run lint

# Corriger automatiquement ce qui peut l'être
npx eslint . --fix
```

### Versions compatibles

`eslint` et `@eslint/js` doivent rester sur la même version majeure. Actuellement : **ESLint v9 + `@eslint/js` v9**.

---

## React Doctor

**Rôle** : audit de santé d'un projet React — score de 0 à 100.

React Doctor scanne le code et remonte des problèmes de sécurité, performance, accessibilité, taille de bundle et architecture.

### Installation

Aucune installation requise — s'utilise via `npx` :

```bash
npx react-doctor@latest . --verbose
```

Un raccourci est disponible dans les scripts npm :

```bash
npm run doctor
```

### Options principales

| Flag | Rôle |
|------|------|
| `.` | Dossier à analyser |
| `--verbose` | Affiche les fichiers et numéros de ligne concernés |
| `--diff` | Analyse uniquement les fichiers modifiés depuis la branche de base |
| `--score` | Affiche uniquement le score numérique |

### Utilisation recommandée

Avant chaque commit ou pull request :

```bash
npx react-doctor@latest . --verbose --diff
```

Si le score régresse par rapport à la branche de base, corriger les erreurs avant de commiter. Les erreurs (`error`) bloquent, les avertissements (`warning`) sont à traiter par ordre de priorité.

---

## TypeScript

**Rôle** : typage statique de JavaScript.

Le projet utilise TypeScript en mode strict (`"strict": true` dans `tsconfig.app.json`). Les fichiers `.tsx` sont utilisés pour les composants React, `.ts` pour les utilitaires purs.

### Vérifier les types sans compiler

```bash
npm run typecheck
```

Cette commande correspond à `tsc --noEmit` — elle signale les erreurs de types sans produire de fichiers de sortie.

---

## i18next — internationalisation

**Rôle** : gérer les traductions et la détection de langue dans l'application.

Le projet utilise `i18next` avec trois plugins : `i18next-http-backend` (chargement des fichiers JSON), `i18next-browser-languagedetector` (détection automatique de la langue du navigateur) et `react-i18next` (intégration React).

### Configuration (`src/lib/i18n.js`)

```js
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import HttpBackend from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector"

export const LOCALES = ["en", "fr"]
export const DEFAULT_LOCALE = "en"

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALES,
    interpolation: { escapeValue: false },
    debug: import.meta.env.DEV,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  })
```

Le paramètre clé est `loadPath` : il détermine où chercher les fichiers de traduction. `{{lng}}` est remplacé par le code langue (`en`, `fr`) et `{{ns}}` par le namespace (voir ci-dessous).

---

### Structure des fichiers de traduction

Les fichiers sont dans `public/locales/` et sont servis statiquement par Vite.

```
public/
└── locales/
    ├── en/
    │   ├── translation.json   ← namespace par défaut
    │   ├── home.json
    │   ├── auth.json
    │   └── admin.json
    └── fr/
        ├── translation.json
        ├── home.json
        ├── auth.json
        └── admin.json
```

Chaque fichier correspond à un **namespace** — un regroupement logique de clés de traduction.

#### Exemple — `public/locales/fr/home.json`

```json
{
  "hero": {
    "title": "Protégez votre entreprise",
    "subtitle": "Des solutions de cybersécurité pour les PME",
    "cta": "Voir nos offres"
  },
  "features": {
    "edr": "Détection des menaces en temps réel",
    "soc": "Centre opérationnel de sécurité managé",
    "zero_trust": "Accès zéro confiance"
  }
}
```

#### Exemple — `public/locales/en/home.json`

```json
{
  "hero": {
    "title": "Protect your business",
    "subtitle": "Cybersecurity solutions for SMEs",
    "cta": "View our offers"
  },
  "features": {
    "edr": "Real-time threat detection",
    "soc": "Managed security operations center",
    "zero_trust": "Zero trust access"
  }
}
```

---

### Utiliser un namespace dans un composant

Par défaut, `useTranslation()` charge le namespace `translation`. Pour utiliser un namespace personnalisé, le passer en argument :

```jsx
import { useTranslation } from "react-i18next"

export function HomePage() {
  // Charge /locales/{lang}/home.json
  const { t } = useTranslation("home")

  return (
    <section>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle")}</p>
      <a href="/catalog">{t("hero.cta")}</a>
    </section>
  )
}
```

Pour utiliser plusieurs namespaces dans un même composant :

```jsx
const { t: tHome } = useTranslation("home")
const { t: tAuth } = useTranslation("auth")

return (
  <div>
    <h1>{tHome("hero.title")}</h1>
    <button>{tAuth("login.submit")}</button>
  </div>
)
```

---

### Précharger un namespace (optionnel)

Par défaut, les namespaces sont chargés à la demande (lazy). Pour précharger un namespace dès le démarrage, l'ajouter à `ns` dans la config :

```js
i18n.init({
  // ...
  ns: ["translation", "home", "auth"],   // préchargés au démarrage
  defaultNS: "translation",
})
```

Sans cette option, le namespace est chargé la première fois qu'un composant l'utilise — un bref état de chargement peut apparaître. Entourer avec `<Suspense>` pour le gérer proprement :

```jsx
import { Suspense } from "react"

<Suspense fallback={<Loading />}>
  <HomePage />
</Suspense>
```

---

### Interpolation et pluralisation

#### Variables

```json
{ "welcome": "Bonjour, {{name}} !" }
```

```jsx
t("welcome", { name: "Alice" })   // → "Bonjour, Alice !"
```

#### Pluralisation

```json
{
  "product_one": "{{count}} produit",
  "product_other": "{{count}} produits"
}
```

```jsx
t("product", { count: 1 })   // → "1 produit"
t("product", { count: 5 })   // → "5 produits"
```

---

### Changer la langue manuellement

```jsx
import { useTranslation } from "react-i18next"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div>
      <button onClick={() => i18n.changeLanguage("fr")}>Français</button>
      <button onClick={() => i18n.changeLanguage("en")}>English</button>
    </div>
  )
}
```

La langue choisie est mémorisée automatiquement par `i18next-browser-languagedetector` dans `localStorage`.

---

### Conventions du projet

- Un fichier JSON par page ou domaine fonctionnel (`home.json`, `auth.json`, `admin.json`, `catalog.json`…)
- Le namespace `translation.json` est réservé aux clés globales (navigation, footer, messages d'erreur génériques)
- Les clés sont en `snake_case`, organisées en objets imbriqués par section
- Chaque clé doit exister dans **toutes** les langues — une clé manquante affiche la clé brute à l'écran
- Ne jamais mettre de HTML dans les valeurs JSON — utiliser le composant `Trans` pour les cas complexes :

```jsx
import { Trans } from "react-i18next"

// fr/auth.json : { "terms": "J'accepte les <1>conditions d'utilisation</1>" }
<Trans i18nKey="terms" ns="auth">
  J'accepte les <a href="/terms">conditions d'utilisation</a>
</Trans>
```