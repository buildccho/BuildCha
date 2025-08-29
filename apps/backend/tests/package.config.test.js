// Configuration validation tests for apps/backend/package.json
// Framework note: Uses Node's built-in 'assert' for zero-dependency validation.
// If the repo uses Jest/Vitest/Mocha, it can run this file as-is.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('backend package.json configuration', () => {
  let pkg;
  const pkgPath = path.join(__dirname, '..', 'package.json');

  before(() => {
    const raw = fs.readFileSync(pkgPath, 'utf8');
    pkg = JSON.parse(raw);
  });

  it('has required top-level metadata', () => {
    assert.strictEqual(pkg.name, 'backend', 'name should be "backend"');
    assert.strictEqual(pkg.version, '1.0.0', 'version should be "1.0.0"');
    assert.ok(typeof pkg.description === 'string', 'description should be a string');
    assert.ok(pkg.main, 'main should be defined');
  });

  it('main points to a dist-built JS entry under dist/src/functions/index.js', () => {
    assert.strictEqual(
      pkg.main,
      'dist/src/functions/index.js',
      'main should be "dist/src/functions/index.js"'
    );
    assert.ok(pkg.main.endsWith('.js'), 'main must end with .js');
    assert.ok(pkg.main.startsWith('dist/'), 'main should point into dist/');
  });

  it('defines required scripts with expected commands', () => {
    const scripts = pkg.scripts || {};
    // Presence
    ['build','watch','clean','prestart','start','dev','migrate','test'].forEach(key => {
      assert.ok(scripts[key], `scripts.${key} should exist`);
      assert.strictEqual(typeof scripts[key], 'string', `scripts.${key} should be a string`);
      assert.notStrictEqual(scripts[key].trim(), '', `scripts.${key} should not be empty`);
    });

    // Values
    assert.strictEqual(scripts.build, 'tsc', 'build should be "tsc"');
    assert.strictEqual(scripts.watch, 'tsc -w', 'watch should be "tsc -w"');
    assert.strictEqual(scripts.clean, 'rimraf dist', 'clean should be "rimraf dist"');
    assert.strictEqual(
      scripts.prestart,
      'pnpm run clean && pnpm run build',
      'prestart should chain clean and build'
    );
    assert.strictEqual(scripts.start, 'func start', 'start should be "func start"');
    assert.strictEqual(scripts.dev, 'tsx watch src/local.ts', 'dev should be "tsx watch src/local.ts"');
    assert.strictEqual(
      scripts.migrate,
      'prisma migrate dev --schema prisma/schema.prisma',
      'migrate should be prisma migrate dev with expected schema path'
    );
    assert.match(
      scripts.test,
      /^echo\s+"?No tests yet\.\.\."?"?$/,
      'test script should be the placeholder echo per snippet'
    );
  });

  it('declares required runtime dependencies with semver ranges', () => {
    const d = pkg.dependencies || {};
    // Expected presence
    const expected = {
      '@azure/functions': '^4.0.0',
      '@hono/node-server': '^1.17.1',
      '@hono/swagger-ui': '^0.5.2',
      '@hono/zod-validator': '^0.7.2',
      '@langchain/core': '^0.3.66',
      '@langchain/openai': '^0.6.9',
      '@marplex/hono-azurefunc-adapter': '^1.0.1',
      'dotenv': '^17.2.1',
      'hono': '^4.8.4',
      'hono-openapi': '0.4.8',
      'langchain': '^0.3.30',
      'prisma': '^6.14.0',
      'tsx': '^4.20.3',
      'zod': '^4.0.17',
      'zod-openapi': '^5.3.1'
    };

    for (const [name, range] of Object.entries(expected)) {
      assert.ok(d[name], `dependency ${name} should be present`);
      assert.strictEqual(d[name], range, `dependency ${name} should be pinned to ${range}`);
    }

    // Sanity: ensure all ranges are strings and not empty
    Object.entries(d).forEach(([name, range]) => {
      assert.strictEqual(typeof range, 'string', `dependency ${name} version must be a string`);
      assert.ok(range.trim(), `dependency ${name} version must be non-empty`);
    });
  });

  it('declares required devDependencies with semver ranges', () => {
    const dd = pkg.devDependencies || {};
    const expected = {
      '@prisma/client': '^6.14.0',
      '@types/node': '18.x',
      '@types/swagger-ui-dist': '^3.30.6',
      'concurrently': '^9.2.0',
      'rimraf': '^5.0.0',
      'typescript': '^5.8.3'
    };

    for (const [name, range] of Object.entries(expected)) {
      assert.ok(dd[name], `devDependency ${name} should be present`);
      assert.strictEqual(dd[name], range, `devDependency ${name} should be pinned to ${range}`);
    }

    // Sanity: ensure all ranges are strings and not empty
    Object.entries(dd).forEach(([name, range]) => {
      assert.strictEqual(typeof range, 'string', `devDependency ${name} version must be a string`);
      assert.ok(range.trim(), `devDependency ${name} version must be non-empty`);
    });
  });

  it('has no unexpected top-level keys missing from snippet', () => {
    // Allow only the known keys from the provided snippet.
    const allowed = new Set(['name','version','description','main','scripts','dependencies','devDependencies']);
    Object.keys(pkg).forEach(k => {
      assert.ok(allowed.has(k), `Unexpected top-level key detected: ${k}`);
    });
  });

  it('scripts use expected tooling names', () => {
    const s = pkg.scripts;
    assert.match(s.build, /^tsc(\s|$)/, 'build should invoke tsc');
    assert.match(s.watch, /^tsc\s+-w$/, 'watch should invoke tsc -w');
    assert.match(s.clean, /^rimraf\s+dist$/, 'clean should invoke rimraf dist');
    assert.match(s.prestart, /^pnpm\s+run\s+clean\s+&&\s+pnpm\s+run\s+build$/, 'prestart chaining via pnpm');
    assert.match(s.start, /^func\s+start$/, 'start should invoke Azure Functions core tools');
    assert.match(s.dev, /^tsx\s+watch\s+src\/local\.ts$/, 'dev should use tsx watch on src/local.ts');
    assert.match(s.migrate, /^prisma\s+migrate\s+dev\s+--schema\s+prisma\/schema\.prisma$/, 'migrate command shape');
  });

  it('dependency ranges use caret where expected (except explicit pin)', () => {
    const d = pkg.dependencies || {};
    const caretExpected = [
      '@azure/functions',
      '@hono/node-server',
      '@hono/swagger-ui',
      '@hono/zod-validator',
      '@langchain/core',
      '@langchain/openai',
      '@marplex/hono-azurefunc-adapter',
      'dotenv',
      'hono',
      'langchain',
      'prisma',
      'tsx',
      'zod',
      'zod-openapi'
    ];
    caretExpected.forEach(name => {
      assert.ok(d[name].startsWith('^'), `${name} should use a caret semver`);
    });
    // One explicitly pinned without caret per snippet:
    assert.strictEqual(d['hono-openapi'], '0.4.8', 'hono-openapi should be pinned without caret');
  });
});