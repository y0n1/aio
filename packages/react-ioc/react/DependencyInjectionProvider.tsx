import { createContext, useContext } from "react";
import type { Container } from "../core/Container.ts";

export const DependencyInjectionContext = createContext<Container | null>(null);

export const DependencyInjectionProvider: React.FC<
  React.PropsWithChildren<{ container: Container }>
> = (props) => {
  const { container, children } = props;
  return <DependencyInjectionContext.Provider value={container}>{children}</DependencyInjectionContext.Provider>;
};


export function useInjection<T>(registeredInterfaceSymbol: symbol): T {
  const container = useContext(DependencyInjectionContext);
  if (!container) {
    throw new ReferenceError("useInjection must be used inside a DependencyInjectionProvider");
  }

  return container.get<T>(registeredInterfaceSymbol);
}
