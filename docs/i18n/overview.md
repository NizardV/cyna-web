# Internationalisation (i18n)

Configuré avec **react-i18next**. Fichiers dans `public/locales/{lang}/{namespace}.json`.

Langues supportées : `fr` (défaut), `en`.

---

## Namespaces

| Namespace | Fichier | Utilisé dans |
|---|---|---|
| `product` | `product.json` | Pages produit, pricing, tiers |
| `cart` | `cart.json` | Page panier, CartRow, CartSummary |
| `catalog` | `catalog.json` | Page catalogue, ProductCard |
| `home` | `home.json` | Page accueil, FeaturedProducts |
| `auth` | `auth.json` | Login, Register |
| `checkout` | `checkout.json` | Page checkout |
| `order-confirmation` | `order-confirmation.json` | Page confirmation |
| `order-history` | `order-history.json` | Compte / historique |
| `profile` | `profile.json` | Compte / profil |
| `layout` | `layout.json` | Header, footer, navigation |
| `translation` | `translation.json` | Clés globales |
| `contact` | `contact.json` | Page contact |
| `cgu` | `cgu.json` | CGU |
| `mentions-legales` | `mentions-legales.json` | Mentions légales |
| `privacy` | `privacy.json` | Politique de confidentialité |

---

## Clés pricing — namespace `product`

```json
{
  "billing": {
    "monthly": "Mensuel",
    "yearly": "Annuel",
    "lifetime": "À vie"
  },
  "billingLabel": {
    "monthly": "mois",
    "yearly": "an",
    "lifetime": "paiement unique"
  },
  "users": "Utilisateurs",
  "devices": "Appareils",
  "tiersTitle": "Grille de tarification",
  "tiersUnitHeader": "Prix / unité",
  "requestQuote": "CONTACTER L'ÉQUIPE COMMERCIALE",
  "quoteInfo": "Au-delà des limites en ligne, contactez-nous pour un devis personnalisé.",
  "subscribeNow": "S'ABONNER MAINTENANT"
}
```

---

## Clés panier — namespace `cart`

```json
{
  "header": {
    "service": "Service",
    "licenses": "Licences"
  },
  "item": {
    "billing": {
      "monthly": "Mensuel",
      "yearly": "Annuel",
      "lifetime": "À vie"
    },
    "users": "Utilisateurs",
    "devices": "Appareils",
    "remove": "Supprimer"
  },
  "summary": {
    "title": "Récapitulatif",
    "subtotal": "Sous-total",
    "vat": "TVA (20%)",
    "total": "Total",
    "checkout": "Passer à la caisse"
  }
}
```

---

## Clés catalogue — namespace `catalog`

Clés pour l'affichage du prix de départ sur les fiches :

```json
{
  "product": {
    "from": "À partir de",
    "perMonth": "/ mois",
    "perYear": "/ an",
    "perLifetime": "paiement unique"
  }
}
```

---

## Usage dans les composants

```jsx
// Chargement d'un namespace spécifique
const { t } = useTranslation("product")

// Clé simple
t("users")  // → "Utilisateurs"

// Clé imbriquée
t("billing.monthly")  // → "Mensuel"

// Clé dynamique (billing period variable)
t(`billing.${billingPeriod}`)  // → "Mensuel" | "Annuel" | "À vie"

// Clé avec fallback
t("item.billing.monthly", { defaultValue: "monthly" })
```
