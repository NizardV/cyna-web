import * as React from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";

/**
 * Maintient une ref synchronisée avec la dernière valeur de `props` à chaque render.
 * Permet aux callbacks stables de lire la valeur courante sans la mettre en dépendance.
 *
 * @template T
 * @param props - Valeur à tracked via ref
 * @returns Ref toujours à jour vers la dernière valeur reçue
 */
function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props);

  useIsomorphicLayoutEffect(() => {
    ref.current = props;
  });

  return ref;
}

export { useAsRef };
