These tests validate the local development server bootstrap logic found in local.test.ts.
They:
- Mock @hono/node-server.serve to avoid binding a real port.
- Mock the app module to supply a fetch handler.
- Verify port selection via PORT env var and console logging.

Test framework: the repository's existing test runner (Jest or Vitest) is used; these tests rely only on the following common APIs:
- jest.mock / vi.mock
- describe/it/test, expect

If switching frameworks, this file should remain largely compatible with minimal changes.