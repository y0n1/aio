import { useEffect, useState } from "react";
import { Observable } from "../core/observable.ts";

export const useObservable = <T>(observable: Observable<T>): T => {
  const [value, setValue] = useState(observable.value);
  useEffect(() => {
    const unsubscribe = observable.subscribe((value) => {
      setValue(value);
    });
    setValue(observable.value);
    return () => {
      unsubscribe();
    };
  }, [observable]);
  return value;
};
