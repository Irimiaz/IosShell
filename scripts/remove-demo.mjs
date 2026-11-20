#!/usr/bin/env node
// Removes the demo screens from the app: the src/demo folder, and the demo's
// entries in the navigation. The libraries in package.json stay, so you can
// still use them. Run it with `npm run iphone` (option 9), or directly.

import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { join } from 'node:path';

import { applyDemoChoice, root } from './lib/demo.mjs';

if (!existsSync(join(root, 'src', 'demo'))) {
  console.log('The demo is already removed. Nothing to do.');
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = (
  await rl.question(
    'Remove the demo screens in src/demo/? This cannot be undone without git. (y/n): ',
  )
)
  .trim()
  .toLowerCase();
rl.close();

if (answer !== 'y' && answer !== 'yes') {
  console.log('Nothing changed.');
  process.exit(0);
}

try {
  applyDemoChoice(false);
} catch (error) {
  console.log(error.message);
  process.exit(1);
}
console.log(
  'Demo removed. Dashboard and Info are still there. The libraries in package.json were kept.',
);
