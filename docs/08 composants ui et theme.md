# Composants UI et thème

## Vue d'ensemble

```
src/components/
    ├── ui/              ← Composants shadcn/ui (Radix UI + Tailwind)
    │                       Button, Card, Input, Dialog, Badge,
    │                       Select, Combobox, Carousel, DatePicker,
    │                       InputOtp, Pagination, Skeleton, Sonner…
    │
    ├── layout/          ← Structure globale de la page
    │   ├── layout.jsx      Enveloppe principale (Header + outlet + Footer)
    │   ├── header.jsx      Barre de navigation
    │   ├── footer.jsx      Pied de page
    │   ├── lang-switcher.jsx  Sélecteur de langue FR/EN/AR/HE
    │   └── search.jsx      Barre de recherche
    │
    ├── auth/            ← Composants partagés des pages auth
    │   ├── auth-card.jsx      Carte blanche centrée (icon + title + subtitle + footer)
    │   ├── otp-input.jsx      6 cases OTP (wraps input-otp)
    │   └── password-strength.jsx  Indicateur de force du mot de passe
    │
    ├── home/            ← Page d'accueil
    │   ├── home-carousel.jsx   Carrousel hero (Embla)
    │   ├── category-grid.jsx   Grille des catégories
    │   └── featured-products.jsx  Produits mis en avant
    │
    ├── product/         ← Fiche produit
    │   ├── product-gallery.jsx       Galerie images (Embla Carousel)
    │   ├── product-info.jsx          Titre, description, specs, billing tabs
    │   ├── product-pricing.jsx       Compteurs, total, boutons action
    │   └── pricing-tiers-table.jsx   Tableau paliers tarif
    │
    ├── cart/            ← Panier
    │   ├── cart-row.jsx       Ligne de panier (produit + quantités + prix)
    │   ├── cart-summary.jsx   Récapitulatif total
    │   └── cart-skeleton.jsx  Skeleton de chargement
    │
    ├── search/          ← Catalogue / recherche
    │   ├── product-card.jsx     Carte produit
    │   ├── search-pagination.jsx Pagination
    │   └── filter/
    │       ├── filter-content.jsx  Contenu des filtres
    │       ├── filter-drawer.jsx   Filtres en drawer (mobile)
    │       ├── filter-sidebar.jsx  Filtres en sidebar (desktop)
    │       └── filter-skeleton.jsx Skeleton
    │
    ├── account/         ← Espace utilisateur
    │   ├── account-nav.jsx     Navigation tabs (Orders / Profile)
    │   ├── order.jsx           Groupe de commandes par année
    │   ├── subscription.jsx    Ligne d'abonnement
    │   └── year-combobox.jsx   Filtre par année
    │
    └── admin/
        ├── product/     ← Formulaire produit admin
        │   ├── card.jsx          Carte produit (liste)
        │   ├── form-general.jsx  Onglet général
        │   ├── form-media.jsx    Onglet médias
        │   ├── form-pricing.jsx  Onglet tarification
        │   ├── form-specs.jsx    Onglet specs techniques
        │   └── table.jsx         Tableau liste produits
        └── user/        ← Gestion utilisateurs admin
            ├── user-table.jsx         Tableau utilisateurs
            ├── user-toolbar.jsx       Barre de recherche + filtre rôle
            ├── role-combobox.jsx      Select rôle inline
            ├── status-confirm-dialog.jsx Dialog confirmation activation/désactivation
            ├── status-indicators.jsx  Badge statut (actif / désactivé)
            └── user-avatar.jsx        Avatar initiales
```

---

## shadcn/ui — règles d'utilisation

Les composants shadcn/ui sont dans `src/components/ui/`. Ils sont possédés dans le projet (pas de package importé) et stylisés via les variables CSS Tailwind.

### Ajouter un composant

```bash
npx shadcn@latest add <composant>
# ex: npx shadcn@latest add tooltip
```

### Ne jamais surcharger via CSS externe

```jsx
// ✅ Surcharge via className (Tailwind Merge résout les conflits)
<Button className="w-full mt-4">Valider</Button>

// ✅ Variantes via variant prop
<Badge variant="outline">Rupture de stock</Badge>
<Button variant="destructive">Supprimer</Button>

// ❌ Style inline
<Button style={{ backgroundColor: "#562BF5" }}>
```

---

## Composants auth partagés

### `AuthCard`

Carte centrée réutilisable sur toutes les pages d'authentification.

```jsx
<AuthCard
  icon={<ShieldCheck className="text-primary" />}
  title={t("title")}
  subtitle={t("subtitle")}
  footer={<Link to="/login">{t("backToLogin")}</Link>}
>
  {/* Formulaire */}
</AuthCard>
```

Props :

| Prop | Type | Description |
|------|------|-------------|
| `icon` | ReactNode | Icône affichée en haut de la carte |
| `title` | string | Titre principal |
| `subtitle` | string | Sous-titre ou description |
| `footer` | ReactNode | Contenu du pied de carte (liens, notes) |
| `children` | ReactNode | Corps du formulaire |

### `OtpInput`

6 cases pour la saisie d'un code OTP ou TOTP. Wraps le composant `input-otp`.

```jsx
<OtpInput
  value={otp}
  onChange={setOtp}
  label={t("codeLabel")}
/>
// Render : [ _ ][ _ ][ _ ]  [ _ ][ _ ][ _ ]
// Divisé en 2 groupes de 3
```

Props :

| Prop | Type | Description |
|------|------|-------------|
| `value` | string | Valeur courante (6 chiffres) |
| `onChange` | (val: string) => void | Callback de changement |
| `label` | string | Label affiché au-dessus |

### `PasswordStrength`

Indicateur de force du mot de passe — affiche les règles avec coche/croix en temps réel.

```jsx
<PasswordStrength password={formData.password} />
```

Les règles vérifiées : longueur ≥ 8, majuscule, chiffre, caractère spécial.

---

## Composants produit

### `ProductGallery`

Carrousel d'images avec vignettes et navigation manuel.

```jsx
<ProductGallery images={product.images} mainImage={product.imageUrl} />
```

### `PricingTiersTable`

Tableau des paliers tarifaires avec surlignage de la tranche active.

```jsx
<PricingTiersTable
  plan={currentPlan}          // PricingPlanDto
  quantityUsers={quantityUsers}
  quantityDevices={quantityDevices}
/>
```

### `ProductPricing`

Bloc de commande : compteurs +/-, prix calculé, boutons action.

```jsx
<ProductPricing
  plan={currentPlan}
  quantityUsers={quantityUsers}
  quantityDevices={quantityDevices}
  onChangeUsers={setQuantityUsers}
  onChangeDevices={setQuantityDevices}
  onAddToCart={handleAddToCart}
  isQuoteRequired={isQuoteRequired}
  totalPrice={totalPrice}
/>
```

---

## Layout — props de contrôle

`Layout` accepte des props booléennes pour masquer des sections selon le contexte de la page :

```jsx
// Page d'authentification — interface épurée
<Layout hideSearch hideNav hideUserSection>
  {children}
</Layout>

// Page standard — tout visible
<Layout>
  {children}
</Layout>
```

| Prop | Effet |
|------|-------|
| `hideSearch` | Masque la barre de recherche dans le header |
| `hideNav` | Masque la navigation principale |
| `hideUserSection` | Masque le menu utilisateur (avatar, déconnexion) |

---

## Utilitaires CSS

### `cn()` — fusion de classes Tailwind

```js
// src/lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

Utilisation :

```jsx
// Classes conditionnelles + résolution des conflits Tailwind
<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

### `formatPrice()` — format monétaire FR

```js
formatPrice(12.5)   // → "12,50 €"
formatPrice(1074.6) // → "1 074,60 €"
```

### `formatDate()` — date lisible

```js
formatDate("2025-06-01T00:00:00Z")  // → "1 juin 2025"
```

### `getStatusBadge()` — statut produit vers Badge

```js
getStatusBadge("available")   // → { variant: "default",     labelKey: "product.available" }
getStatusBadge("out_of_stock")// → { variant: "outline",     labelKey: "product.outOfStock" }
getStatusBadge("unavailable") // → { variant: "destructive", labelKey: "product.unavailable" }
```

---

## Toaster (Sonner)

Les notifications toast sont gérées via Sonner, initialisé dans `main.tsx` :

```jsx
// main.tsx
<Toaster />   // un seul Toaster pour toute l'app
```

Usage dans les composants :

```jsx
import { toast } from "sonner"

toast.success("Catégorie créée")
toast.error("Slug déjà utilisé")
toast("Information neutre")
toast.loading("Chargement…")   // remplacé par dismiss()
```

---

## Skeleton de chargement

Chaque section qui charge des données affiche un skeleton plutôt qu'un spinner. Exemples :

```jsx
// Tableau produits admin — 5 lignes skeleton
{loading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}

// Liste des produits du catalogue
{loading && <FilterSkeleton />}

// Panier
{loading && <CartSkeleton />}
```