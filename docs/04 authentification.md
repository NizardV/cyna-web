# Authentification — Cookie JWT, OTP & 2FA

## Architecture complète

```
┌──────────────────────────────────────────────────────────────────┐
│                    Flux d'authentification                       │
│                                                                  │
│  /login          LoginScreen                                     │
│  /register       RegisterScreen → ConfirmEmailScreen             │
│  /forgot-password ForgotPasswordScreen → ResetPasswordScreen     │
│  /admin/login    AdminLoginScreen  (2 phases TOTP)               │
│  /account/security/2fa  Security2FAScreen                        │
└─────────────────────────────┬────────────────────────────────────┘
                              │ src/api/auth.js
                              │
              ┌───────────────▼───────────────────┐
              │            auth.js                │
              │   loginUser()                     │
              │   registerUser()                  │
              │   logout()                        │
              │   forgotPassword()                │
              │   resetPassword()                 │
              │   confirmEmail()                  │
              │   adminLogin()         ← 2 phases │
              │   setupTwoFactor()                │
              │   confirmTwoFactor()              │
              └───────────────┬───────────────────┘
                              │ apiClient
                              │
              ┌───────────────▼───────────────────┐
              │          ApiClient                │
              │  POST /auth/login                 │
              │  POST /auth/register              │
              │  POST /auth/logout                │
              │  GET  /auth/me                    │
              │  POST /auth/forgot-password       │
              │  POST /auth/reset-password        │
              │  POST /auth/confirm-email         │
              │  POST /auth/admin/login           │
              │  POST /auth/2fa/setup             │
              │  POST /auth/2fa/confirm           │
              └───────────────┬───────────────────┘
                              │
              ┌───────────────▼───────────────────┐
              │  AuthContext (auth-context.jsx)   │
              │  user: UserDto | null             │
              │  loading: boolean                 │
              │  login() → fetchMe()              │
              │  logout() → POST /auth/logout     │
              │  isAuthenticated: boolean         │
              │  isAdmin: boolean                 │
              └───────────────────────────────────┘
```

---

## Flux de connexion utilisateur

```
1. Utilisateur saisit email + password → LoginScreen
         │
2. handleSubmit()
         │  validation : champs non vides
         │
3. loginUser({ email, password })    → POST /auth/login
         │
   Cookie: cyna_token=<jwt>; HttpOnly  [automatique, géré par le navigateur]
   Cookie: cyna_refresh_token=<jwt>;   [HttpOnly]
         │
4. login()    → fetchMe()    → GET /auth/me → setUser(user)
         │
5. navigate("/")
```

---

## Flux d'inscription

```
RegisterScreen
    │  prénom, nom, email, password (validation PWD_RULES)
    ▼
registerUser({ firstName, lastName, email, password })
    │
    └─ POST /auth/register → { message: "Inscription réussie." }
            │
    navigate(`/confirm-email?email=${encodeURIComponent(email)}`)
```

---

## Flux OTP — Mot de passe oublié

```
ForgotPasswordScreen
    │  email saisi
    ▼
forgotPassword({ email })    → POST /auth/forgot-password
    │
    Réponse toujours 204 (anti-énumération — même si email inconnu)
    │
    → état submitted = true
    → affichage carte "E-mail envoyé"
    → bouton "Saisir le code reçu →"
    │
    navigate(`/reset-password?email=${email}`)
```

```
ResetPasswordScreen
    │  email (pré-rempli depuis URL) + code OTP (6 chiffres) + nouveau password
    ▼
    Validation : email valide + code 6 chiffres + password fort (PWD_RULES)
    │
resetPassword({ email, code, newPassword })    → POST /auth/reset-password
    │
    ├─ 200 → état success = true → carte "Mot de passe réinitialisé"
    │         → bouton "Se connecter" → navigate("/login")
    └─ 400 → setError("Code invalide ou expiré")
```

---

## Flux OTP — Confirmation d'email

```
ConfirmEmailScreen
    │  email (pré-rempli depuis URL ?email=…) + code OTP (6 chiffres)
    ▼
confirmEmail({ email, code })    → POST /auth/confirm-email
    │
    ├─ 200 → état success = true → carte "E-mail confirmé !"
    │         → bouton "Continuer" → navigate("/")
    └─ 400 → setError("Code invalide ou expiré")

Renvoi du code :
    → forgotPassword({ email })    ← réutilise le même endpoint
```

---

## Flux 2FA — Connexion admin (deux phases)

```
AdminLogin (/admin/login) — Phase 1
    │  email + password
    ▼
adminLogin({ email, password, totpCode: null })    → POST /auth/admin/login
    │
    ├─ 401 → setError("Identifiants invalides") + setPassword("")
    │
    ├─ 403 → setError("Accès refusé")
    │
    ├─ 200 { requiresTwoFactorSetup: true }
    │       → login() + navigate("/account/security/2fa")   [bootstrap]
    │
    └─ 200 { totpRequired: true }
            → setPhase(2)   [aucune erreur affichée]
            │
AdminLogin — Phase 2
    │  code TOTP (6 chiffres) — OtpInput
    ▼
adminLogin({ email, password, totpCode })    → POST /auth/admin/login
    │
    ├─ 401 { totpRequired: true } → setError("Code invalide…") + setTotp("")
    └─ 200 { token, user }        → login() + navigate("/admin")
```

### Cas bootstrap — admin sans 2FA configuré

Si l'administrateur n'a jamais configuré son 2FA (`hasTwoFactor: false`), le backend renvoie directement `requiresTwoFactorSetup: true` sans demander de code TOTP. Le front redirige immédiatement vers `/account/security/2fa` pour forcer la configuration.

---

## Flux 2FA — Configuration (Security2FAScreen)

```
Security2FAScreen (/account/security/2fa)
    │  (accès réservé aux admins et super-admins)
    ▼
Étape 1 : Scan du QR code
    │
setupTwoFactor()    → POST /auth/2fa/setup
    │
    TwoFactorSetupDto { secret, otpAuthUrl }
    │
    → Affichage QR code (api.qrserver.com?data={otpAuthUrl})
    → Affichage de la clé secrète à copier manuellement
    │
    Utilisateur scanne avec Google Authenticator / Authy
    │
Étape 2 : Saisie du premier code TOTP
    │
confirmTwoFactor({ totpCode })    → POST /auth/2fa/confirm
    │
    ├─ 200 → état activated = true → carte "2FA activé avec succès"
    └─ 400 → setError("Code invalide")
```

---

## AuthContext — API publique

```js
// src/contexts/auth-context.jsx
const AuthContext = createContext()

// Valeurs exposées
{
  user,              // UserDto | null (null = non authentifié)
  setUser,           // (user) => void
  loading,           // boolean — true pendant fetchMe()
  setLoading,        // (bool) => void
  login,             // () => fetchMe() — à appeler après tout login réussi
  logout,            // () => POST /auth/logout + setUser(null) + redirect "/"
  isAuthenticated,   // !! user
  isAdmin,           // ["Administrateur", "Super Administrateur"].includes(user?.role)
}
```

### Utilisation via `useAuth()`

```js
// src/hooks/use-auth.js  — ne jamais utiliser useContext(AuthContext) directement
import { useAuth } from "@/hooks/use-auth"

function MyComponent() {
  const { user, isAuthenticated, isAdminView, login, logout } = useAuth()
  // …
}
```

---

## `isAdminView` — override de rôle en développement

```js
// src/hooks/use-auth.js
const ROLE_OVERRIDE = import.meta.env.VITE_OVERRIDE_ROLE === "true"

const isAdminView = ROLE_OVERRIDE
  ? pathname.startsWith("/admin")   // déduit depuis l'URL
  : context.isAdmin                 // déduit depuis le rôle JWT

return { ...context, isAdminView }
```

| Environnement | `isAdminView` calculé depuis |
|---------------|------------------------------|
| Production (`VITE_OVERRIDE_ROLE=false`) | Rôle dans le JWT via `isAdmin` |
| Développement (`VITE_OVERRIDE_ROLE=true`) | Préfixe `/admin` dans l'URL courante |

> Ce flag est **frontend uniquement**. Il ne contourne pas la vérification du rôle côté API — les appels protégés retourneront toujours 403 si le token ne correspond pas.

---

## UserDto — structure de la session

```js
// Retourné par GET /auth/me et POST /auth/login
{
  id:               number,
  email:            string,
  firstName:        string,
  lastName:         string,
  role:             "User" | "Administrateur" | "Super Administrateur",
  isEmailVerified:  boolean,
  createdAt:        string,   // ISO 8601
  hasTwoFactor:     boolean,  // présent uniquement pour les admins
}
```

---

## Règles de mot de passe (PWD_RULES)

Définies et affichées dans `ResetPasswordScreen` et `RegisterScreen` via le composant `PasswordStrength` :

```js
const PWD_RULES = [
  { key: "length",    label: "8 caractères minimum",  test: (p) => p.length >= 8 },
  { key: "uppercase", label: "Une lettre majuscule",  test: (p) => /[A-Z]/.test(p) },
  { key: "number",    label: "Un chiffre",            test: (p) => /\d/.test(p) },
  { key: "special",   label: "Un caractère spécial",  test: (p) => /[^a-zA-Z0-9]/.test(p) },
]
```

---

## DTOs d'authentification

### Auth standard

| Fonction | Endpoint | Body envoyé | Réponse |
|----------|----------|-------------|---------|
| `loginUser` | `POST /auth/login` | `{ email, password }` | Cookie JWT |
| `registerUser` | `POST /auth/register` | `{ firstName, lastName, email, password }` | `{ message }` |
| `refreshToken` | `POST /auth/refresh` | `{}` | Nouveau cookie JWT |
| `logout` | `POST /auth/logout` | `{}` | 204 |

### OTP

| Fonction | Endpoint | Body envoyé | Réponse |
|----------|----------|-------------|---------|
| `forgotPassword` | `POST /auth/forgot-password` | `{ email }` | 204 |
| `resetPassword` | `POST /auth/reset-password` | `{ email, code, newPassword }` | `{ message }` |
| `confirmEmail` | `POST /auth/confirm-email` | `{ email, code }` | `{ message }` |

### 2FA

| Fonction | Endpoint | Body envoyé | Réponse |
|----------|----------|-------------|---------|
| `adminLogin` | `POST /auth/admin/login` | `{ email, password, totpCode? }` | voir flux 2FA |
| `setupTwoFactor` | `POST /auth/2fa/setup` | — | `{ secret, otpAuthUrl }` |
| `confirmTwoFactor` | `POST /auth/2fa/confirm` | `{ totpCode }` | 200 |

---

## Configuration locale (développement)

```env
# .env.local
VITE_MOCK_API=true
VITE_API_URL=http://localhost:5104    # ignoré en mock, mais requis
VITE_OVERRIDE_ROLE=true              # accès admin sans login
```

### Comptes mock disponibles

| Email | Password | Rôle | 2FA |
|-------|----------|------|-----|
| `superadmin@cyna.fr` | `password` | Super Administrateur | ✅ activé |
| `admin@cyna.fr` | `password` | Administrateur | ❌ (déclenche bootstrap) |
| tout email inconnu + `password` | → créé comme User dynamiquement | - |

### Codes OTP mock

| Action | Code fixe |
|--------|-----------|
| Reset mot de passe | `123456` |
| Confirmation email | `654321` |
| Code TOTP admin | `000000` |