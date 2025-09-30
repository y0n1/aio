/**
 * Binds all methods of the given object's prototype to the object instance.
 *
 * Iterates over the object's prototype properties and binds each method (excluding the constructor)
 * to the provided `thisRef` instance. This ensures that `this` inside the methods always refers to itself.
 *
 * @param thisRef - The object instance whose prototype methods will be bound to itself.
 */
export const bindAllMethods = (thisRef: Record<string, any>): void => {
  const descriptors = Object.entries(
    Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(thisRef))
  );
  for (const [classMemberName, descriptor] of descriptors) {
    if (
      classMemberName !== "constructor" &&
      typeof descriptor.value === "function"
    ) {
      thisRef[classMemberName] = thisRef[classMemberName].bind(thisRef);
    }
  }
};

// Extend ObjectConstructor to include bindAllMethods
declare global {
  interface ObjectConstructor {
    bindAllMethods(thisRef: Record<string, any>): void;
  }
}

Object.bindAllMethods = bindAllMethods;
