/**
 * Binds all methods of the given object's prototype to the object instance.
 *
 * Iterates over the object's prototype properties and binds each method (excluding the constructor)
 * to the provided `thisRef` instance. This ensures that `this` inside the methods always refers to itself.
 *
 * @param thisRef - The object instance whose prototype methods will be bound to itself.
 */
export const bindAllMethods = (thisRef: object): void => {
  const descriptors = Object.entries(
    Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(thisRef)),
  );
  for (const [classMemberName, descriptor] of descriptors) {
    if (
      classMemberName !== "constructor" &&
      typeof descriptor.value === "function"
    ) {
      Reflect.set(
        thisRef,
        classMemberName,
        Reflect.get(thisRef, classMemberName).bind(thisRef),
      );
    }
  }
};

declare global {
  /**
   * Optional property to specify a human-readable name for the function.
   * 
   * This property is commonly used in development tools and libraries (such as React)
   * to preserve or display the function's name, especially before code is minified
   * or obfuscated by JavaScript bundlers.
   */
  interface Function {
    displayName?: string;
  }

  interface ObjectConstructor {
    /** {@linkcode} */
    bindAllMethods(thisRef: object): void;
  }
}

Object.bindAllMethods = bindAllMethods;
