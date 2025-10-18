import { useReducer } from "react";

/**
 * Rerenders a React component.
 *
 * @returns A callback that, when called, rerenders the component.
 *
 * @example
 * const rerender = useRerender();
 * // Call rerender() to make the component rerender.
 * button.addEventListener("click", rerender);
 */
export const useRerender = (): VoidFunction => {
  const [, rerender] = useReducer((x: boolean) => !x, true);
  return rerender;
};
