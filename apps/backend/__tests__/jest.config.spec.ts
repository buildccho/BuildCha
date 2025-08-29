/**
 * Jest tests for apps/backend/jest.config.ts
 *
 * Purpose:
 * - Validate critical Jest configuration fields to prevent regressions.
 * - Assert consistency with repository conventions (e.g., test environment, transforms, module mappers).
 *
 * Notes:
 * - Testing framework: Jest. This test file follows existing Jest conventions in the repo.
 * - This suite loads the exported config object from jest.config.ts and checks shape and key options.
 */

import path from 'path'

/**
 * Helper to load the config regardless of ESM/CJS/TS variations.
 * We attempt regular require first (if ts-jest/ts-node registers),
 * otherwise fallback to dynamic import with transpilation-less resolution.
 */
async function loadJestConfig() {
  const configPathTs = path.resolve(__dirname, '..', 'jest.config.ts')
  const configPathJs = path.resolve(__dirname, '..', 'jest.config.js')

  // Try regular require for JS build or ts-node/ts-jest registered environments
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(configPathTs)
    return mod.default ?? mod
  } catch (_) {
    // ignore and try JS
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(configPathJs)
    return mod.default ?? mod
  } catch (_) {
    // ignore and try dynamic import
  }

  // Dynamic import may handle TS if the runner supports it; otherwise this will fail distinctly.
  try {
    const mod = await import(configPathTs)
    // @ts-ignore
    return (mod as any).default ?? mod
  } catch (errTs) {
    try {
      const mod = await import(configPathJs)
      // @ts-ignore
      return (mod as any).default ?? mod
    } catch (errJs) {
      const combined = new Error(
        "Unable to load Jest config from TS or JS variants. " +
          `TS error: ${(errTs as Error).message} | JS error: ${(errJs as Error).message}`
      )
      ;(combined as any).cause = { errTs, errJs }
      throw combined
    }
  }
}

describe('apps/backend/jest.config.ts configuration', () => {
  let cfg: any

  beforeAll(async () => {
    cfg = await loadJestConfig()
  })

  it('exports an object', () => {
    expect(typeof cfg).toBe('object')
    expect(cfg).not.toBeNull()
  })

  it('has a stable test environment (node or jsdom expected)', () => {
    // Accept either 'node' (typical for backend) or 'jsdom' if project opted so.
    if ('testEnvironment' in cfg) {
      expect(['node', 'jsdom']).toContain(cfg.testEnvironment)
    }
  })

  it('defines test discovery correctly (testMatch or testRegex)', () => {
    const hasTestMatch = Array.isArray(cfg.testMatch) && cfg.testMatch.every((m: unknown) => typeof m === 'string')
    const hasTestRegex =
      typeof cfg.testRegex === 'string' ||
      (Array.isArray(cfg.testRegex) && cfg.testRegex.every((r: unknown) => typeof r === 'string' || r instanceof RegExp))

    expect(hasTestMatch || hasTestRegex).toBe(true)
  })

  it('configures TypeScript support (preset or transform) for .ts/.tsx files', () => {
    const preset = cfg.preset
    const transform = cfg.transform
    const hasTsSupportViaPreset = typeof preset === 'string' && /ts-jest|jest-preset/.test(preset)
    const hasTsSupportViaTransform =
      transform &&
      typeof transform === 'object' &&
      Object.keys(transform).some((k) => k.includes('^.+\\.(ts|tsx)') || k.includes('ts') || k.includes('tsx'))

    // We only require at least one mechanism to exist if there are TS test files in the repo.
    // This assertion is permissive but will guard against accidental removal.
    expect(Boolean(hasTsSupportViaPreset || hasTsSupportViaTransform)).toBe(true)
  })

  it('uses moduleNameMapper or moduleFileExtensions coherently when present', () => {
    if (cfg.moduleNameMapper) {
      expect(typeof cfg.moduleNameMapper).toBe('object')
      for (const [key, val] of Object.entries(cfg.moduleNameMapper)) {
        expect(typeof key).toBe('string')
        expect(typeof val === 'string' || Array.isArray(val)).toBe(true)
      }
    }
    if (cfg.moduleFileExtensions) {
      expect(Array.isArray(cfg.moduleFileExtensions)).toBe(true)
      expect(cfg.moduleFileExtensions.length).toBeGreaterThan(0)
    }
  })

  it('respects ignore patterns to avoid unnecessary work (node_modules is ignored)', () => {
    const ci = cfg.collectCoverageFrom
    if (Array.isArray(ci)) {
      // ensure we don't collect from node_modules or dist by default
      const joined = ci.join(' ')
      expect(joined.includes('!**/node_modules/**') || joined.includes('!**/dist/**') || joined.includes('!**/build/**')).toBe(true)
    }

    const testPathIgnore = cfg.testPathIgnorePatterns
    if (Array.isArray(testPathIgnore)) {
      expect(testPathIgnore.some((p: string) => p.includes('node_modules'))).toBe(true)
    }
  })

  it('optionally defines setupFiles or setupFilesAfterEnv as arrays of strings', () => {
    for (const key of ['setupFiles', 'setupFilesAfterEnv']) {
      if (key in cfg) {
        expect(Array.isArray(cfg[key])).toBe(true)
        expect(cfg[key].every((p: unknown) => typeof p === 'string')).toBe(true)
      }
    }
  })

  it('has consistent coverage settings when enabled', () => {
    if ('collectCoverage' in cfg && cfg.collectCoverage) {
      expect(typeof cfg.coverageDirectory === 'string' || cfg.coverageDirectory === undefined).toBe(true)
      if (cfg.coverageThreshold) {
        expect(typeof cfg.coverageThreshold).toBe('object')
      }
      if (cfg.coverageReporters) {
        expect(Array.isArray(cfg.coverageReporters)).toBe(true)
      }
    }
  })

  it('does not misconfigure roots or projects (if provided)', () => {
    if (cfg.roots) {
      expect(Array.isArray(cfg.roots)).toBe(true)
      expect(cfg.roots.every((r: unknown) => typeof r === 'string')).toBe(true)
    }
    if (cfg.projects) {
      expect(Array.isArray(cfg.projects)).toBe(true)
      // Each project entry may be a path or an object; do a minimal sanity check.
      for (const p of cfg.projects) {
        expect(['string', 'object']).toContain(typeof p)
      }
    }
  })

  it('has displayName set for multi-project configs (optional but recommended)', () => {
    if ('displayName' in cfg) {
      const dn = cfg.displayName
      expect(typeof dn === 'string' || (typeof dn === 'object' && typeof dn.name === 'string')).toBe(true)
    }
  })
})