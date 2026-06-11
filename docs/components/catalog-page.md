# Documentation - Page Catalogue par Catégorie

Ce document détaille l'implémentation de la page Catalogue (`/catalog/category/:slug`), qui permet de naviguer dans les produits d'une catégorie spécifique. 

Contrairement à la page "Recherche" qui est orientée requête globale, cette page est orientée "Découverte" (Browse) avec une mise en avant visuelle (Bannière) et un tri métier strict.

---

## 📌 1. Routage et Navigation

* **Route Frontend :** `/catalog/category/:slug`
* **Point d'entrée :** Accessible principalement depuis la page d'accueil via le composant `CategoryGrid` (qui utilise désormais le `slug` de la catégorie au lieu d'un paramètre d'URL `?category=id`).

---

## 🏗️ 2. Architecture UI et Refactoring (Principe DRY)

Afin d'éviter la duplication massive de code entre la page de recherche (`search.jsx`) et la page catalogue (`catalog.jsx`), l'interface a été refactorisée par composition.

### Le dossier `components/search/filter/`
L'ancien "God Component" de la barre latérale a été découpé selon le principe de responsabilité unique, et exporté via un fichier `index.js` (Barrel pattern) :
* `filter-content.jsx` : Contient la logique des inputs (Recherche, Budget, Switch dispo).
* `filter-sidebar.jsx` : Le wrapper Desktop.
* `filter-drawer.jsx` : Le wrapper Mobile (Sheet).
* `filter-skeleton.jsx` : L'état de chargement.

**Propriété clé `hideCategories` :**
Pour réutiliser ce panneau sur la page catalogue sans afficher les cases à cocher des catégories (puisqu'on se trouve déjà dans une catégorie), les wrappers acceptent une prop booléenne `hideCategories={true}` qui masque dynamiquement cette section.

### Les composants partagés et spécifiques
* **`ProductGridResults` :** Composant mutualisé affichant la grille de cartes produits (`ProductCard`), les squelettes de chargement, l'état vide ("Aucun résultat") et la pagination.
* **`CategoryHeader` :** Composant spécifique à la page catalogue affichant la bannière immersive (Image en plein écran, Titre et Description).

---

## ⚙️ 3. Logique Métier et Tri (Data Fetching)

La page s'appuie sur la méthode `getCategoryCatalog(slug, params)` depuis `api/products.js`.

### Comportement des filtres
Bien que la sélection de catégorie soit bloquée, les filtres textuels (`q`), de budget (`maxPrice`) et de disponibilité (`available`) s'appliquent localement **à l'intérieur de la catégorie**.

### Algorithme de tri strict (`catalog_priority`)
Contrairement à la recherche globale où l'utilisateur choisit son tri (Prix, Pertinence, etc.), la page catalogue impose un tri "marketing" défini par le back-office. 

L'ordre de priorité (implémenté dans le Mock MSW et à reproduire côté Back-End) est le suivant :
1. **Disponibilité :** Les produits actifs remontent en premier. Les produits épuisés (`Inactive`, `Archived`) sont systématiquement relégués en fin de liste. (Les cartes épuisées sont visuellement grisées via une opacité CSS sur la `ProductCard`).
2. **Priorité Admin :** Les produits marqués comme `isFeatured` passent avant les autres.
3. **Ordre d'affichage :** Tri ascendant sur la propriété `displayOrder`.
4. **Fallback :** Tri ascendant sur l'`id` (ordre de création).

