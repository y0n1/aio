/**
 * Binds all functions of the given object's prototype to the object instance.
 *
 * Iterates over the object's prototype properties and binds each function (excluding the constructor)
 * to the provided `thisRef` instance. This ensures that `this` inside the functions always refers to itself.
 *
 * @param thisRef - The object instance whose prototype functions will be bound to itself.
 */
export const bindAllFunctions = (thisRef: object): void => {
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
