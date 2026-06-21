import * as React from "react";

/**
 * Initialise une ref avec une fonction factory appelée une seule fois.
 * Équivalent de `useMemo` mais pour les refs — la factory n'est jamais réexécutée.
 *
 * @template T
 * @param fn - Factory appelée une seule fois pour produire la valeur initiale
 * @returns Ref contenant la valeur produite par `fn`
 */
function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

export { useLazyRef };
