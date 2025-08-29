Testing library and runner:
- These tests are authored using Vitest-style APIs (describe/it/expect) for maximum compatibility.
- If this repository uses Jest (detected via jest.config.*), a Jest wrapper spec is generated too.

How to run:
- Use the existing `npm test` / `pnpm test` / `yarn test` script in package.json at the repo or app level.
- If using Vitest: npx vitest run.
- If using Jest: npx jest.

Endpoints covered:
- GET / -> "Hello World!" plain text.
- GET /openapi.json -> OpenAPI JSON including info.title, version, and description.
- GET /api/docs -> Swagger UI HTML referencing /openapi.json.
- POST / (unsupported) -> 404 or 405.
- GET /non-existent -> 404.

Additional notes:
- The AI sub-route is mocked to avoid external side effects.
- Tests use app.request() (Fetch API) to avoid spinning up a network server.