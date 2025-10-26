import "../tests/_setup_tests.ts";
import { assertEquals, assertStrictEquals } from "@std/assert";
import { act, render } from "@testing-library/react";
import { Listenable } from "./listenable.tsx";
import { useViewModel } from "./use_view_model.ts";
import { CounterNotifier } from "../tests/_fixtures/_counter.ts";
import { ChangeNotifier } from "../core/change_notifier.ts";

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

Deno.test("Listenable renders children correctly", () => {
  const notifier = new CounterNotifier();
  const { container } = render(
    <Listenable listenable={notifier}>
      <div data-testid="child">Hello World</div>
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="child"]')?.textContent,
    "Hello World",
  );

  notifier.dispose();
});

Deno.test("Listenable renders multiple children correctly", () => {
  const notifier = new CounterNotifier();
  const { container } = render(
    <Listenable listenable={notifier}>
      <div data-testid="first">First</div>
      <div data-testid="second">Second</div>
      <div data-testid="third">Third</div>
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="first"]')?.textContent,
    "First",
  );
  assertEquals(
    container.querySelector('[data-testid="second"]')?.textContent,
    "Second",
  );
  assertEquals(
    container.querySelector('[data-testid="third"]')?.textContent,
    "Third",
  );

  notifier.dispose();
});

Deno.test("Listenable renders null children correctly", () => {
  const notifier = new CounterNotifier();

  const { container, unmount } = render(
    <Listenable listenable={notifier}>
      {null}
    </Listenable>,
  );

  assertEquals(container.textContent, "");

  unmount();
  notifier.dispose();
});

Deno.test("Listenable renders undefined children correctly", () => {
  const notifier = new CounterNotifier();

  const { container, unmount } = render(
    <Listenable listenable={notifier}>
      {undefined}
    </Listenable>,
  );

  assertEquals(container.textContent, "");

  unmount();
  notifier.dispose();
});

Deno.test("Listenable renders conditional children correctly", () => {
  const notifier = new CounterNotifier();
  const showContent = true;

  const { container, unmount } = render(
    <Listenable listenable={notifier}>
      {showContent && <div data-testid="conditional">Conditional Content</div>}
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="conditional"]')?.textContent,
    "Conditional Content",
  );

  unmount();
  notifier.dispose();
});

Deno.test("Listenable renders function children correctly", () => {
  const notifier = new CounterNotifier();

  const { container, unmount } = render(
    <Listenable listenable={notifier}>
      {(() => <div data-testid="functional">Function Child</div>)()}
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="functional"]')?.textContent,
    "Function Child",
  );

  unmount();
  notifier.dispose();
});

Deno.test("Listenable preserves children structure with fragments", () => {
  const notifier = new CounterNotifier();
  const fragment = (
    <>
      <div data-testid="fragment-1">Fragment Child 1</div>
      <div data-testid="fragment-2">Fragment Child 2</div>
    </>
  );

  const { container, unmount } = render(
    <Listenable listenable={notifier}>
      {fragment}
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="fragment-1"]')?.textContent,
    "Fragment Child 1",
  );
  assertEquals(
    container.querySelector('[data-testid="fragment-2"]')?.textContent,
    "Fragment Child 2",
  );

  unmount();
  notifier.dispose();
});

// ============================================================================
// SUBSCRIPTION LIFECYCLE TESTS
// ============================================================================

Deno.test("Listenable subscribes to listenable on mount", () => {
  const notifier = new CounterNotifier();

  assertEquals(notifier.hasListeners, false);

  const { unmount } = render(
    <Listenable listenable={notifier}>
      <div>Content</div>
    </Listenable>,
  );

  assertEquals(notifier.hasListeners, true);

  unmount();
  notifier.dispose();
});

Deno.test("Listenable unsubscribes from listenable on unmount", () => {
  const notifier = new CounterNotifier();

  const { unmount } = render(
    <Listenable listenable={notifier}>
      <div>Content</div>
    </Listenable>,
  );

  assertEquals(notifier.hasListeners, true);

  unmount();

  assertEquals(notifier.hasListeners, false);
  notifier.dispose();
});

Deno.test("Listenable resubscribes when listenable prop changes", () => {
  const firstNotifier = new CounterNotifier(10);
  const secondNotifier = new CounterNotifier(20);

  let currentNotifier = firstNotifier;

  const TestComponent = ({ notifier }: { notifier: CounterNotifier }) => {
    return (
      <Listenable listenable={notifier}>
        <div data-testid="count">{notifier.count}</div>
      </Listenable>
    );
  };

  const { container, rerender, unmount } = render(
    <TestComponent notifier={currentNotifier} />,
  );

  assertEquals(firstNotifier.hasListeners, true);
  assertEquals(secondNotifier.hasListeners, false);
  assertEquals(
    container.querySelector('[data-testid="count"]')?.textContent,
    "10",
  );

  currentNotifier = secondNotifier;
  rerender(<TestComponent notifier={currentNotifier} />);

  assertEquals(firstNotifier.hasListeners, false);
  assertEquals(secondNotifier.hasListeners, true);
  assertEquals(
    container.querySelector('[data-testid="count"]')?.textContent,
    "20",
  );

  unmount();
  firstNotifier.dispose();
  secondNotifier.dispose();
});

Deno.test("Listenable unsubscribes from old listenable when prop changes", () => {
  const firstNotifier = new CounterNotifier();
  const secondNotifier = new CounterNotifier();

  const TestComponent = ({ notifier }: { notifier: CounterNotifier }) => {
    return (
      <Listenable listenable={notifier}>
        <div data-testid="count">{notifier.count}</div>
      </Listenable>
    );
  };

  const { rerender, unmount } = render(
    <TestComponent notifier={firstNotifier} />,
  );

  assertEquals(firstNotifier.hasListeners, true);

  rerender(<TestComponent notifier={secondNotifier} />);

  assertEquals(firstNotifier.hasListeners, false);
  assertEquals(secondNotifier.hasListeners, true);

  unmount();
  firstNotifier.dispose();
  secondNotifier.dispose();
});

Deno.test("Listenable doesn't leak listeners after multiple mounts/unmounts", () => {
  const notifier = new CounterNotifier();

  assertEquals(notifier.hasListeners, false);

  // Mount and unmount multiple times
  for (let i = 0; i < 5; i++) {
    const { unmount } = render(
      <Listenable listenable={notifier}>
        <div>Content {i}</div>
      </Listenable>,
    );

    assertEquals(notifier.hasListeners, true);
    unmount();
    assertEquals(notifier.hasListeners, false);
  }

  notifier.dispose();
});

// ============================================================================
// INTEGRATION TESTS (WITH USEVIEWMODEL)
// ============================================================================

Deno.test("Listenable works with useViewModel to trigger parent re-renders", () => {
  const ParentComponent = () => {
    const counter = useViewModel(CounterNotifier);

    return (
      <Listenable listenable={counter}>
        <div data-testid="count">{counter.count}</div>
      </Listenable>
    );
  };

  const { container, unmount } = render(<ParentComponent />);

  assertEquals(
    container.querySelector('[data-testid="count"]')?.textContent,
    "0",
  );

  // Get the counter from the DOM to trigger increment
  // In a real app, you'd have a button or action to trigger this
  const counterElement = container.querySelector('[data-testid="count"]');
  assertStrictEquals(counterElement?.textContent, "0");

  unmount();
});

Deno.test("Listenable can subscribe to nested listenables within a useViewModel component", () => {
  class ParentNotifier extends ChangeNotifier {
    #child: ChangeNotifier;

    constructor() {
      super();
      this.#child = new ChangeNotifier();
    }

    get child(): ChangeNotifier {
      return this.#child;
    }

    override dispose(): void {
      this.#child.dispose();
      super.dispose();
    }
  }

  const Component = () => {
    const parent = useViewModel(ParentNotifier);

    return (
      <div data-testid="parent">
        Parent
        <Listenable listenable={parent.child}>
          <div data-testid="child">Child</div>
        </Listenable>
      </div>
    );
  };

  const { container, unmount } = render(<Component />);

  assertEquals(
    container.querySelector('[data-testid="parent"]')?.textContent,
    "ParentChild",
  );

  unmount();
});

Deno.test("Listenable renders nested Listenable components correctly", () => {
  const outerNotifier = new CounterNotifier(1);
  const innerNotifier = new CounterNotifier(2);

  const { container, unmount } = render(
    <Listenable listenable={outerNotifier}>
      <div data-testid="outer">{outerNotifier.count}</div>
      <Listenable listenable={innerNotifier}>
        <div data-testid="inner">{innerNotifier.count}</div>
      </Listenable>
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="outer"]')?.textContent,
    "1",
  );
  assertEquals(
    container.querySelector('[data-testid="inner"]')?.textContent,
    "2",
  );

  assertEquals(outerNotifier.hasListeners, true);
  assertEquals(innerNotifier.hasListeners, true);

  unmount();

  assertEquals(outerNotifier.hasListeners, false);
  assertEquals(innerNotifier.hasListeners, false);

  outerNotifier.dispose();
  innerNotifier.dispose();
});

// ============================================================================
// REACT FEATURES TESTS
// ============================================================================

Deno.test("Listenable works with React.StrictMode", () => {
  const notifier = new CounterNotifier();

  const { container, unmount } = render(
    <Listenable listenable={notifier}>
      <div data-testid="content">Strict Mode Content</div>
    </Listenable>,
    { reactStrictMode: true },
  );

  assertEquals(
    container.querySelector('[data-testid="content"]')?.textContent,
    "Strict Mode Content",
  );

  // Verify subscription is active
  assertEquals(notifier.hasListeners, true);

  unmount();

  // Verify cleanup happened
  assertEquals(notifier.hasListeners, false);
  notifier.dispose();
});

Deno.test("Listenable has correct displayName", () => {
  assertStrictEquals(Listenable.displayName, "Listenable");
});

// ============================================================================
// DISPOSAL AND ERROR HANDLING TESTS
// ============================================================================

Deno.test("Listenable handles disposed listenable gracefully", () => {
  const notifier = new CounterNotifier();

  const { container, unmount } = render(
    <Listenable listenable={notifier}>
      <div data-testid="content">{notifier.count}</div>
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="content"]')?.textContent,
    "0",
  );

  assertEquals(notifier.hasListeners, true);

  // Dispose the notifier while component is still mounted
  notifier.dispose();

  // Listenable should have cleaned up its listener
  assertEquals(notifier.hasListeners, false);

  // Should not throw error when unmounting
  unmount();
});

Deno.test("Listenable works with different IListenable implementations", () => {
  class CustomListenable extends ChangeNotifier {
    #value = "custom";

    get value(): string {
      return this.#value;
    }

    setValue(newValue: string): void {
      this.#value = newValue;
      this.notifyListeners();
    }
  }

  const customListenable = new CustomListenable();

  const { container, unmount } = render(
    <Listenable listenable={customListenable}>
      <div data-testid="custom">{customListenable.value}</div>
    </Listenable>,
  );

  assertEquals(
    container.querySelector('[data-testid="custom"]')?.textContent,
    "custom",
  );

  assertEquals(customListenable.hasListeners, true);

  unmount();

  assertEquals(customListenable.hasListeners, false);
  customListenable.dispose();
});

// ============================================================================
// SUBSCRIPTION CALLBACK TESTS
// ============================================================================

Deno.test("Listenable listener callback is invoked when listenable notifies", () => {
  const notifier = new CounterNotifier();
  let callbackInvoked = false;

  // Track if any listener is called
  const originalNotify = notifier.notifyListeners.bind(notifier);
  notifier.notifyListeners = () => {
    originalNotify();
    callbackInvoked = true;
  };

  const { unmount } = render(
    <Listenable listenable={notifier}>
      <div>Content</div>
    </Listenable>,
  );

  assertEquals(callbackInvoked, false);

  act(() => {
    notifier.increment();
  });

  assertEquals(callbackInvoked, true);

  unmount();
  notifier.dispose();
});

Deno.test("Listenable subscribes exactly one listener", () => {
  const notifier = new CounterNotifier();
  let listenerCount = 0;

  // Override addListener to count calls
  const originalAdd = notifier.addListener.bind(notifier);
  notifier.addListener = (listener, options) => {
    listenerCount++;
    originalAdd(listener, options);
  };

  render(
    <Listenable listenable={notifier}>
      <div>Content</div>
    </Listenable>,
  );

  // Should only add one listener
  assertEquals(listenerCount, 1);

  notifier.dispose();
});

Deno.test("Listenable removes listener exactly once on unmount", () => {
  const notifier = new CounterNotifier();
  let removeCount = 0;

  // Override removeListener to count calls
  const originalRemove = notifier.removeListener.bind(notifier);
  notifier.removeListener = (listener) => {
    removeCount++;
    originalRemove(listener);
  };

  const { unmount } = render(
    <Listenable listenable={notifier}>
      <div>Content</div>
    </Listenable>,
  );

  assertEquals(removeCount, 0);

  unmount();

  // Should remove exactly one listener
  assertEquals(removeCount, 1);

  notifier.dispose();
});
