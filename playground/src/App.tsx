import { css } from "@emotion/css";
import {
  CounterComponentClassic,
  CounterComponentMvvm,
} from "./components/counter/mod.ts";
import React from "react";

const styles = css`
  max-width: 300px;
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
  const [show, setShow] = React.useState(true);
  React.useEffect(() => {
    const timer = setInterval(() => setShow(s => !s), 5_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles}>
      <h1>Hello counters!</h1>

      Classic <CounterComponentClassic />
      <br />
      {show
        ? (
          <>
            MVVM <CounterComponentMvvm />
          </>
        )
        : <p>MVVM component expired</p>}
    </div>
  );
}
