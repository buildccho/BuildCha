This folder contains configuration validation tests for apps/backend/package.json.

Test runner:
- These tests are plain Node + assert. They can run with Node's built-in test runner (node --test) or any existing test framework in the repo.
- If no runner is configured, you can run:
    pnpm --filter backend run test:config