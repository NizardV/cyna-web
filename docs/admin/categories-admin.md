# Admin — CRUD Catégories

Page : `src/pages/admin/categories.jsx`  
Route : `/admin/categories`

---

## Rôle

Interface back-office pour gérer les catégories de produits : création, édition en ligne, suppression, recherche, tri et pagination. Tout se passe dans une seule page (pas de route dédiée création/édition — dialog modal inline).

---

## Fonctionnalités

- Listing tabulaire paginé (5 par page)
- Recherche textuelle debouncée
- Tri par 3 colonnes : `displayOrder`, `name`, `productCount` (asc/desc)
- Création via dialog modal
- Édition via dialog modal (pré-remplissage)
- Suppression avec gestion erreur 409 (catégorie liée à des produits)
- Bilingue FR/EN — onglets de locale dans le formulaire

---

## Architecture composants

Tout est dans `categories.jsx` — pas de découpage en sous-composants séparés.

### Sous-composants internes

| Composant | Rôle |
|-----------|------|
| `SortIcon` | Flèche de tri (ArrowUp / ArrowDown / ArrowUpDown) |
| `TableRowSkeleton` | Skeleton d'une ligne pendant le chargement |

---

## State principal

```js
// Données
const [categories, setCategories] = useState([])
const [total, setTotal]           = useState(0)
const [loading, setLoading]       = useState(true)

// Recherche / tri / pagination
const [search,  setSearch]   = useState("")
const [sortBy,  setSortBy]   = useState("displayOrder")  // valeur API
const [page,    setPage]     = useState(1)
const PAGE_SIZE = 5

// Dialog
const [dialogOpen,  setDialogOpen]  = useState(false)
const [editTarget,  setEditTarget]  = useState(null)  // null = création, objet = édition
const [saving,      setSaving]      = useState(false)

// Formulaire (dans le dialog)
const [form, setForm] = useState(emptyForm())
// form = { slug, imageUrl, displayOrder, translations: { fr: {name, description}, en: {name, description} } }
const [locale, setLocale] = useState("fr")  // onglet FR/EN actif
```

---

## Paramètres API côté serveur

La recherche, le tri et la pagination sont **déportés côté serveur** (pas de filtrage front) :

```
GET /categories?q=&sortBy=displayOrder&page=1&pageSize=5
```

| Paramètre | Valeurs possibles |
|-----------|-------------------|
| `q` | string libre |
| `sortBy` | `displayOrder`, `displayOrder_desc`, `name`, `name_desc`, `productCount`, `productCount_desc` |
| `page` | entier |
| `pageSize` | entier |

---

## Tri par colonne

```js
const SORT_COLS = {
  displayOrder: { asc: "displayOrder", desc: "displayOrder_desc" },
  name:         { asc: "name",         desc: "name_desc" },
  productCount: { asc: "productCount", desc: "productCount_desc" },
}

function toggleSort(col, current) {
  const { asc, desc } = SORT_COLS[col]
  return current === asc ? desc : asc
}
```

Cliquer sur une colonne déjà active inverse le tri ; cliquer sur une autre colonne passe à `asc` par défaut.

---

## Formulaire (dialog)

### Champs

| Champ | Type | Description |
|-------|------|-------------|
| `slug` | string | Identifiant URL (ex: `edr-solutions`). Non modifiable en édition. |
| `imageUrl` | string (URL) | Image de la catégorie |
| `displayOrder` | number (nullable) | Position dans les listings |
| `translations.fr.name` | string | Nom FR |
| `translations.fr.description` | string | Description FR |
| `translations.en.name` | string | Nom EN |
| `translations.en.description` | string | Description EN |

### Locale tabs

Le formulaire affiche un onglet **FR 🇫🇷** et un onglet **EN 🇬🇧**. Changer d'onglet ne perd pas les données de l'autre locale.

### Pré-remplissage (édition)

```js
// src/api/categories.js
export function extractTranslationsFromDto(dto) {
  // Transforme le DTO API { translations: [{locale: "fr", name: "...", ...}] }
  // vers le format interne { fr: {name, description}, en: {name, description} }
}
```

---

## Flux CRUD

### Créer

```
Clic "+ Nouvelle catégorie"
    ↓
setEditTarget(null) + setForm(emptyForm()) + setDialogOpen(true)
    ↓
Remplissage FR + EN
    ↓
Clic "Créer"
    ↓
createCategory(buildTranslationsPayload(form))    → POST /categories
    ↓
Succès : toast + reload de la liste + fermeture dialog
Erreur 409 : toast "Ce slug est déjà utilisé"
```

### Éditer

```
Clic icône crayon sur une ligne
    ↓
setEditTarget(cat) + setForm(extractTranslationsFromDto(cat)) + setDialogOpen(true)
    ↓
Modification des champs
    ↓
Clic "Enregistrer"
    ↓
updateCategory(editTarget.id, buildTranslationsPayload(form))    → PUT /categories/:id
    ↓
Succès : toast + mise à jour locale dans setCategories + fermeture dialog
```

### Supprimer

```
Clic icône poubelle sur une ligne
    ↓
window.confirm("Supprimer cette catégorie ?")
    ↓
deleteCategory(cat.id)    → DELETE /categories/:id
    ↓
Succès (204)   : toast + retrait de la ligne
Erreur 409     : toast "Catégorie liée à des produits — suppression impossible"
Autre erreur   : toast générique
```

---

## Colonnes du tableau

| Colonne | Description |
|---------|-------------|
| Image | Miniature 36×36 ou `<ImageOff />` si absente |
| Nom | Nom dans la locale courante + nb de produits (Badge) |
| Description | Description tronquée (hidden sur mobile) |
| Ordre d'affichage | `displayOrder` ou — |
| Actions | Boutons Éditer (crayon) + Supprimer (poubelle) |

---

## Pagination

Gérée via le composant `Pagination` de shadcn/ui avec l'utilitaire `buildPageRange()` (`src/lib/utils.js`).

```
totalPages = Math.ceil(total / PAGE_SIZE)
```

Changer de page déclenche `fetchCategories()` avec le nouveau `page`.

---

## API functions (`src/api/categories.js`)

```js
searchCategories({ q, sortBy, page, pageSize })  → GET /categories
createCategory(payload)                           → POST /categories
updateCategory(id, payload)                       → PUT /categories/:id
deleteCategory(id)                                → DELETE /categories/:id
buildTranslationsPayload(form)                    → construit le DTO depuis l'état du formulaire
extractTranslationsFromDto(dto)                   → inverse : DTO → état formulaire
```

---

## i18n

Namespace : `admin` (clés `categories.*`)

| Clé | Texte FR |
|-----|----------|
| `categories.title` | Catégories |
| `categories.new` | Nouvelle catégorie |
| `categories.searchPlaceholder` | Rechercher une catégorie… |
| `categories.deleteConfirm` | Supprimer cette catégorie ? |
| `categories.deleteSuccess` | Catégorie supprimée |
| `categories.deleteErrorReferenced` | Cette catégorie est liée à des produits existants |
| `categories.form.slugLabel` | Slug (identifiant URL) |
| `categories.form.imageLabel` | URL de l'image |
| `categories.form.orderLabel` | Ordre d'affichage |
| `categories.form.nameLabel` | Nom |
| `categories.form.descLabel` | Description |
| `categories.form.create` | Créer |
| `categories.form.save` | Enregistrer |
