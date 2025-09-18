export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  moduleNameMapper: {
    '^cloudflare:workers$': '<rootDir>/test/__mocks__/cloudflareWorkersMock.ts',
  },
}
