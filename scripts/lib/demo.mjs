// Keeps or removes the demo screens. Used by `npm run setup` and by
// scripts/remove-demo.mjs, so both do exactly the same thing.
//
// The demo is the src/demo folder, plus the lines in the files below that sit
// between the comments "demo:start" and "demo:end".

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Comment lines that mark the demo, e.g. "// demo:start".
const DEMO_LINE = /^[^\n]*demo:(?:start|end)[^\n]*\n/gm;
// A whole demo block, from its start comment to its end comment.
const DEMO_BLOCK = /^[^\n]*demo:start[^\n]*\n[\s\S]*?^[^\n]*demo:end[^\n]*\n/gm;
const DEMO_FILES = [
  'src/navigation/registry.ts',
  'src/navigation/bottom/BottomNavLayout.tsx',
];

// Keeps the demo (removes only the marker comments), or removes it completely.
export function applyDemoChoice(keep) {
  for (const file of DEMO_FILES) {
    const path = join(root, file);
    const text = readFileSync(path, 'utf8');
    writeFileSync(
      path,
      keep ? text.replace(DEMO_LINE, '') : text.replace(DEMO_BLOCK, ''),
    );
  }
  if (!keep)
    rmSync(join(root, 'src', 'demo'), { recursive: true, force: true });
}
