import { CounterComponent, CounterComponentV2 } from "./counter/mod.ts";

export default function App(): React.ReactElement {
  return (
    <div className="App">
      <h1>Hello counters!</h1>

      <CounterComponent />
      <br/>
      <CounterComponentV2 />
    </div>
  );
}
