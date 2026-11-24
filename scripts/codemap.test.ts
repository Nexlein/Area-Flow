// Tests for scripts/codemap.ts: purpose extraction per language and the rendered layout.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lineCount, parseBatch, parseIndex, purpose, render } from './codemap.ts';

test('Markdown: first heading, without the hashes', () => {
  assert.equal(purpose('docs/a.md', 'Intro text\n\n## Workflow model\n# Later'), 'Workflow model');
});

test('Markdown: a leading HTML comment wins over the heading', () => {
  const src = '<!-- Protocol of the spikes. Details below. -->\n\n# Back-end spikes\n';
  assert.equal(purpose('docs/a.md', src), 'Protocol of the spikes.');
  assert.equal(
    purpose('docs/a.md', '<!-- Protocol of the spikes --!>\n'),
    'Protocol of the spikes',
  );
});

test('line count: trailing newline ends the last line, empty file has none', () => {
  assert.equal(lineCount(''), 0);
  assert.equal(lineCount('a\nb\n'), 2);
  assert.equal(lineCount('a\nb'), 2);
});

test('JavaScript: first sentence of the leading // comment, across lines', () => {
  const src = '// Validates key paths\n// on save. Second sentence.\nexport const x = 1;';
  assert.equal(purpose('src/a.ts', src), 'Validates key paths on save.');
});

test('shebang and directives are skipped before the comment', () => {
  assert.equal(purpose('a.sh', '#!/bin/sh\n# Runs the hooks.\necho'), 'Runs the hooks.');
  assert.equal(
    purpose('a.tsx', "'use client';\n\n// The builder canvas.\n"),
    'The builder canvas.',
  );
});

test('tool pragmas and a YAML document start are not a purpose', () => {
  assert.equal(
    purpose('src/a.ts', '/* eslint-disable */\n// Generated API client.\n'),
    'Generated API client.',
  );
  assert.equal(
    purpose('docs/a.md', '<!-- prettier-ignore-start -->\n# Real title\n'),
    'Real title',
  );
  assert.equal(
    purpose('compose.yaml', '---\n# Local stack for development.\nservices: {}\n'),
    'Local stack for development.',
  );
});

test('"e.g." and "i.e." do not end the first sentence', () => {
  assert.equal(
    purpose('src/a.ts', '// Runs the engine, e.g. on save. Then more.\n'),
    'Runs the engine, e.g. on save.',
  );
});

test('block comments and Python docstrings', () => {
  assert.equal(
    purpose('A.java', '/**\n * Polls the mailbox.\n */\nclass A {}'),
    'Polls the mailbox.',
  );
  assert.equal(
    purpose('a.py', '"""Encrypts tokens at rest."""\nimport os'),
    'Encrypts tokens at rest.',
  );
});

test('no leading comment gives an empty purpose', () => {
  assert.equal(purpose('a.json', '{ "a": 1 }'), '');
  assert.equal(purpose('a.ts', 'export const a = 1; // trailing'), '');
});

test('long purposes are clipped', () => {
  const p = purpose('a.ts', `// ${'word '.repeat(60)}`);
  assert.ok(p.length <= 140 && p.endsWith('...'));
});

test('render groups by folder, root first, files without purpose on one line', () => {
  const md = render([
    { path: 'docs/b.md', lines: 3, purpose: 'B' },
    { path: 'README.md', lines: 10, purpose: 'Area-Flow' },
    { path: '.gitignore', lines: 5, purpose: '' },
  ]);
  assert.match(
    md,
    /## \(root\)\n\n- `README\.md` \(10\): Area-Flow\n- Also: `\.gitignore`\n\n## docs\n\n- `b\.md` \(3\): B\n$/,
  );
});

test('parseIndex reads NUL-separated entries, keeps non-ASCII and tab paths, drops submodules', () => {
  const out =
    '100644 aaa 0\tdocs/réunion/notes.md\0' +
    '160000 bbb 0\tvendor/sub\0' +
    '100644 ccc 0\tREADME.md\0' +
    '100644 ddd 0\tdocs/a\tb.md\0';
  assert.deepEqual(parseIndex(out), [
    { path: 'docs/réunion/notes.md', sha: 'aaa' },
    { path: 'README.md', sha: 'ccc' },
    { path: 'docs/a\tb.md', sha: 'ddd' },
  ]);
});

test('parseBatch splits blobs by their declared byte size, multi-byte text included', () => {
  const a = 'é\nline\n';
  const b = 'x';
  const buf = Buffer.concat([
    Buffer.from(`aaa blob ${Buffer.byteLength(a)}\n${a}\n`),
    Buffer.from('zzz missing\n'),
    Buffer.from(`bbb blob ${Buffer.byteLength(b)}\n${b}\n`),
  ]);
  const blobs = parseBatch(buf);
  assert.equal(blobs.get('aaa'), a);
  assert.equal(blobs.get('bbb'), b);
  assert.equal(blobs.has('zzz'), false);
});
