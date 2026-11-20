#!/usr/bin/env node
// Turns this template into a new app. Asks each question in the terminal, then:
//   - writes .env and app.json, and renames the app in every tracked file
//   - adds a placeholder for src/config/build-info.json (gitignored)
//   - keeps or removes the demo screens
//
//   npm run setup

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

import { applyDemoChoice } from './demo/demo.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const toPath = (rel) => join(root, rel);
const readText = (rel) => readFileSync(toPath(rel), 'utf8');
const readJson = (rel) => JSON.parse(readText(rel));
const writeText = (rel, text) => writeFileSync(toPath(rel), text);
const writeJson = (rel, value) =>
  writeText(rel, JSON.stringify(value, null, 2) + '\n');

function git(...args) {
  return execFileSync('git', args, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'ignore'],
  }).toString();
}

function trackedFiles() {
  try {
    return git('ls-files', '-z').split('\0').filter(Boolean);
  } catch {
    return [];
  }
}

// Files that must not be rewritten by the rename.
const SKIP_FILES = new Set(['package-lock.json', 'scripts/init.mjs']);
const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.pdf',
  '.ttf',
  '.otf',
]);

const TOTAL_QUESTIONS = 5;
const oldName = readJson('app.json').expo.name;

// One reader for the whole session. Reads a line at a time, so it works the
// same in a terminal and with piped input.
const rl = createInterface({ input: process.stdin });
const lines = rl[Symbol.asyncIterator]();

async function readLine(prompt) {
  process.stdout.write(prompt);
  const next = await lines.next();
  if (next.done) {
    console.log(
      '\nInput ended before the setup finished. Nothing was changed.',
    );
    process.exit(1);
  }
  return next.value.trim();
}

// Prints "[3/7] Title" and the short notes under it.
function question(step, title, notes = []) {
  console.log(`\n[${step}/${TOTAL_QUESTIONS}] ${title}`);
  for (const note of notes) console.log(`      ${note}`);
}

// Asks for text until it passes `check`. Enter takes `fallback`, or skips
// the question when `optional`.
async function ask(
  step,
  title,
  { notes = [], fallback = '', optional = false, check } = {},
) {
  question(step, title, notes);
  if (fallback) console.log(`      Press Enter for: ${fallback}`);
  if (optional) console.log('      Optional: press Enter to skip.');
  for (;;) {
    const value = (await readLine('  > ')) || fallback;
    if (!value) {
      if (optional) return '';
      console.log('      Please type a value.');
      continue;
    }
    const problem = check?.(value);
    if (problem) {
      console.log(`      ${problem}`);
      continue;
    }
    return value;
  }
}

// Asks a yes/no question with no step number. Enter means yes.
async function confirm(text) {
  const answer = (
    await readLine(`
 y/n, Enter = yes > `)
  ).toLowerCase();
  if (!answer || answer === 'y' || answer === 'yes') return true;
  return false;
}

// A y/n question. Enter takes the default. Anything else asks again.
async function yesNo(step, title, defaultYes, notes = []) {
  question(step, title, notes);
  const hint = defaultYes ? 'yes' : 'no';
  for (;;) {
    const answer = (await readLine(`  y/n, Enter = ${hint} > `)).toLowerCase();
    if (!answer) return defaultYes;
    if (answer === 'y' || answer === 'yes') return true;
    if (answer === 'n' || answer === 'no') return false;
    console.log('      Please type y or n.');
  }
}

const checkName = (v) =>
  /^[A-Za-z][A-Za-z0-9]*$/.test(v)
    ? null
    : 'Use letters and digits only, starting with a letter. Example: MyApp';
const checkBundleId = (v) =>
  /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(v)
    ? null
    : 'Use letters, digits, dots and dashes. Example: com.yourname.MyApp';
const checkTeamId = (v) =>
  /^[A-Z0-9]{10}$/.test(v)
    ? null
    : 'A team ID is 10 capital letters or digits. Example: Z23JXMNT76';
const checkText = (v) =>
  /[\r\n"']/.test(v) ? 'Avoid quotes and line breaks.' : null;
console.log('Setup: answer each question. Type a value and press Enter.');

const name = await ask(1, 'App name', {
  notes: [
    'One word, letters and digits only. It is the name under the app icon.',
  ],
  check: checkName,
});
const bundleId = await ask(2, 'iOS bundle ID', {
  notes: [
    'A unique ID for Apple, like com.yourname.MyApp.',
    'If a build says the ID is taken, choose another. Details: docs/IPHONE.md',
  ],
  // A random middle part keeps the default unique, since Apple rejects IDs already taken.
  fallback: `com.${Math.random().toString(36).slice(2, 10)}.${name}`,
  check: checkBundleId,
});
const teamId = await ask(3, 'Apple team ID', {
  notes: [
    'The 10-character code of your signing team, e.g. Z23JXMNT76.',
    'To find it, paste this in another terminal',
    'and look for OU=... in the output (the code after OU= is the team ID):',
    '',
    String.raw`security find-certificate -a -c "Apple Development" -p | awk 'BEGIN{c=""} /BEGIN CERTIFICATE/{c=""} {c=c $0 "\n"} /END CERTIFICATE/{printf "%s", c | "openssl x509 -noout -subject"; close("openssl x509 -noout -subject")}'`,
  ],
  check: checkTeamId,
});
const username = await ask(4, 'Username', {
  notes: ['Any text. The Info tab shows it.'],
  optional: true,
  check: checkText,
});
const keepDemo = await yesNo(5, 'Keep the demo screens?', true, [
  'Example screens for each phone feature, with buttons to try.',
  'Remove them later with menu option 9 in: npm run iphone',
]);

console.log('\nThese values will be used:');
const summary = [
  ['App name', name],
  ['iOS bundle ID', bundleId],
  ['Apple team ID', teamId],
  ['Username', username || '(not set)'],
  ['Demo screens', keepDemo ? 'kept' : 'removed'],
];
for (const [label, value] of summary) {
  console.log(`  ${label.padEnd(18)}${value}`);
}
console.log('  .env will be overwritten.');

if (!(await confirm('Apply these values?'))) {
  rl.close();
  console.log('Nothing changed.');
  process.exit(0);
}
rl.close();

// 1. Rename the app in every tracked text file.
if (oldName !== name) {
  for (const file of trackedFiles()) {
    if (SKIP_FILES.has(file) || BINARY_EXTENSIONS.has(extname(file))) continue;
    if (!existsSync(toPath(file))) continue;
    const text = readText(file);
    if (!text.includes(oldName)) continue;
    writeText(file, text.split(oldName).join(name));
  }
}

// 2. app.json and package.json.
const appJson = readJson('app.json');
appJson.expo.name = name;
appJson.expo.slug = name;
writeJson('app.json', appJson);

const pkg = readJson('package.json');
pkg.name = name.toLowerCase();
writeJson('package.json', pkg);

// 3. .env, read by app.config.ts and the build info script.
writeText(
  '.env',
  [
    '# Written by `npm run setup`. .env is gitignored.',
    `IOS_BUNDLE_ID=${bundleId}`,
    `APPLE_TEAM_ID=${teamId}`,
    `username=${username}`,
    '',
  ].join('\n'),
);

// 4. Placeholder build info, so the app starts before the first build.
const BUILD_INFO = 'src/config/build-info.json';
try {
  git('rm', '--cached', '--quiet', '--ignore-unmatch', BUILD_INFO);
} catch {
  // Not a git repo, or nothing to untrack.
}
writeJson(BUILD_INFO, {
  appName: name,
  bundleVersion: appJson.expo.version,
  packageVersion: pkg.version,
  buildNumber: 'not built yet',
  gitCommit: 'not built yet',
  gitBranch: 'not built yet',
  gitDirty: 'not built yet',
  configuration: 'not built yet',
  builtAtIso: 'not built yet',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  builtAtLocal: 'not built yet',
  nodeVersion: process.version,
});

// 5. Demo screens.
applyDemoChoice(keepDemo);

// 6. README for the new app.
writeText(
  'README.md',
  `# ${name}

An Expo app for iPhone.

## Commands

| Command | What it does |
| --- | --- |
| \`npm run iphone\` | Opens the menu. Install the app on your iPhone, start the dev server, or make a file to share. Start here |
| \`npm start\` | Starts the dev server only |
| \`npm run check\` | Checks the code: TypeScript and lint |
| \`npm run setup\` | Asks the setup questions again |

Setup, signing and troubleshooting: [docs/IPHONE.md](docs/IPHONE.md).
`,
);

console.log(`
Done. Next step:
  npm run iphone   then choose 2 to install the app on your iPhone, then choose 1 and open the app on the phone.`);
if (oldName !== name) {
  console.log(`\nRenamed ${oldName} to ${name} in the tracked files.`);
}
