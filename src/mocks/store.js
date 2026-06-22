/**
 * @file mocks/store.js
 * @description Source unique de vérité pour les données mock partagées entre handlers.
 * Tous les handlers importent depuis ici pour garantir la cohérence des IDs.
 */

import { faker } from "@faker-js/faker"
import {
  makeMany,
  makeCategory,
  makeProduct,
  makeUser,
} from "./factories/factories.js"

export const _categories = makeMany(6, makeCategory)

export const _products = makeMany(40, () =>
  makeProduct({ categoryId: faker.helpers.arrayElement(_categories).id })
)

// ---------------------------------------------------------------------------
// Utilisateurs admin (partagés entre handlers/auth.js et handlers/admin-users.js)
//
// AdminUserDto :
//   { id, email, firstName, lastName, role, isEmailVerified,
//     isDisabled, hasTwoFactor, createdAt }
//
// Convention mot de passe mock : "password" (pour tous les comptes)
// ---------------------------------------------------------------------------

export const _adminUsers = [
  // SuperAdmin — 2FA déjà activé
  makeUser({
    id: 1,
    email: "superadmin@cyna.fr",
    firstName: "Super",
    lastName: "Admin",
    role: "SuperAdmin",
    isEmailVerified: true,
    isDisabled: false,
    hasTwoFactor: true,
  }),

  // Admin — 2FA non encore configuré (déclenche requiresTwoFactorSetup: true)
  makeUser({
    id: 2,
    email: "admin@cyna.fr",
    firstName: "Alice",
    lastName: "Admin",
    role: "Admin",
    isEmailVerified: true,
    isDisabled: false,
    hasTwoFactor: false,
  }),

  // Utilisateurs standard
  ...makeMany(8, (_, i) =>
    makeUser({
      id: 100 + i,
      role: "User",
      isEmailVerified: faker.datatype.boolean({ probability: 0.8 }),
      isDisabled: faker.datatype.boolean({ probability: 0.1 }),
      hasTwoFactor: false,
    })
  ),
]