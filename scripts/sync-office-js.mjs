/**
 * Copy the Office.js runtime into `public/office-js` so the add-in can be served
 * entirely from BuzzMaster itself.
 *
 * Why local rather than Microsoft's CDN:
 *
 * BuzzMaster works without an internet connection, and the PowerPoint add-in has
 * to hold to that. Loading office.js from the CDN would make a quiz night in a
 * hall with no wifi fail at the worst possible moment.
 *
 * This works because office.js resolves its companion scripts relative to its
 * own `<script src>` — `getOfficeJsBasePath()` in the loader reads the script
 * element it was loaded from, and host-specific and string files are fetched
 * from that same directory. Serve the loader locally with its companions beside
 * it and nothing reaches the network.
 *
 * Only what PowerPoint on Windows actually needs is copied. The full package is
 * ~88 MB across every host and platform; this is ~6 MB.
 *
 * Trade-off worth knowing: a pinned local copy does not pick up Microsoft's
 * fixes the way the CDN does. Bumping `@microsoft/office-js` and re-running this
 * is how it gets updated, and that is a deliberate, visible step.
 */
import { createRequire } from 'node:module';
import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);

const packageRoot = path.dirname(
  require.resolve('@microsoft/office-js/package.json'),
);
const dist = path.join(packageRoot, 'dist');
const target = path.resolve(import.meta.dirname, '../public/office-js');

/**
 * Core loader plus the Windows PowerPoint host bundles.
 *
 * Both 16.00 and 16.01 are included: the host announces its own version in
 * `_host_Info`, and which one it asks for varies by Office build.
 */
const files = [
  'office.js',
  'powerpoint-win32-16.00.js',
  'powerpoint-win32-16.01.js',
  // Only used on the Office 2013 (O15) code path, and small enough that leaving
  // it out to save 40 KB would be a false economy.
  'o15apptofilemappingtable.js',
];

async function main() {
  if (!existsSync(dist)) {
    throw new Error(
      `@microsoft/office-js not found at ${dist}. Run npm install first.`,
    );
  }

  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });

  let bytes = 0;

  for (const file of files) {
    const from = path.join(dist, file);
    if (!existsSync(from)) {
      // Loud rather than silent: a missing host bundle means the add-in fails to
      // initialise at runtime, with no clue as to why.
      throw new Error(`Expected Office.js file is missing: ${file}`);
    }
    await cp(from, path.join(target, file));
    bytes += (await stat(from)).size;
  }

  // Every locale's strings: the file office.js requests is chosen by the *Office
  // display language*, not by BuzzMaster's own locale, so restricting this to
  // the languages BuzzMaster ships would break for anyone running Office in a
  // fifth language. All of them together are under 4 MB.
  let locales = 0;

  for (const entry of await readdir(dist, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const strings = path.join(dist, entry.name, 'office_strings.js');
    if (!existsSync(strings)) {
      continue;
    }
    await mkdir(path.join(target, entry.name), { recursive: true });
    await cp(strings, path.join(target, entry.name, 'office_strings.js'));
    bytes += (await stat(strings)).size;
    locales += 1;
  }

  console.log(
    `Office.js synced to public/office-js: ${files.length} core files, ` +
      `${locales} locales, ${(bytes / 1024 / 1024).toFixed(1)} MB`,
  );
}

main().catch((error) => {
  console.error(`Failed to sync Office.js: ${String(error)}`);
  process.exit(1);
});
