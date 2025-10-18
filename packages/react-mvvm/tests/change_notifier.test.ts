import { assertEquals } from "@std/assert";
import { ChangeNotifier } from "../internal/core/change_notifier.ts";

Deno.test(
  "notifyListeners allows removal of a subsequent listener without affecting the current run",
  () => {
    const notifier = new ChangeNotifier();
    const calls: string[] = [];

    const first = () => {
      calls.push("first");
    };

    const second = () => {
      calls.push("second");
      notifier.removeListener(third);
    };

    const third = () => {
      calls.push("third");
    };

    notifier.addListener(first);
    notifier.addListener(second);
    notifier.addListener(third);

    notifier.notifyListeners();

    assertEquals(calls, ["first", "second"]);
  },
);

Deno.test(
  "notifyListeners allows removal of a prior listener without affecting the current run",
  () => {
    const notifier = new ChangeNotifier();
    const calls: string[] = [];

    const first = () => {
      calls.push("first");
    };

    const second = () => {
      calls.push("second");
      notifier.removeListener(first);
    };

    notifier.addListener(first);
    notifier.addListener(second);

    notifier.notifyListeners();
    assertEquals(calls, ["first", "second"]);

    calls.length = 0;
    notifier.notifyListeners();
    assertEquals(calls, ["second"]);
  },
);

Deno.test("[Symbol.dispose] clears listeners and prevents further notifications", () => {
  const notifier = new ChangeNotifier();
  let callCount = 0;

  const listener = () => {
    callCount += 1;
  };

  notifier.addListener(listener);
  assertEquals(notifier.hasListeners, true);

  notifier[Symbol.dispose]();

  notifier.addListener(listener);
  notifier.notifyListeners();

  assertEquals(callCount, 0);
  assertEquals(notifier.hasListeners, false);
  assertEquals(notifier.isDisposed, true);
});
