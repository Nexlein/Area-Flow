// Runs Prettier on the files git tracks only, so untracked personal notes never block a check or get rewritten.
// Usage: node scripts/format.mjs --check | --write (npm run format:check, npm run format). Works the same on Windows.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import * as prettier from 'prettier';

const write = process.argv.includes('--write');
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && existsSync(f));

let unformatted = 0;
for (const file of files) {
  const info = await prettier.getFileInfo(file, { ignorePath: ['.gitignore', '.prettierignore'] });
  if (info.ignored || !info.inferredParser) continue;
  const options = { ...(await prettier.resolveConfig(file)), filepath: file };
  const source = readFileSync(file, 'utf8');
  if (write) {
    const formatted = await prettier.format(source, options);
    if (formatted !== source) writeFileSync(file, formatted);
  } else if (!(await prettier.check(source, options))) {
    console.error(`[warn] ${file}`);
    unformatted++;
  }
}

if (unformatted) {
  console.error(`${unformatted} file(s) not formatted: run npm run format.`);
  process.exit(1);
}
console.log(write ? 'Formatted tracked files.' : 'All tracked files are formatted.');
