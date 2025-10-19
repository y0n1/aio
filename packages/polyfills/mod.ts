import { bindAllFunctions } from "./object/bind_all_methods.ts";

declare global {
  interface ObjectConstructor {
    bindAllFunctions: typeof bindAllFunctions;
  }
}

Object.bindAllFunctions = bindAllFunctions;
