/**
 * @file mocks/store.js
 * @description Source unique de vérité pour les données mock partagées entre handlers.
 * Tous les handlers importent depuis ici pour garantir la cohérence des IDs.
 */

import { faker } from "@faker-js/faker"
import { makeMany, makeCategory, makeProduct } from "./factories/factories.js"

export const _categories = makeMany(6, makeCategory)

export const _products = makeMany(40, () =>
  makeProduct({ categoryId: faker.helpers.arrayElement(_categories).id })
)
