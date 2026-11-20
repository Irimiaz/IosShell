#!/usr/bin/env node
// The iPhone menu. Run it with `npm run iphone`, then type a number.
// Each choice runs one script or command, and tells you when to use it.
// Ctrl+C stops the running task, not the menu.

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
process.chdir(root);

const tasks = [
  {
    key: '1',
    title: 'Start the dev server',
    when: 'Keep it running while you use the app on the phone. Code changes load on the phone.',
    command: ['npx', ['expo', 'start']],
  },
  {
    key: '2',
    title: 'Install the app without opening it',
    when: 'Use it first, and after changing .env, app.json or a native package. Puts the app on the phone now. Open it later, with option 1 running.',
    command: ['bash', ['scripts/iphone/install.sh']],
  },
  {
    key: '3',
    title: 'Install and open the app on the iPhone',
    when: 'Installs and opens the app now, and starts the dev server. Use it to open the app right away.',
    command: ['bash', ['scripts/iphone/run.sh']],
  },

  {
    key: '4',
    title: 'Make a file to send to someone else',
    when: 'Creates dist/<app name>-unsigned.ipa. They install it with Sideloadly. Their phone does not need Xcode.',
    command: ['bash', ['scripts/iphone/package-ipa.sh']],
  },
  {
    key: '5',
    title: 'Start the dev server through a tunnel',
    when: 'Use it when the phone and the Mac are on different networks, and option 1 cannot connect.',
    command: ['npx', ['expo', 'start', '--tunnel']],
  },
  {
    key: '6',
    title: 'Check the code',
    when: 'Runs the TypeScript check and the linter. Does not need the phone.',
    command: ['npm', ['run', 'check']],
  },
  {
    key: '7',
    title: 'Rebuild the iOS project from scratch',
    when: 'Use it when the build fails in a strange way. It deletes the ios/ folder and creates it again.',
    command: ['bash', ['scripts/iphone/regenerate.sh']],
  },
  {
    key: '8',
    title: 'Change the app setup',
    when: 'Asks the setup questions again: app name, bundle ID, team and username.',
    command: ['npm', ['run', 'setup']],
  },
  {
    key: '9',
    title: 'Remove the demo screens',
    when: 'Deletes src/demo/ and its links in the menu and tabs. The libraries stay. Asks you to confirm first.',
    command: ['node', ['scripts/demo/remove-demo.mjs']],
  },
  {
    key: '10',
    title: 'Clean build, install without opening',
    when: 'Cold start. Clears all caches, recreates ios/, then builds and installs on the phone without opening it. Slower. Use it when nothing else works.',
    command: ['bash', ['scripts/iphone/clean-build.sh']],
  },
];

// One reader for the whole menu. It is paused while a task runs, so the task
// can use the keyboard.
const reader = createInterface({ input: process.stdin });
const lines = reader[Symbol.asyncIterator]();

// Reads one line. Returns null when the input ends.
async function readLine(prompt) {
  process.stdout.write(prompt);
  const next = await lines.next();
  return next.done ? null : next.value.trim();
}

function printMenu() {
  console.log('\nWhat do you want to do?\n');
  for (const task of tasks) {
    console.log(`  ${task.key}  ${task.title}`);
    console.log(`     ${task.when}\n`);
  }
  console.log('  q  Quit\n');
}

async function main() {
  for (;;) {
    printMenu();
    const choice = await readLine('Type a number, then Enter: ');
    if (choice === null || choice.toLowerCase() === 'q') {
      console.log('Bye.');
      reader.close();
      return;
    }

    const task = tasks.find((item) => item.key === choice);
    if (!task) {
      console.log('Type one of the numbers above, or q to quit.');
      continue;
    }

    console.log(`\n== ${task.title} ==\n`);
    // While the task runs, Ctrl+C should stop only the task.
    process.on('SIGINT', () => {});
    reader.pause();
    const [command, args] = task.command;
    const result = spawnSync(command, args, { stdio: 'inherit' });
    process.removeAllListeners('SIGINT');
    reader.resume();

    if (result.status === 0) {
      console.log('\nDone.');
    } else {
      console.log(
        `\nStopped (${result.signal ?? `exit code ${result.status}`}).`,
      );
    }
    await readLine('\nPress Enter to go back to the menu. ');
  }
}

main();
