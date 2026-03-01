# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**
- Framework: Jest (via `@testing-library/react`)
- Config: Not explicitly configured (uses Jest defaults)
- **Note:** `@types/jest` and `@testing-library/react` are NOT in `package.json` - this is a gap

**Assertion Library:**
- Jest built-in `expect`

**Run Commands:**
```bash
npm test                    # Run all tests (if configured)
# Note: No test script is currently defined in package.json
```

## Test File Organization

**Location:**
- Co-located with source files in `__tests__` subdirectory
- Example: `src/hooks/__tests__/useTaskCompletions.test.ts`

**Naming:**
- Pattern: `<filename>.test.ts` for unit tests
- Pattern: `<filename>.integration.test.ts` for integration tests
- Example: `useTaskCompletions.test.ts`, `useTaskCompletions.integration.test.ts`

**Structure:**
```
src/
├── hooks/
│   ├── useTaskCompletions.ts
│   └── __tests__/
│       ├── useTaskCompletions.test.ts       # Unit tests
│       └── useTaskCompletions.integration.test.ts  # Integration tests
```

## Test Structure

**Suite Organization:**
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskCompletions } from '../useTaskCompletions';
import * as supabaseModule from '@/lib/supabase';

// Mock the Supabase API
jest.mock('@/lib/supabase');

const mockTaskCompletionsApi = supabaseModule.taskCompletionsApi as jest.Mocked<typeof supabaseModule.taskCompletionsApi>;

describe('useTaskCompletions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompletionKey', () => {
    it('should generate correct key format', () => {
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      const key = result.current.getCompletionKey(1, date);
      
      expect(key).toBe('1_2025-02-16');
    });
  });
});
```

**Patterns:**
- Setup: `beforeEach` with `jest.clearAllMocks()` to reset mocks
- Test execution: Use `renderHook` from `@testing-library/react` for hooks
- Async handling: Use `await act(async () => { ... })` for state updates
- Assertions: Jest `expect` with matchers like `.toBe()`, `.toEqual()`, `.toHaveBeenCalledWith()`

## Mocking

**Framework:** Jest `jest.mock()`

**Patterns:**
```typescript
// Mock entire module
jest.mock('@/lib/supabase');

// Access mocked module
const mockTaskCompletionsApi = supabaseModule.taskCompletionsApi as jest.Mocked<typeof supabaseModule.taskCompletionsApi>;

// Mock implementation
mockTaskCompletionsApi.getCompletion.mockImplementation((taskId, date) => {
  const dateStr = date.toISOString().split('T')[0];
  if (dateStr === '2025-02-16') {
    return Promise.resolve('completed');
  }
  return Promise.resolve('pending');
});

// Mock resolved value
mockTaskCompletionsApi.setCompletion.mockResolvedValue(undefined);

// Mock rejected value
mockTaskCompletionsApi.setCompletion.mockRejectedValue(new Error('Supabase error'));
```

**What to Mock:**
- External services: Supabase client (`@/lib/supabase`)
- API calls that interact with databases or external systems

**What NOT to Mock:**
- Internal logic being tested
- Simple utility functions

## Fixtures and Factories

**Test Data:**
- Created inline within tests using literal values
- Example: `new Date('2025-02-16')`, `{ taskId: 1, date: ... }`

**Location:**
- No dedicated fixtures directory
- Test data defined at test level

## Coverage

**Requirements:** None enforced

**View Coverage:**
- No coverage script configured in `package.json`

## Test Types

**Unit Tests:**
- Focus: Individual hook functions and logic
- Example: `src/hooks/__tests__/useTaskCompletions.test.ts`
- Uses `renderHook` to test React hook behavior in isolation

**Integration Tests:**
- Focus: Real-world scenarios with actual Supabase database
- Example: `src/hooks/__tests__/useTaskCompletions.integration.test.ts`
- Tests against live database, includes cleanup
- Tests isolation, persistence, cross-browser sync, edge cases

**E2E Tests:**
- Not detected in codebase

## Common Patterns

**Async Testing:**
```typescript
// With act() for state updates
await act(async () => {
  await result.current.loadCompletionForDate(1, date);
});

// Testing final state after async operations
const status = result.current.getStatusOnDate(1, date);
expect(status).toBe('pending');
```

**Error Testing:**
```typescript
const error = new Error('Supabase error');
mockTaskCompletionsApi.setCompletion.mockRejectedValue(error);

// Trigger the operation
await act(async () => {
  await result.current.setCompletion(1, date, 'completed');
});

// Check error state
expect(result.current.error).toBeTruthy();
expect(result.current.error).toContain('Supabase error');
```

**Mocking Implementation:**
```typescript
mockTaskCompletionsApi.getCompletion.mockImplementation((taskId, date) => {
  const dateStr = date.toISOString().split('T')[0];
  // Return different values based on input
  if (dateStr === '2025-02-16') {
    return Promise.resolve('completed');
  }
  return Promise.resolve('pending');
});
```

**Cleanup in Integration Tests:**
```typescript
// Cleanup after test
await taskCompletionsApi.setCompletion(taskId, date, 'pending');
```

## Testing Gaps

**Missing Dependencies:**
- `@testing-library/react` - Not in package.json (but tests reference it)
- `@types/jest` - Not in package.json (causing LSP errors)
- Test script in package.json - Missing

**No Test Coverage Enforced:**
- No coverage thresholds
- Limited test files (only 2 test files found)

**Recommendations:**
1. Add test dependencies:
   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom @types/jest jest
   ```

2. Add test script to package.json:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage"
   }
   ```

3. Create jest.config.js:
   ```javascript
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['@testing-library/jest-dom'],
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   };
   ```

4. Expand test coverage to more hooks and utilities

---

*Testing analysis: 2026-03-02*
