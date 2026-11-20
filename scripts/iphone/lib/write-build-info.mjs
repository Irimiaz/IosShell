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

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const app = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
const now = new Date();

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
  // Romanian time (Europe/Bucharest), with the daylight saving change handled.
  builtAtRomania: now.toLocaleString('ro-RO', {
    timeZone: 'Europe/Bucharest',
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
