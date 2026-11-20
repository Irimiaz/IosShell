// Writes src/config/build-info.json with the details of the build that is
// about to run. Called by the build scripts before xcodebuild.
//
//   node scripts/iphone/lib/write-build-info.mjs Debug
//   node scripts/iphone/lib/write-build-info.mjs Release

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const configuration = process.argv[2] ?? 'Debug';

function git(command) {
  try {
    return execSync(`git ${command}`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

// The time zone for the "Built at" line. Set APP_TIMEZONE in .env. If it is
// missing or not a valid time zone name, this Mac's time zone is used.
function readTimeZone() {
  let value = process.env.APP_TIMEZONE;
  try {
    const line = readFileSync(join(root, '.env'), 'utf8')
      .split('\n')
      .find((item) => item.startsWith('APP_TIMEZONE='));
    if (!value && line) value = line.slice('APP_TIMEZONE='.length).trim();
  } catch {
    // No .env file: use the default below.
  }
  if (value) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: value });
      return value;
    } catch {
      // Not a valid time zone name: use the default below.
    }
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
const now = new Date();
const timeZone = readTimeZone();

const info = {
  appName: app.name,
  bundleVersion: app.version,
  packageVersion: pkg.version,
  // Number of commits on this branch, used as the build number.
  buildNumber: git('rev-list --count HEAD'),
  gitCommit: git('rev-parse --short HEAD'),
  gitBranch: git('rev-parse --abbrev-ref HEAD'),
  gitDirty: git('status --porcelain') !== '' ? 'yes' : 'no',
  configuration,
  builtAtIso: now.toISOString(),
  timeZone,
  builtAtLocal: now.toLocaleString('en-GB', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'medium',
  }),
  nodeVersion: process.version,
};

writeFileSync(
  join(root, 'src', 'config', 'build-info.json'),
  JSON.stringify(info, null, 2) + '\n',
);
console.log(
  `Build info written: ${info.appName} ${info.bundleVersion} (${info.buildNumber}) ${info.gitCommit}`,
);
