# Admin — Gestion des utilisateurs

Page : `src/pages/admin/users.jsx`  
Route : `/admin/users`

---

## Rôle

Interface back-office pour consulter et gérer les comptes utilisateurs : recherche, filtre par rôle, changement de rôle, activation/désactivation de compte.

Contrairement aux catégories, le **filtrage est front-only** (tous les utilisateurs sont chargés en une seule fois).

---

## Architecture

```
AdminUsers (pages/admin/users.jsx)
├── UserToolbar (components/admin/user/user-toolbar)
│   └── Input recherche + Select rôle
├── UserAdminTable (components/admin/user/user-table)
│   └── Tableau des utilisateurs paginés
├── UserStatusConfirmDialog (components/admin/user/status-confirm-dialog)
│   └── Dialog confirmation désactivation/activation
└── Pagination (shadcn/ui)
```

---

## State

```js
const [users,   setUsers]   = useState([])    // tous les utilisateurs (chargés une fois)
const [loading, setLoading] = useState(true)
const [error,   setError]   = useState(false)

const [search,     setSearch]     = useState("")
const [roleFilter, setRoleFilter] = useState("all")
const [page,       setPage]       = useState(1)

const [statusTarget, setStatusTarget] = useState(null)   // user visé par confirm dialog
const [statusSaving, setStatusSaving] = useState(false)
const [roleSavingId, setRoleSavingId] = useState(null)   // spinner inline sur Select rôle
```

---

## Filtrage (front-only)

```js
const filtered = users.filter((u) => {
  const matchesSearch = !q || [u.firstName, u.lastName, u.email]
    .filter(Boolean).join(" ").toLowerCase().includes(q)
  const matchesRole = roleFilter === "all" || u.role === roleFilter
  return matchesSearch && matchesRole
})
```

La recherche est debouncée 400ms via `useDebounce`. Changer de filtre réinitialise la page à 1.

Taille de page : **8 utilisateurs**.

---

## Rôles disponibles

Définis dans `src/api/admin-users.js` via `USER_ROLES` :

| Valeur | Label FR |
|--------|----------|
| `User` | Utilisateur |
| `Administrateur` | Administrateur |
| `Super Administrateur` | Super Administrateur |

Les options sont localisées via `t("roles.{value}")`.

---

## Actions

### Changer le rôle

```
Select inline dans la ligne → handleRoleChange(user, newRole)
    ↓
changeUserRole(user.id, newRole)    → PUT /admin/users/:id/role
    ↓
Succès : mise à jour locale du user dans setUsers
Erreur : toast erreur
```

Un spinner (`roleSavingId`) s'affiche sur la ligne concernée pendant l'appel.

### Activer / Désactiver un compte

```
Clic toggle (switch ou bouton) → setStatusTarget(user) → ouvre dialog de confirmation
    ↓
Confirmation → handleStatusConfirm()
    ├── isDisabled → enableUser(id)     → PUT /admin/users/:id/enable
    └── actif      → disableUser(id)    → PUT /admin/users/:id/disable
    ↓
Succès : mise à jour locale + toast
```

Le dialog `UserStatusConfirmDialog` affiche le nom de l'utilisateur et demande confirmation avant toute action irréversible.

---

## API functions (`src/api/admin-users.js`)

```js
getAdminUsers()                     → GET /admin/users
disableUser(id)                     → PUT /admin/users/:id/disable
enableUser(id)                      → PUT /admin/users/:id/enable
changeUserRole(id, role)            → PUT /admin/users/:id/role
```

---

## i18n

Namespace : `admin-users`

| Clé | Texte FR |
|-----|----------|
| `title` | Utilisateurs |
| `filter.allRoles` | Tous les rôles |
| `roles.User` | Utilisateur |
| `roles.Administrateur` | Administrateur |
| `roles.Super Administrateur` | Super Administrateur |
| `table.name` | Nom |
| `table.email` | E-mail |
| `table.role` | Rôle |
| `table.status` | Statut |
| `table.actions` | Actions |
| `status.active` | Actif |
| `status.disabled` | Désactivé |
| `confirmDisable.title` | Désactiver ce compte ? |
| `confirmDisable.description` | L'utilisateur ne pourra plus se connecter. |
| `confirmEnable.title` | Réactiver ce compte ? |
| `roleSuccess` | Rôle mis à jour |
| `roleError` | Erreur lors du changement de rôle |
| `statusSuccess` | Statut mis à jour |
| `statusError` | Erreur lors du changement de statut |
