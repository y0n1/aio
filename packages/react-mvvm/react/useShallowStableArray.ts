import { useRef } from "react";

/**
 * Returns a stable reference to an array as long as its shallow contents do not change.
 * If the array length or any element changes (by reference), a new reference is returned.
 * Useful for React dependency arrays to avoid unnecessary recalculations.
 *
 * @param arr - The array to track for shallow stability.
 * @returns A stable array reference unless shallow contents change.
 */
export function useShallowStableArray<T extends readonly unknown[]>(
  ...arr: T
): T {
  const ref = useRef<T>(arr);
  if (
    arr.length !== ref.current.length ||
    arr.some((v, i) => v !== ref.current[i])
  ) {
    ref.current = arr;
  }
  return ref.current;
}
