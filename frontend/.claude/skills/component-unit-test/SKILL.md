---
name: component-unit-test
description: Use when writing or updating a unit test for a React component in frontend/src/components (or frontend/src/views). Uses Vitest + Testing Library. First test is always a shallow snapshot (child components mocked out); tests are grouped into describe("rendering")/describe("props")/describe("handlers"), each prop or handler getting its own nested describe block.
---

Write unit tests for the component provided as the argument.

## Core principle

A component unit test verifies what THIS component renders and does — not what its
children render internally. Child components are collaborators: mock them out so the
snapshot and assertions only ever see this component's own markup, never a child's
implementation details.

## File location

Place the spec next to the component's siblings, under `__tests__/`, mirroring the
existing convention:

```
src/components/Foo.tsx        -> src/components/__tests__/Foo.spec.tsx
src/views/BarView.tsx         -> src/views/__tests__/BarView.spec.tsx
```

## Steps

1. Read the target component in full.
2. List every imported child component — each one gets a `vi.mock(...)` stub.
3. List every external dependency the component touches: hooks (`useNavigate`,
   `useSelector`, `useDispatch`), services (`../service/*.ts`), and libraries like
   `lodash-es` `debounce` if timing matters.
4. Write the snapshot test first (see below).
5. Write one `describe` block per distinct method/functionality the component owns:
   a prop-driven render variant, an event handler, a derived/computed value, an effect,
   a conditional branch. One `it` per scenario inside that block.
6. Run `npm run test:unit` and fix failures. Do not modify the source component to make
   a test pass unless the test caught a real bug — ask first if unsure.

## The snapshot test (always first)

- Mock every imported child component so it renders as an inert placeholder instead of
  its real markup. This is what makes the snapshot "shallow" — it captures only this
  component's own JSX, not descendants' internals.
- Use `renderWithProviders` (`frontend/test/utils.tsx`) when the component reads from
  Redux or needs a `Provider`; otherwise use `render` from `@testing-library/react`
  directly. Wrap in `MemoryRouter` if the component uses `react-router-dom` hooks.
- Snapshot the rendered fragment, not the whole `document.body`.
- Keep this test in its own `describe("rendering")` (or top-level, no wrapping describe)
  block, separate from the functionality-specific blocks.

```ts
import { render } from "@testing-library/react";
import Foo from "../Foo.tsx";

vi.mock("../ChildOne.tsx", () => ({
  default: () => <div data-testid="child-one-mock" />,
}));
vi.mock("../ChildTwo.tsx", () => ({
  default: () => <div data-testid="child-two-mock" />,
}));

describe("Foo", () => {
  describe("rendering", () => {
    it("should match snapshot", () => {
      const { asFragment } = render(<Foo someProp="value" />);

      expect(asFragment()).toMatchSnapshot();
    });
  });

  // one describe block per method/functionality below
});
```

For a Redux-connected component:

```ts
import Foo from "../Foo.tsx";
import { renderWithProviders } from "../../../test/utils.tsx";

vi.mock("../ChildOne.tsx", () => ({
  default: () => <div data-testid="child-one-mock" />,
}));

describe("Foo", () => {
  describe("rendering", () => {
    it("should match snapshot", async () => {
      const { asFragment } = await renderWithProviders(<Foo />, {
        preloadedState: { userState: defaultUserState },
      });

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
```

## Mocking rules

- Child components: `vi.mock("../ChildComponent.tsx", () => ({ default: () => <div data-testid="..."/> }))`.
  Never let a real child render — that pulls its internals (and its own child tree) into
  this component's test.
- Service/module calls: `vi.hoisted(() => vi.fn())` + `vi.mock("../../service/x.ts", () => ({ ... }))`,
  matching the pattern in `SignInForm.spec.tsx`.
- `react-router-dom` hooks: mock via `vi.importActual` + override, matching
  `UserSidebar.spec.tsx`.
- Restore/reset mocks in `beforeEach` with `vi.clearAllMocks()`.

## Describe block breakdown

Group tests into top-level buckets, each containing one nested `describe` per
prop/handler/behavior (see `BaseButton.spec.tsx`, `ChatListItem.spec.tsx` for the
canonical layout):

- `describe("rendering")` — the snapshot test, plus static structural assertions that
  don't vary by prop (e.g. "renders a listitem role", "renders two action buttons").
- `describe("props")` — one nested `describe(propName)` per prop that changes output
  (conditional classes, conditional branches, formatted values). Each nested block holds
  every scenario for that one prop.
- `describe("handlers")` — one nested `describe(handlerName)` per callback prop or
  user-triggered action (click, input, submit). Each nested block asserts the handler
  was called with the right args, or the resulting side effect (dispatch, navigate).
- Anything that doesn't fit props/handlers (redux-derived state, debounce timing,
  responsive/hook-driven behavior, sort order) gets its own top-level `describe` named
  for that behavior (e.g. `"sorting"`, `"typing indicators"`, `"responsive behavior"`).

```ts
describe("Foo", () => {
  describe("rendering", () => { /* snapshot + structural assertions */ });

  describe("props", () => {
    describe("variant", () => { /* it()s for the variant prop */ });
    describe("disabled", () => { /* it()s for the disabled prop */ });
  });

  describe("handlers", () => {
    describe("onClick", () => { /* it()s for the onClick callback */ });
  });
});
```

## What to assert (outside the snapshot test)

- Rendered output for a given prop/state combination (`screen.getBy...`).
- That a callback prop was called with the right arguments.
- That a Redux action was dispatched (spy on `store.dispatch`) or a mocked service was
  called with the right arguments — not what that service/action does internally.
- DOM state after interaction (input value, disabled/focused state).

## What NOT to assert

- Anything about a mocked child component's internal markup — it only exists as a
  placeholder.
- The real behavior of a mocked service, selector, or hook.
- Implementation details (internal variable names, non-exported helpers).

## Output

- Write the test file. Do not modify the source component.
- After writing, run `cd frontend && npm run test:unit` and fix any failures, including
  reviewing generated `.snap` files for correctness before accepting them.
- Report the test count and any skipped tests.
