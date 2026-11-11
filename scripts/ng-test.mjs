#!/usr/bin/env node
/**
 * Runs the Angular unit-test builder (Vitest) for the package scripts (`test`, `test:coverage`).
 *
 * pnpm forwards the `--` of `pnpm test -- <brick>` as a literal argument, and `ng test` ignores
 * everything that follows it: the filter would be dropped and every spec would run. This launcher
 * removes the separator, resolves each positional argument to the spec files it designates and
 * hands them to the builder through its `--include` option, project by project:
 *
 *   pnpm test                                  every project of angular.json with a `test` target
 *   pnpm test -- button                        specs in a `button` folder, or `button.spec.ts`
 *   pnpm test -- packages/ui/src/lib/button    specs under that folder (or next to that file)
 *
 * A project without a matching spec is skipped; a filter that matches nothing anywhere is an error
 * rather than a green run. Arguments starting with `-` go to `ng test` unchanged; give their value
 * with `=` (`--filter=^Button`), a separate word would be read as a spec filter.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ng = path.join(root, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const workspace = JSON.parse(readFileSync(path.join(root, 'angular.json'), 'utf8'));

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const options = args.filter((arg) => arg.startsWith('-'));
const filters = args.filter((arg) => !arg.startsWith('-'));

const toPosix = (file) => file.split(path.sep).join('/');
const isInside = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

/** Spec files of a source root that one filter designates, as absolute paths. */
function matchSpecs(sourceRoot, specs, filter) {
  const target = path.resolve(process.cwd(), filter);
  if (existsSync(target)) {
    const sibling = target.replace(/(\.spec)?\.ts$/, '.spec.ts');
    const byPath = statSync(target).isDirectory()
      ? specs.filter((spec) => isInside(target, spec))
      : specs.filter((spec) => spec === sibling);
    if (byPath.length > 0) {
      return byPath;
    }
  }
  // Anything else is a brick name: its folder, or a spec file named after it.
  return specs.filter((spec) => {
    const segments = toPosix(path.relative(sourceRoot, spec)).split('/');
    return segments.slice(0, -1).includes(filter) || segments.at(-1) === `${filter}.spec.ts`;
  });
}

let status = 0;
let ran = 0;

for (const [name, project] of Object.entries(workspace.projects)) {
  if (!project.architect?.test) {
    continue;
  }

  const sourceRoot = path.join(root, project.sourceRoot);
  const includes = [];
  if (filters.length > 0) {
    const specs = readdirSync(sourceRoot, { recursive: true })
      .filter((file) => file.endsWith('.spec.ts'))
      .map((file) => path.join(sourceRoot, file));
    const matched = new Set(filters.flatMap((filter) => matchSpecs(sourceRoot, specs, filter)));
    if (matched.size === 0) {
      continue;
    }
    // The builder reads `include` relative to the project source root.
    for (const spec of matched) {
      includes.push(`--include=${toPosix(path.relative(sourceRoot, spec))}`);
    }
  }

  ran += 1;
  const result = spawnSync(process.execPath, [ng, 'test', name, ...includes, ...options], {
    cwd: root,
    stdio: 'inherit',
  });
  status ||= result.status ?? 1;
}

if (ran === 0) {
  console.error(`ng-test: no spec file matches ${filters.join(', ')}.`);
  status = 1;
}

process.exit(status);
