---
name: unit-test
description: Use when writing or updating a unit test for a backend file — a service, controller, middleware, mapper, repository, or WS handler under backend/src. Uses Jest with jest.spyOn on collaborators; tests go in backend/__tests__/unit/ mirroring the source path. Not for route-level end-to-end tests (use the integration-test skill).
---

Write unit tests for the file provided as the argument.

## Core principle

A unit test verifies what THIS unit is responsible for — its public contract — not how its dependencies behave internally. If the unit delegates to a collaborator, assert only:
- that the collaborator was called with the expected arguments
- that the unit returns / does the right thing based on the collaborator's (mocked) return value

Never assert on the collaborator's internal logic. Never test the real behavior of mocked dependencies.

**Wrong** — testing the dependency's internals:
```ts
expect(result).toEqual([3, 1, 2]); // verifying the dependency actually sorted
```
**Right** — testing the unit's contract:
```ts
expect(repository.findAll).toHaveBeenCalledWith(expectedArgs);
expect(result).toBe(repoMock); // what the mock returned
```

## Steps

1. Read the target file in full.
2. Identify every external import the unit depends on — these become spies.
3. For each exported function / class method:
   - Determine its responsibility from its name and signature only.
   - List the inputs, the collaborators it calls, and what it returns/does.
   - Write one `describe` block per export, one `it` per distinct scenario.
4. Place the test file under `backend/__tests__/unit/` mirroring the source path (e.g. `src/service/chat.service.ts` → `__tests__/unit/service/chat.service.spec.ts`).

## Mocking rules

- Use `jest.spyOn(Module, 'method').mockResolvedValue(...)` or `.mockReturnValue(...)`.
- Restore all spies in `afterEach(() => jest.restoreAllMocks())`.
- Never import and invoke the real dependency — only spy on it.
- `src/redis.ts` is already replaced globally by `__tests__/__mocks__/redis.ts` via the
  `moduleNameMapper` in `jest.config.ts`. Don't re-mock it; spy on the exported fakes if you
  need to assert calls, and use `__resetStore()` when a test depends on a clean store.

## What to assert

| Unit type | Assert |
|-----------|--------|
| Service function | Called collaborators with exact args; return value matches mock output |
| Middleware | Calls `next()` or sets `res.status(N).end()` based on req state |
| Mapper / transformer | Output shape given a fixed input (no external deps to mock) |
| Repository method | Mongoose model called with correct query args |
| WS handler | `ws.send` called with the right `JSON.stringify({ event, data })` envelope |

## What NOT to assert

- Internal variables or private methods.
- The behavior of a mocked dependency — that belongs in its own unit test.
- How the unit computes a value internally, only that it returns the right result given the mock setup.

## Test structure

```ts
describe('<unit name>', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('<method or scenario group>', () => {
    it('should <expected outcome> when <condition>', async () => {
      // Arrange – stub collaborators
      // Act – call the unit
      // Assert – collaborator calls + return value only
    });
  });
});
```

## Output

- Write the test file. Do not modify the source file.
- After writing, run `cd backend && npm run test:unit` and fix any failures.
- Report the test count and any skipped tests.
