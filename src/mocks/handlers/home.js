import { makeMany, makeProduct, makeCategory, makeCarouselItem } from "../factories/factories.js";
import { faker } from "@faker-js/faker";

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

      // Les Catégories (Générées et triées !)
      // On en crée 4, et on utilise la fonction JavaScript .sort() 
      // pour les ordonner selon leur 'displayOrder', respectant ainsi le Cahier des charges
      const categories = makeMany(4, makeCategory).sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      // Les Top Produits (On génère 4 produits "Featured")
      const featuredProducts = makeMany(4, () => makeProduct({ isFeatured: true }));

      return {
        carouselSlides,
        missionText,
        categories,
        featuredProducts
      };
    },
  }
];