import { isEqual } from "lodash";
import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export function useEffectStrictMode(effect: EffectCallback, deps: DependencyList = []) {
  const prevDeps = useRef<DependencyList>([]);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (deps.length === 0) {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        effect();
      }
      return;
    }

    if (!isEqual(prevDeps.current, deps)) {
      prevDeps.current = deps;
      effect();
    }
  }, deps);
}
