This directory contains Jest tests for backend configuration.

- Framework: Jest (TypeScript where applicable).
- Focus: Guard against regressions in apps/backend/jest.config.ts by asserting critical fields.
- If the config moves or is converted to JS, the loader in jest.config.spec.ts attempts multiple resolution strategies.

Do not add new dependencies; align with repository-wide Jest setup.