#!/usr/bin/env node
// Turns this template into a new app. Asks for each value in the terminal, then:
//   - writes .env and app.json, and renames the app in every tracked file
//   - adds a placeholder for src/config/build-info.json (gitignored)
//   - optionally removes the demo screens
//   - optionally replaces the git history with a fresh one
//
//   npm run setup

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

import { applyDemoChoice } from './lib/demo.mjs';

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

const oldName = readJson('app.json').expo.name;
const rl = createInterface({ input: process.stdin });
// Reads lines one at a time. Works the same in a terminal and with piped input.
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

// Prints the explanation shown above a question.
function printHelp(lines) {
  for (const line of lines) console.log(`  ${line}`);
  if (lines.length) console.log();
}

// Asks until the answer passes `check`. An empty answer takes `fallback`,
// or is skipped when `optional`. `help` explains the value before the prompt.
async function ask(
  label,
  { fallback = '', optional = false, check, help = [] } = {},
) {
  printHelp(help);
  for (;;) {
    const hint = fallback
      ? ` [${fallback}]`
      : optional
        ? ' (optional, Enter to skip)'
        : '';
    const answer = await readLine(`${label}${hint}: `);
    const value = answer || fallback;
    if (!value) {
      if (optional) return '';
      console.log('  Please enter a value.');
      continue;
    }
    const problem = check?.(value);
    if (problem) {
      console.log(`  ${problem}`);
      continue;
    }
    return value;
  }
}

// Asks a y/n question. Type y or n (or yes / no). Enter takes the default,
// which is shown in capitals. Anything else asks again.
async function yesNo(label, defaultYes, help = []) {
  printHelp(help);
  const hint = defaultYes ? 'y/n, Enter = y' : 'y/n, Enter = n';
  for (;;) {
    const answer = (await readLine(`${label} (${hint}): `)).toLowerCase();
    if (!answer) return defaultYes;
    if (['y', 'yes'].includes(answer)) return true;
    if (['n', 'no'].includes(answer)) return false;
    console.log('  Please type y or n.');
  }
}

const checkName = (v) =>
  /^[A-Za-z][A-Za-z0-9]*$/.test(v)
    ? null
    : 'Use letters and digits only, starting with a letter (e.g. MyApp).';
const checkBundleId = (v) =>
  /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(v)
    ? null
    : 'Use the form com.yourname.MyApp (letters, digits, dots and dashes).';
const checkTeamId = (v) =>
  /^[A-Z0-9]{10}$/.test(v)
    ? null
    : 'A team ID is 10 capital letters or digits, e.g. Z23JXMNT76.';
const checkText = (v) =>
  /[\r\n"']/.test(v) ? 'Avoid quotes and line breaks.' : null;

console.log(
  'Sets this repo up as a new app. Press Enter to accept the value in brackets.\n',
);

const name = await ask('App name (one word, no spaces)', {
  fallback: oldName,
  check: checkName,
  help: [
    'What: the name of the app. It is shown under the icon on the phone and',
    'used as the Xcode project name by the build scripts.',
    'Rules: one word, letters and digits only, starting with a letter.',
    'Nothing to look up. You choose it.',
  ],
});
const bundleId = await ask('iOS bundle ID', {
  fallback: `com.yourname.${name}`,
  check: checkBundleId,
  help: [
    'What: the unique ID of the app for Apple, written like a reversed web',
    'address: com.<your name>.<app name>, e.g. com.janedoe.MyApp.',
    'Nothing to look up. You choose it. It must be unique across all Apple',
    'developer accounts: if a build says "Bundle identifier is not available",',
    'change it. It is stored in .env as IOS_BUNDLE_ID.',
    'More: docs/IPHONE.md#values-in-env',
  ],
});
const teamId = await ask('Apple team ID', {
  optional: true,
  check: checkTeamId,
  help: [
    'What: the signing team of the Apple ID you install with. A 10-character',
    'code, e.g. Z23JXMNT76. Leave it empty to let Xcode choose the team.',
    'Only set it if you have several Apple IDs in Xcode.',
    'Where to find it: docs/IPHONE.md#apple_team_id.',
  ],
});
const username = await ask('Username, shown on the Info tab', {
  optional: true,
  check: checkText,
  help: [
    'What: any text, e.g. your name. The Info tab shows it, and the app reads it',
    'as Constants.expoConfig.extra.username. Optional. It does not have to match',
    'anything at Apple.',
  ],
});
const keepDemo = await yesNo('Keep the demo screens?', true, [
  'What: the demo screens in src/demo/ show each device feature with buttons',
  'to try. Yes: keep them as examples. No: delete them, leaving only the',
  'Dashboard and Info screens.',
]);
const freshGit = await yesNo(
  "Start a fresh git history (removes this repo's history and remote)?",
  true,
  [
    "What: git keeps this template's history, and a link to its repo (origin).",
    'Yes: delete the history and the link, and start an empty repo for your app.',
    'No: keep both. You can remove the link later with: git remote remove origin',
  ],
);

console.log('\nThese values will be used:');
console.log(`  App name:         ${name}`);
console.log(`  iOS bundle ID:    ${bundleId}`);
console.log(`  Team ID:          ${teamId || '(Xcode chooses)'}`);
console.log(`  Username:         ${username || '(not set)'}`);
console.log(`  Demo screens:     ${keepDemo ? 'kept' : 'removed'}`);
console.log(`  Git history:      ${freshGit ? 'fresh' : 'kept'}`);
console.log('  .env will be overwritten.\n');

if (!(await yesNo('Apply these values?', true))) {
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

// 3. .env, read by app.config.ts.
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
  builtAtRomania: 'not built yet',
  nodeVersion: process.version,
});

// 5. Demo screens.
applyDemoChoice(keepDemo);

// 6. Fresh git history.
if (freshGit) {
  rmSync(toPath('.git'), { recursive: true, force: true });
  git('init', '--quiet');
}

// 7. README for the new app.
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
Done. Next steps:
  npm run iphone   then choose 2 to install the app on your iPhone and open it
${renamedNote()}`);

function renamedNote() {
  return oldName !== name
    ? `\nRenamed ${oldName} to ${name} in the tracked files.`
    : '';
}
