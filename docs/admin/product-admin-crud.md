# Documentation — Interface Admin CRUD Produits

Guide complet de l'interface back-office pour gérer les produits : création, édition, suppression.

---

## 🎯 Objectif

Fournir aux administrateurs une interface intuitive et multilingue pour gérer le catalogue de produits Cyna, y compris :
- Listing avec recherche, filtrage par statut, tri par vedettes
- Création de produits avec plans tarifaires complexes
- Édition bilingue (FR/EN)
- Suppression avec gestion intelligente des protections referential

---

## 📍 Routes Front

| Route | Composant | Rôle |
|-------|-----------|------|
| `/admin/products` | `pages/admin/product/products.jsx` | Listing + suppression |
| `/admin/products/new` | `pages/admin/product/product-form.jsx` | Création |
| `/admin/products/:id/edit` | `pages/admin/product/product-form.jsx` | Édition |

---

## 📦 Architecture Composants

### Pages

#### `pages/admin/product/products.jsx`

**Rôle** : Listing paginé, filtrage, suppression

**State** :
```javascript
const [products, setProducts] = useState([])        // Tous les produits
const [loading, setLoading] = useState(true)
const [search, setSearch] = useState("")            // Recherche texte
const [statusFilter, setStatusFilter] = useState([])  // Filtre status (multi-select)
const [featuredSort, setFeaturedSort] = useState(null)  // Tri (yes/no/null)
const [page, setPage] = useState(1)                 // Pagination (5 par page)
```

**Flux de données** :
```
useEffect() → getProducts() → setProducts(Array) → Affichage

Utilisateur clique "Supprimer"
    ↓
window.confirm(t("products.deleteConfirm"))
    ↓
deleteProduct(id) ← API POST/DELETE
    ↓
Succès : setProducts(prev ⇒ filter out), toast success
Erreur 409 : toast spécifique "produit lié à commandes"
Erreur autre : toast erreur générique
```

**Filtrage intelligent** :
```javascript
const filtered = products
  .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
  .filter(p => statusFilter.length === 0 || statusFilter.includes(p.status))

// Tri vedettes (sans mutation) :
const sorted = featuredSort
  ? [...filtered].sort((a, b) => 
      featuredSort === "yes"
        ? (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        : (a.isFeatured ? 1 : 0) - (b.isFeatured ? 1 : 0)
    )
  : filtered

// Pagination
const paginated = sorted.slice((page - 1) * 5, page * 5)
```

**Gestion erreur 409** :
```javascript
const handleDelete = async (id) => {
  if (!window.confirm(t("products.deleteConfirm"))) return
  try {
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success(t("products.deleteSuccess"))
  } catch (err) {
    if (err?.status === 409) {
      // Produit lié à commandes/abonnements
      toast.error(t("products.deleteErrorReferenced"), { duration: 6000 })
    } else {
      toast.error(t("products.deleteError"))
    }
  }
}
```

#### `pages/admin/product/product-form.jsx`

**Rôle** : Formulaire création/édition multilingue avec plans tarifaires

**State** :
```javascript
const [formData, setFormData] = useState({
  nameFr: "", nameEn: "",
  descriptionFr: "", descriptionEn: "",
  status: "Available",
  categoryId: null,
  imageUrl: "",
  isFeatured: false,
  displayOrder: null,
  technicalSpecs: [],
  pricingPlans: [
    { name: "", billingPeriod: "monthly", pricingTiers: [...], ... }
  ]
})
const [locale, setLocale] = useState("fr")  // Onglet FR/EN
const [loading, setLoading] = useState(false)
const [submitting, setSubmitting] = useState(false)
```

**Flux édition** :
```
URL /admin/products/123/edit
    ↓
useEffect + useParams
    ↓
getProductAdmin(123)  [← GET /products/123/admin bilingue]
    ↓
setFormData(productAdminDto)  [FR ET EN pré-remplies]
    ↓
Affichage tabs FR/EN
```

**Flux création** :
```
URL /admin/products/new
    ↓
formData pré-rempli vide
    ↓
POST /products
    ↓
201 + slug généré automatiquement
    ↓
Redirection édition OU confirmation création
```

**Flux sauvegarde** :
```
Clique "Créer le produit" / "Mettre à jour"
    ↓
Validation côté front (nom requis, URL valide, etc.)
    ↓
POST (création) / PUT (édition) /products/:id
    ↓
Succès : toast + redirection
Erreur 400 : toast validation
Erreur 409 : toast plan suppression impossible
Erreur 500 : toast erreur serveur
```

### Composants métier

#### `components/admin/product/form-general.jsx`

**Onglet** : Infos générales (nom, description, status)

**Props** :
```javascript
{
  locale,                              // "fr" | "en"
  formData,
  onFormChange,
  categories,
  categoriesLoading,
  error                                // message erreur validation
}
```

**Contenu** :
- Select locale (FR 🇫🇷 / EN 🇬🇧)
- Input `name[locale]` (maxLength 200, required)
- Textarea `description[locale]`
- Select `status` → STATUS_VALUES = ["Available", "Unavailable", "OutOfStock", "Preview"]
- Select `categoryId` (récupérée depuis API GET /categories)

**Status mapping i18n** :
```javascript
const STATUS_VALUES = ["Available", "Unavailable", "OutOfStock", "Preview"]

// Dans i18n (admin.json) :
"status": {
  "available": "Disponible",
  "unavailable": "Indisponible",
  "outofstock": "Rupture de stock",
  "preview": "Aperçu"
}

// Affichage :
<option value="Available">
  {t(`admin:status.${STATUS_VALUES[0].toLowerCase()}`)}
</option>
```

#### `components/admin/product/form-media.jsx`

**Onglet** : Média & catégorie

**Props** :
```javascript
{ imageUrl, onImageUrlChange, isFeatured, onFeaturedChange, displayOrder, onDisplayOrderChange }
```

**Contenu** :
- Input URL image (validation regex `^https?://`)
- Preview image (img tag ou placeholder)
- Checkbox "Mettre en avant sur la page d'accueil"
- Input `displayOrder` (nombre, nullable)
- Help text : "Position dans la section Top Produits (1 = premier)"

#### `components/admin/product/form-specs.jsx`

**Onglet** : Spécifications techniques

**Props** :
```javascript
{ technicalSpecs, onSpecsChange }
```

**Contenu** :
- Liste des specs (badges removable)
- Input nouveau spec (enter pour ajouter)
- Help text : "Appuyez sur Entrée pour ajouter une spécification"

**Logic** :
```javascript
const handleAddSpec = (spec) => {
  if (spec.trim()) {
    onSpecsChange([...technicalSpecs, spec.trim()])
  }
}

const handleRemoveSpec = (index) => {
  onSpecsChange(technicalSpecs.filter((_, i) => i !== index))
}
```

#### `components/admin/product/form-pricing.jsx`

**Onglet** : Plans tarifaires avec paliers

**Props** :
```javascript
{ pricingPlans, onPlansChange }
```

**Contenu par plan** :
- Input `name` (ex: "Mensuel")
- Select `billingPeriod` → ["monthly", "yearly", "lifetime"]
- Input `discountPercent`
- Input `maxUsersCheckout` / `maxDevicesCheckout`
- Tableau paliers (`UnitType | MinQty | MaxQty | UnitPrice`)
- Bouton "Ajouter un palier"
- Bouton "Supprimer ce plan"
- Validation : max > min

**Validation tiers** :
```javascript
errors.incomplete    // palier sans tous les champs
errors.invalidMax    // max ≤ min ou max ≤ min du palier précédent
```

#### `components/admin/product/table.jsx`

**Rôle** : Tableau listing ligne par ligne

**Props** :
```javascript
{
  loading,
  products,              // ProductAdminListItemDto[]
  onDelete,              // (id) => void
  statusFilter,          // string[]
  onStatusFilter,        // (values) => void
  featuredSort,          // "yes" | "no" | null
  onFeaturedSort         // (value) => void
}
```

**Colonnes** :
- Nom produit + ID
- Status (badge avec variant selon STATUS_VARIANT)
- Vedettes (⭐ oui/non)
- Actions (Éditer, Supprimer)

**STATUS_VARIANT** :
```javascript
const STATUS_VARIANT = {
  "Available": "default",       // vert
  "Unavailable": "outline",     // gris
  "OutOfStock": "destructive",  // rouge
  "Preview": "secondary"        // bleu
}
```

---

## 🔗 Intégration API

### Client (src/api/client.js)

**Configuration** :
```javascript
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api"
const MOCK_ENABLED = import.meta.env.VITE_MOCK_API === "true"

// Mock peut être surcharger per-request
apiClient.get(path, { params, mock: true })   // Force mock
apiClient.get(path, { params, mock: false })  // Force réel
```

**Méthodes** :
```javascript
apiClient.get(path, { params, mock })
apiClient.post(path, body, { params, mock })
apiClient.put(path, body, { params, mock })
apiClient.delete(path, { params, mock })
```

### Endpoints (src/api/products.js)

```javascript
export const getProducts = () =>
  apiClient.get("/products")

export const getProductAdmin = (id) =>
  apiClient.get("/products/:id/admin", { params: { id } })

export const createProduct = (data) =>
  apiClient.post("/products", data)

export const updateProduct = (id, data) =>
  apiClient.put("/products/:id", data, { params: { id } })

export const deleteProduct = (id) =>
  apiClient.delete("/products/:id", { params: { id } })

export const getCategories = (locale = "fr") =>
  apiClient.get("/categories", { params: { locale } })
```

### Gestion erreurs API

Les erreurs de l'API (`ApiClient.get/post/put/delete`) lancent une exception `ApiError` contenant `.status` :

```javascript
try {
  await deleteProduct(id)
} catch (err) {
  // err.status === 409 → produit référencé
  // err.status === 404 → produit inexistant
  // err.status === 400 → validation échouée
  // err.message → message d'erreur serveur
}
```

---

## 🎨 Mocks (Mode VITE_MOCK_API=true)

### handlers/products.js

```javascript
{
  method: "GET",
  path: "/products",
  resolver: () => _products
}

{
  method: "GET",
  path: "/products/:id/admin",
  resolver: ({ params }) => {
    const product = _products.find(p => String(p.id) === String(params.id))
    return product ?? throw new Error("Product not found")
  }
}

{
  method: "POST",
  path: "/products",
  resolver: ({ body }) => {
    const newProduct = makeProduct({ ...body })
    _products.push(newProduct)
    return newProduct
  },
  status: 201
}

{
  method: "PUT",
  path: "/products/:id",
  resolver: ({ params, body }) => {
    const index = _products.findIndex(p => String(p.id) === String(params.id))
    Object.assign(_products[index], body)
    return _products[index]
  }
}

{
  method: "DELETE",
  path: "/products/:id",
  resolver: ({ params }) => {
    const index = _products.findIndex(p => String(p.id) === String(params.id))
    if (index !== -1) _products.splice(index, 1)
    return null
  },
  status: 204
}
```

### factories/factories.js

```javascript
export function makeProduct(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 9999 }),
    name: `${prefix} ${suffix}`,
    status: faker.helpers.weightedArrayElement([
      { weight: 6, value: "Available" },
      { weight: 2, value: "Unavailable" },
      { weight: 1, value: "OutOfStock" },
    ]),
    pricingPlans: [planMonthly, planYearly, ...],
    technicalSpecs: ["Spec 1", "Spec 2", ...],
    ...overrides,
  }
}
```

---

## 🌍 Internationalization (i18n)

### Structure admin.json

```json
{
  "products": {
    "title": "Produits",
    "total": "{{count}} produit au total",
    "total_plural": "{{count}} produits au total",
    "new": "Nouveau produit",
    "searchPlaceholder": "Rechercher un produit…",
    "deleteConfirm": "Supprimer ce produit définitivement ?",
    "deleteSuccess": "Produit supprimé",
    "deleteError": "Erreur lors de la suppression",
    "deleteErrorReferenced": "Ce produit ne peut pas être supprimé car il est lié à des commandes ou abonnements existants."
  },
  "status": {
    "available": "Disponible",
    "unavailable": "Indisponible",
    "outofstock": "Rupture de stock",
    "preview": "Aperçu"
  },
  "featured": {
    "yes": "⭐ Oui",
    "no": "Non"
  },
  "table": {
    "product": "Produit",
    "status": "Statut",
    "featured": "Mis en avant",
    "actions": "Actions"
  },
  "form": {
    "editTitle": "Modifier le produit",
    "newTitle": "Nouveau produit",
    "update": "Mettre à jour",
    "create": "Créer le produit",
    "errors": {
      "nameRequired": "Le nom du produit est requis",
      "notFound": "Produit introuvable",
      "saveFailed": "Erreur lors de la sauvegarde",
      "categoriesFailed": "Impossible de charger les catégories"
    },
    "success": {
      "updated": "Produit mis à jour",
      "created": "Produit créé"
    }
  },
  "general": { ... },
  "media": { ... },
  "specs": { ... },
  "pricing": { ... }
}
```

### Utilisation

```javascript
import { useTranslation } from "react-i18next"

const { t } = useTranslation("admin")

// Avec interpolation
<p>{t("products.total", { count: 42 })}</p>

// Enum status (minuscule pour clé)
<span>{t(`admin:status.${status.toLowerCase()}`)}</span>
```

---

## ⚙️ Configuration

### .env

```
# URL API — garder /api en dev : passe par le proxy Vite vers le backend .NET
VITE_API_URL=/api

# Activer mocks (défaut false)
VITE_MOCK_API=false

# Délai simulation réseau en mock (ms)
VITE_MOCK_DELAY=400
```

> Voir le [Guide d'installation](../00%20installation%20et%20demarrage.md#3-variables-denvironnement)
> pour le détail des variables et des deux modes (mock / backend réel).

### Basculer mode

**Dev avec mocks** :
```bash
VITE_MOCK_API=true npm run dev
```

**Dev avec API réelle** :
```bash
VITE_MOCK_API=false npm run dev
```

---

## 🚀 Flux Utilisateur Complets

### Créer un produit

```
1. Admin va /admin/products
2. Clique "Nouveau produit"
3. Remplit formulaire FR
   → Nom, Description, Status, Catégorie
4. Clique onglet EN
   → Idem en anglais
5. Onglet Médias
   → URL image, cocher vedettes, displayOrder
6. Onglet Spécifications
   → Ajoute specs techniques (enter)
7. Onglet Tarification
   → Ajoute plans (Monthly, Yearly...)
   → Pour chaque plan : paliers (user/device + prix)
8. Clique "Créer le produit"
   → POST /products
   → Slug généré : "cyna-edr-pro"
   → Toast succès "Produit créé"
   → Redirection édition auto
9. Voir le produit sur /product/cyna-edr-pro (public)
```

### Éditer un produit

```
1. Admin va /admin/products
2. Clique ligne produit
3. GET /products/:id/admin
   → Formulaire pré-rempli (FR ET EN)
4. Modifie nom, description, ajoute spec
5. Onglet Tarification
   → Change prix monthly
   → Supprime plan yearly (si aucune commande)
6. Clique "Mettre à jour"
   → PUT /products/:id
   → Toast succès
7. Retour liste automatique
```

### Supprimer un produit

```
1. Admin va /admin/products
2. Clique icône poubelle (ligne produit)
3. Confirmation : "Supprimer ce produit définitivement ?"
4. Clique OK
   → DELETE /products/:id
   
   Cas 1 : Succès (204)
     → Toast "Produit supprimé"
     → Produit disparaît de la liste
   
   Cas 2 : Produit lié à commande (409)
     → Toast SPÉCIFIQUE
       "Ce produit ne peut pas être supprimé
        car il est lié à des commandes
        ou abonnements existants."
     → Produit reste dans liste
   
   Cas 3 : Produit inexistant (404)
     → Toast "Erreur lors de la suppression"
```

---

## 🎯 Points Clés

### Bilingue
Formulaire complet FR/EN : chaque champ a une version pour chaque locale. Sauvegarde envoie les deux au serveur (ProductUpsertRequestDto).

### Plans tarifaires
Chaque plan peut avoir plusieurs paliers (tiers) par unitType (user/device). Un produit peut avoir Monthly/Yearly/Lifetime en parallèle.

### Gestion 409
Suppression d'un plan → vérifie s'il est lié à des commandes/abonnements. Si oui : 409 Conflict, message spécifique au front.

### Mock transparent
Via `VITE_MOCK_API`, basculer entre API réelle et mocks **sans changer le code** (mêmes endpoints, mêmes DTOs).

### Slug immutable
Après création, le slug ne change **jamais**, même si l'admin change le nom. Cela protège les URLs externes.

---

## 📌 Limitations & Évolutions

- **Images multiples** : actuellement une seule image (ProductImage.DisplayOrder à venir)
- **Tri visible** : slug sur /admin/products inaccessible (futur : ajouter colonne)
- **Bulk edit** : pas de multi-sélection (futur : multi-select + actions batch)
- **Historique** : pas de log création/modif (futur : audit trail)
- **Accès concurrence** : deux admins peuvent éditer le même produit simultanément (futur : optimistic locking ou timestamp)
