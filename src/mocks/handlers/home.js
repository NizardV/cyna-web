import { makeMany, makeCarouselItem } from "../factories/factories.js";
import { faker } from "@faker-js/faker";
import { _products } from "./products.js";
import { _categories } from "./orders.js";

/** @type {import("../registry.js").MockHandler[]} */
export const homeHandlers = [
  {
    method: "GET",
    path: "/home",
    resolver: () => {
      // Les slides du carrousel (Générées dynamiquement)
      const carouselSlides = makeMany(3, () => makeCarouselItem({
        // On rajoute l'override pour le texte du bouton qui n'était pas dans la factory de base
        buttonText: faker.helpers.arrayElement([
          "Découvrir", "En savoir plus", "Essayer gratuitement"
        ])
      })).sort((a, b) => a.displayOrder - b.displayOrder);

      // Le texte fixe (Modifiable en BDD)
      const missionText = "Rejoignez les entreprises du monde entier qui font confiance à Cyna pour leur cybersécurité. Une plateforme SaaS innovante pensée pour faciliter l'accès à nos services de pointe et protéger votre avenir numérique.";

      // On réutilise les mêmes catégories que le catalogue pour que les filtres matchent
      const categories = [..._categories]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, 4);
      // Les Top Produits (On génère 4 produits "Featured")
      let featuredProducts = _products.filter(p => p.isFeatured);
      
      // Sécurité : Si Faker n'en a pas généré au moins 4 avec 'isFeatured=true',
      // on complète avec des produits normaux pour avoir une belle grille de 4.
      if (featuredProducts.length < 4) {
        const others = _products.filter(p => !p.isFeatured);
        featuredProducts = [...featuredProducts, ...others].slice(0, 4);
      } else {
        featuredProducts = featuredProducts.slice(0, 4);
      }

      return {
        carouselSlides,
        missionText,
        categories,
        featuredProducts
      };
    },
  }
];