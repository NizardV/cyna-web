# Authentification — Mot de passe oublié

Page : `src/pages/auth/forgot-password.jsx`  
Route : `/auth/forgot-password`

---

## Flux

```
Utilisateur saisit son email → Submit
    ↓
forgotPassword({ email })    → POST /auth/forgot-password
    ↓
Toujours 204 (anti-énumération)
    ↓
Affiche carte de succès avec :
  - Lien vers /reset-password?email=...
  - Bouton "Renvoyer"
```

> Le backend répond toujours 204 même si l'email n'existe pas, pour éviter de confirmer l'existence d'un compte.

---

## Mock

```
OTP reset envoyé dans la console : [mock] reset-password code for x@y.z: 123456
```

Valeur fixe : `123456`.

---

## i18n — namespace `forgot-password`

| Clé | Texte FR |
|-----|----------|
| `title` | Mot de passe oublié |
| `subtitle` | Entrez votre adresse e-mail |
| `emailLabel` | Adresse e-mail |
| `emailPlaceholder` | vous@exemple.fr |
| `submit` | Envoyer le lien |
| `sending` | Envoi… |
| `errorGeneric` | Une erreur est survenue |
| `success.title` | E-mail envoyé |
| `success.description` | Un code a été envoyé à {{email}} |
| `success.spamHint` | Vérifiez vos spams |
| `success.enterCode` | Saisir le code |
| `success.resend` | Renvoyer |
| `backToLogin` | Retour à la connexion |

---

# Authentification — Réinitialisation de mot de passe

Page : `src/pages/auth/reset-password.jsx`  
Route : `/auth/reset-password?email=...`

---

## Flux

```
Pré-rempli avec email via ?email=... dans l'URL
    ↓
Utilisateur saisit : email + OTP 6 chiffres + nouveau mot de passe
    ↓
resetPassword({ email, code, newPassword })    → POST /auth/reset-password
    ↓
Succès : carte de succès + bouton vers /login
Erreur 400 : "Code invalide ou expiré"
```

### Validation du mot de passe

Le composant `PasswordStrength` s'affiche dès que le champ est focalisé :
- Longueur minimale
- Majuscule obligatoire
- Chiffre obligatoire
- Caractère spécial obligatoire

`isPasswordValid(password)` doit retourner `true` pour activer le bouton.

---

## Mock

Code OTP fixe : `123456`

---

## i18n — namespace `reset-password`

| Clé | Texte FR |
|-----|----------|
| `title` | Nouveau mot de passe |
| `subtitle` | Saisissez le code reçu par e-mail |
| `codeLabel` | Code à 6 chiffres |
| `codeExpiry` | Code valide 15 minutes. |
| `resendCode` | Renvoyer un code |
| `passwordLabel` | Nouveau mot de passe |
| `passwordRules.length` | Au moins 8 caractères |
| `passwordRules.uppercase` | Une lettre majuscule |
| `passwordRules.number` | Un chiffre |
| `passwordRules.special` | Un caractère spécial |
| `submit` | Réinitialiser le mot de passe |
| `submitting` | Réinitialisation… |
| `errorInvalidCode` | Code invalide ou expiré |
| `success.title` | Mot de passe réinitialisé |
| `success.description` | Votre mot de passe a été modifié |
| `success.cta` | Se connecter |
| `backToLogin` | Retour à la connexion |

---

# Authentification — Confirmation d'email

Page : `src/pages/auth/confirm-email.jsx`  
Route : `/auth/confirm-email?email=...`

---

## Rôle

Après inscription, l'utilisateur doit confirmer son adresse email via un code OTP reçu par email.

---

## Flux

```
Pré-rempli avec email via ?email=... dans l'URL
    ↓
Utilisateur saisit email + OTP 6 chiffres
    ↓
confirmEmail({ email, code })    → POST /auth/confirm-email
    ↓
Succès : carte de succès + navigate("/")
Erreur 400 : "Code invalide ou expiré"
```

### Renvoi du code

`handleResend()` appelle `forgotPassword({ email })` comme substitut (pas de route `/auth/resend-confirmation` dédiée côté backend pour l'instant).

---

## Mock

Code OTP fixe : `654321` (affiché dans la console après `/auth/register`)

---

## i18n — namespace `confirm-email`

| Clé | Texte FR |
|-----|----------|
| `title` | Confirmez votre e-mail |
| `subtitle` | Un code a été envoyé à votre adresse |
| `emailLabel` | Adresse e-mail |
| `codeLabel` | Code à 6 chiffres |
| `submit` | Confirmer |
| `submitting` | Vérification… |
| `noCode` | Vous n'avez pas reçu le code ? |
| `resend` | Renvoyer |
| `errorInvalidCode` | Code invalide ou expiré |
| `errorResend` | Erreur lors du renvoi |
| `success.title` | E-mail confirmé |
| `success.description` | Votre compte est maintenant actif |
| `success.cta` | Aller sur le site |
| `backToLogin` | Retour à la connexion |
