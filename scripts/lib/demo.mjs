// Keeps or removes the demo screens. Used by `npm run setup` and by
// scripts/remove-demo.mjs, so both do exactly the same thing.
//
// The demo is the src/demo folder, plus the lines in the files below that sit
// between the comments "demo:start" and "demo:end". Those comments stay in
// place when the demo is kept, so the demo can be removed later.

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// A whole demo block, from its start comment to its end comment.
const DEMO_BLOCK = /^[^\n]*demo:start[^\n]*\n[\s\S]*?^[^\n]*demo:end[^\n]*\n/gm;
const DEMO_FILES = ['src/navigation/registry.ts'];

// Keeping the demo changes nothing. Removing it deletes src/demo/ and the
// blocks between the markers. It stops first, without changing anything, if
// a marker is missing, so the app is never left with broken imports.
export function applyDemoChoice(keep) {
  if (keep) return;

  const texts = DEMO_FILES.map((file) => {
    const path = join(root, file);
    const text = readFileSync(path, 'utf8');
    const starts = (text.match(/demo:start/g) ?? []).length;
    const ends = (text.match(/demo:end/g) ?? []).length;
    if (starts === 0 || starts !== ends) {
      throw new Error(
        `Cannot remove the demo: ${file} does not have matching "demo:start" and "demo:end" comments. Nothing was changed.`,
      );
    }
    return { path, text };
  });

  for (const { path, text } of texts) {
    writeFileSync(path, text.replace(DEMO_BLOCK, ''));
  }
  rmSync(join(root, 'src', 'demo'), { recursive: true, force: true });
}
