# Authentification — Connexion utilisateur

Page : `src/pages/login.jsx`  
Route : `/login`

---

## Rôle

Formulaire de connexion pour les **utilisateurs standard** (non-admin). Après un login réussi, l'utilisateur est redirigé vers `/`.

Un lien en pied de carte renvoie vers `/admin/login` pour les administrateurs.

---

## Composants utilisés

| Import | Rôle |
|--------|------|
| `useAuth()` | Expose `login()` (= `fetchMe`) et `setLoading` |
| `loginUser()` | `src/api/auth.js` → `POST /auth/login` |
| `Layout` | Enveloppe avec `hideSearch hideNav hideUserSection` |
| `Input`, `Label`, `Button`, `Spinner` | UI shadcn/ui |
| `useNavigate`, `Link` | React Router v6 |

---

## State

```js
const [formData, setFormData]       = useState({ email: "", password: "" })
const [loading, setLoadingState]    = useState(false)
const [error, setError]             = useState("")
const [rememberMe, setRememberMe]   = useState(false)  // UI uniquement, non envoyé
```

> `rememberMe` est affiché mais **pas encore transmis** au backend.

---

## Flux

```
Utilisateur remplit email + mot de passe
    ↓
handleSubmit()
    ├── Validation : champs non vides → sinon setError(t("login.fillAllFields"))
    ├── setLoadingState(true) + setLoading(true) [contexte global]
    ├── loginUser({ email, password })     → POST /auth/login
    │       Succès → login() [fetchMe → GET /auth/me] → navigate("/")
    │       Erreur → setError(message du serveur ou t("login.error"))
    └── finally → setLoadingState(false) + setLoading(false)
```

---

## Visuel

```
┌────────────────────────────────┐
│         🔒 (icône violet)      │
│                                │
│   Connexion à votre compte     │
│   Pas de compte ? S'inscrire   │
│                                │
│   Email ____________________   │
│   Mot de passe _____________   │
│                                │
│   ☐ Se souvenir  Mot de passe? │
│                                │
│   [  Se connecter  ]           │
│                                │
│   Accès administrateur ←       │  → /admin/login
└────────────────────────────────┘
```

---

## Lien vers la page admin

```jsx
<Link to="/admin/login" className="text-xs text-gray-400 hover:text-gray-600 underline">
  {t("auth-extra:adminLoginLink")}
</Link>
```

Ce lien utilise le namespace `auth-extra` (fichier `public/locales/{lang}/auth-extra.json`).

---

## i18n

Namespaces chargés : `["auth", "auth-extra"]`

| Clé | Texte FR |
|-----|----------|
| `login.title` | Connexion à votre compte |
| `login.subtitle` | Pas encore de compte ? |
| `login.subtitleLink` | S'inscrire |
| `login.email` | Adresse e-mail |
| `login.emailPlaceholder` | vous@exemple.fr |
| `login.password` | Mot de passe |
| `login.passwordPlaceholder` | ••••••• |
| `login.rememberMe` | Se souvenir de moi |
| `login.forgotPassword` | Mot de passe oublié ? |
| `login.submit` | Se connecter |
| `login.signingIn` | Connexion… |
| `login.fillAllFields` | Veuillez remplir tous les champs |
| `login.error` | Identifiants invalides |
| `auth-extra:adminLoginLink` | Accès administrateur |

---

## Mock

En mode `VITE_MOCK_API=true`, le handler `POST /auth/login` (`src/mocks/handlers/auth.js`) :

- Accepte n'importe quelle adresse email listée dans `_adminUsers` avec le mot de passe **`password`**
- Retourne `{ token: "mock-user-token", user: UserProfileDto }`
- Retourne 401 si l'email est inconnu ou le mot de passe incorrect
- Retourne 403 si le compte est désactivé (`isDisabled: true`)

```
Email de test : n'importe quel user non-admin du store
Mot de passe  : password
```

---

## Différence avec `/admin/login`

| | `/login` | `/admin/login` |
|-|----------|----------------|
| Endpoint | `POST /auth/login` | `POST /auth/admin/login` |
| 2FA | Non | Oui (TOTP 6 chiffres) |
| Phases | 1 | 2 |
| Redirection succès | `/` | `/admin` (ou `/account/security/2fa`) |

Voir `auth/login-admin.md` pour le détail du flow admin.
