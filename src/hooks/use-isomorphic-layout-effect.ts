import * as React from "react";

/**
 * `useLayoutEffect` côté client, `useEffect` côté serveur (SSR/SSG).
 * Évite l'avertissement React lors du rendu serveur sans sacrifier
 * la synchronicité du layout côté client.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export { useIsomorphicLayoutEffect };
