import { css } from "@emotion/css";
import {
  CounterComponentClassic,
  CounterComponentMvvm,
} from "./counter/mod.ts";
import { useEffect, useRef, useState } from "react";

const styles = css`
  max-width: 600px;
  margin: 2rem auto;
  background: #232634;
  border-radius: 1rem;
  box-shadow: 0 2px 16px #0008;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

export default function App(): React.ReactElement {
  const [turnOn, setTurnOn] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = globalThis.setTimeout(() => {
      setTurnOn(false);
    }, 10_000);
    return () => {
      globalThis.clearTimeout(intervalRef.current!);
    };
  }, []);

  return (
    <div className={styles}>
      <h1>Hello counters!</h1>

      Classic <CounterComponentClassic />
      <br />
      {turnOn && (
        <>
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
          MVVM <CounterComponentMvvm />
        </>
      )}
    </div>
  );
}
