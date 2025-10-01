import { useCallback, useEffect, useState } from "react";

export function useCounterViewModel() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`<useCounterViewModel count="${count}">`);
  }, [count]);

  const handleIncrease = useCallback(() => {
    setCount((currentValue) => currentValue + 1);
  }, []);

  const handleDecrease = useCallback(() => {
    setCount((currentValue) => currentValue - 1);
  }, []);

  return {
    count,
    increase: handleIncrease,
    decrease: handleDecrease,
  };
}
