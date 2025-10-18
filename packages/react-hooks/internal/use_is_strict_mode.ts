import { useEffect, useRef, useState } from "react";

/**
 * Detects if React Strict Mode is active for this component tree.
 *
 * **How it works:**
 * In React 18+, Strict Mode will double-invoke components' lifecycle methods
 * (and effects) in development. This hook exploits that by setting a flag
 * in the cleanup of a useEffect, then in the next effect run, detecting
 * if the flag was set. If so, we are (most likely) inside Strict Mode.
 *
 * @returns True if React Strict Mode is detected, else false.
 *
 * @example
 * const isStrict = useIsStrictMode();
 * console.log("Is strict mode?", isStrict);
 */
export const useIsStrictMode = (): boolean => {
  const [isStrictMode, setIsStrictMode] = useState(false);
  const isStrictModeRef = useRef(false);

  useEffect(() => {
    if (isStrictModeRef.current) {
      setIsStrictMode(true);
    }
    return () => {
      isStrictModeRef.current = true;
    };
  }, []);

  return isStrictMode;
};
