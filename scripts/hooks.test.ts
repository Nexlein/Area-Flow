// Tests for the git hooks: the secret scan blocks .env files and private keys, commit-msg enforces Conventional Commits.
// Runs the real hooks through `git commit` in throwaway repositories, so git provides `sh` on every platform.

import assert from 'node:assert/strict';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { after, test } from 'node:test';

const ROOT = resolve(import.meta.dirname, '..');
const TMP = mkdtempSync(join(tmpdir(), 'area-flow-hooks-'));
after(() => rmSync(TMP, { recursive: true, force: true }));

const EMPTY_CONFIG = join(TMP, 'gitconfig');
writeFileSync(EMPTY_CONFIG, '');

const EXE = process.platform === 'win32' ? '.exe' : '';
const PATH_DIRS = (process.env['PATH'] ?? '').split(delimiter).filter(Boolean);
/** Whether a PATH directory holds the given executable. */
const hasTool = (dir: string, name: string): boolean => existsSync(join(dir, `${name}${EXE}`));
const HAS_GITLEAKS = PATH_DIRS.some((dir) => hasTool(dir, 'gitleaks'));
const PATH_WITHOUT_GITLEAKS = PATH_DIRS.filter((dir) => !hasTool(dir, 'gitleaks'));
// gitleaks installed next to git (e.g. /usr/bin) cannot be hidden without hiding git too.
const CAN_HIDE_GITLEAKS = PATH_WITHOUT_GITLEAKS.some((dir) => hasTool(dir, 'git'));

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const PRIVATE_JWK = `${JSON.stringify(privateKey.export({ format: 'jwk' }), null, 2)}\n`;
const PUBLIC_JWK = `${JSON.stringify(publicKey.export({ format: 'jwk' }), null, 2)}\n`;

/** Environment for git in a test repository: no inherited GIT_* variables, no user or system config. */
function gitEnv(path: string[]): NodeJS.ProcessEnv {
  const inherited = Object.entries(process.env).filter(
    ([key]) => !key.startsWith('GIT_') && key.toUpperCase() !== 'PATH',
  );
  return {
    ...Object.fromEntries(inherited),
    PATH: path.join(delimiter),
    GIT_CONFIG_GLOBAL: EMPTY_CONFIG,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'Test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
  };
}

/** Runs git in `cwd`; returns its exit status and output. */
function git(cwd: string, args: string[], path = PATH_DIRS): SpawnSyncReturns<string> {
  return spawnSync('git', args, { cwd, env: gitEnv(path), encoding: 'utf8' });
}

let repos = 0;

// Each test installs only the hook it checks: the secret scan takes most of a second per commit.
const HOOK_SOURCES = { 'pre-commit': 'no-secrets.sh', 'commit-msg': 'commit-msg' } as const;
type Hook = keyof typeof HOOK_SOURCES;

/** A fresh repository with one of this repo's hooks installed: the secret scan or the message check. */
function freshRepo(hook: Hook): string {
  const dir = join(TMP, `repo-${repos++}`);
  const hooks = join(dir, '.hooks');
  mkdirSync(hooks, { recursive: true });
  copyFileSync(join(ROOT, '.husky', HOOK_SOURCES[hook]), join(hooks, hook));
  chmodSync(join(hooks, hook), 0o755);
  copyFileSync(join(ROOT, '.gitleaks.toml'), join(dir, '.gitleaks.toml'));
  assert.equal(git(dir, ['init', '-q', '-b', 'main']).status, 0);
  assert.equal(git(dir, ['config', 'core.hooksPath', '.hooks']).status, 0);
  return dir;
}

/** Stages the given files in a fresh repository and commits them; returns the result of `git commit`. */
function commit(
  files: Record<string, string>,
  message: string,
  { hook = 'pre-commit', path = PATH_DIRS }: { hook?: Hook; path?: string[] } = {},
): SpawnSyncReturns<string> {
  const dir = freshRepo(hook);
  for (const [name, body] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), body);
    assert.equal(git(dir, ['add', '--', name]).status, 0);
  }
  return git(dir, ['commit', '-q', '--allow-empty', '-m', message], path);
}

test('secret scan blocks .env files in any folder', () => {
  const result = commit({ 'config/.env.production': 'API_KEY=1\n' }, 'feat: add config');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /config\/\.env\.production must not be committed/);
});

test('secret scan lets .env.example through', () => {
  assert.equal(commit({ '.env.example': 'API_KEY=\n' }, 'docs: add the example env').status, 0);
});

test(
  'secret scan blocks a private JWK (gitleaks)',
  { skip: !HAS_GITLEAKS && 'gitleaks not installed (run: mise install)' },
  () => {
    const result = commit({ 'jwks.json': PRIVATE_JWK }, 'test: add a key');
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /jwk-private-key/);
  },
);

test(
  'secret scan blocks a private JWK (fallback regex, no gitleaks)',
  { skip: !CAN_HIDE_GITLEAKS && 'gitleaks shares its folder with git' },
  () => {
    const result = commit({ 'jwks.json': PRIVATE_JWK }, 'test: add a key', {
      path: PATH_WITHOUT_GITLEAKS,
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /fallback regex/);
  },
);

test('secret scan lets a public JWK through', () => {
  assert.equal(commit({ 'jwks.json': PUBLIC_JWK }, 'test: add a public key').status, 0);
});

test('commit-msg accepts Conventional Commits and merge commits', () => {
  for (const message of [
    'feat(engine): validate key paths on save',
    'fix!: drop the v1 route',
    "Merge branch 'dev'",
  ]) {
    assert.equal(commit({}, message, { hook: 'commit-msg' }).status, 0, message);
  }
});

test('commit-msg rejects any other first line', () => {
  for (const message of [
    'update stuff',
    'Feat: capitalized type',
    'feat(Engine): uppercase scope',
    'feat:no space',
  ]) {
    const result = commit({}, message, { hook: 'commit-msg' });
    assert.notEqual(result.status, 0, message);
    assert.match(result.stderr, /must follow Conventional Commits/, message);
  }
});
