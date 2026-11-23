// Claude Code PostToolUse hook: formats each file Claude edits with the repo's Prettier.
// Exit 2 sends the error back to Claude so it fixes it; files Prettier does not handle are left alone.
// Plain Node, so it behaves the same on Windows. Add the stack's linters here once they are chosen.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { text } from 'node:stream/consumers';

const root = resolve(process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd());

let file: string;
try {
  const input = JSON.parse(await text(process.stdin)) as { tool_input?: { file_path?: string } };
  file = resolve(input.tool_input?.file_path ?? '');
} catch {
  process.exit(0); // not a tool call we understand
}
const inProject = relative(root, file);
const outside = inProject === '..' || inProject.startsWith(`..${sep}`) || isAbsolute(inProject);
if (!existsSync(file) || outside) process.exit(0);

let prettier: typeof import('prettier');
try {
  prettier = await import('prettier');
} catch {
  process.exit(0); // `npm install` not run yet
}

const ignorePath = [resolve(root, '.gitignore'), resolve(root, '.prettierignore')];
const info = await prettier.getFileInfo(file, { ignorePath });
if (info.ignored || !info.inferredParser) process.exit(0);

try {
  const source = readFileSync(file, 'utf8');
  const options = { ...(await prettier.resolveConfig(file)), filepath: file };
  const formatted = await prettier.format(source, options);
  if (formatted !== source) writeFileSync(file, formatted);
} catch (error) {
  console.error(
    `Prettier could not format ${inProject}: ${error instanceof Error ? error.message : error}`,
  );
  process.exit(2);
}
