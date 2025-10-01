import {
  CounterComponentClassic,
  CounterComponentMvvm,
} from "./counter/mod.ts";

export default function App(): React.ReactElement {
  return (
    <div className="App">
      <h1>Hello counters!</h1>

      <CounterComponentClassic />
      <br />
      <CounterComponentMvvm />
    </div>
  );
}
