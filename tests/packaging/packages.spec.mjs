import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { publishedTypeChanges } from './published-contract.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const packages = {
  '@cadenway/ui': { directory: 'packages/ui', version: '0.3.0' },
  '@cadenway/icons': { directory: 'packages/icons', version: '0.3.0' },
  '@cadenway/tokens': { directory: 'packages/tokens', version: '0.2.0' },
};
const storybook = join(root, 'apps/storybook/node_modules');

function json(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function pnpm(cwd, ...args) {
  const cli = process.env.npm_execpath;
  assert(cli, 'Run the packaging test with pnpm test:packaging.');
  const [command, ...launcherArgs] = /\.[cm]?js$/u.test(cli) ? [process.execPath, cli] : [cli];
  return execFileSync(command, [...launcherArgs, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

function packagePath(nodeModules, name) {
  return join(nodeModules, name);
}

function localVersion(name, nodeModules = join(root, 'node_modules')) {
  return json(join(packagePath(nodeModules, name), 'package.json')).version;
}

function pack(temporary) {
  const dependencies = {};
  for (const [name, { directory }] of Object.entries(packages)) {
    const source = join(root, directory);
    const { version, publishConfig } = json(join(source, 'package.json'));
    if (publishConfig?.directory) {
      const built = join(source, publishConfig.directory, 'package.json');
      assert(existsSync(built), `Missing build for ${name}. Run pnpm build first.`);
      assert.equal(json(built).version, version, `Stale build for ${name}. Run pnpm build first.`);
    }
    const archive = join(temporary, `${name.replace('@', '').replace('/', '-')}-${version}.tgz`);
    pnpm(source, 'pack', '--pack-destination', temporary);
    assert(existsSync(archive), `Missing archive for ${name}. Run pnpm build first.`);
    // A tarball path is local to this disposable install and never enters the workspace lockfile.
    dependencies[name] = archive.replaceAll('\\', '/');
  }
  return dependencies;
}

function prepareConsumer(directory, designPackages, { build = false, minimum = {} } = {}) {
  mkdirSync(directory);
  const runtime = [
    '@angular/aria',
    '@angular/cdk',
    '@angular/common',
    '@angular/compiler',
    '@angular/core',
    '@angular/forms',
    '@angular/platform-browser',
    '@ng-icons/core',
    'rxjs',
  ];
  const devDependencies = {};
  if (build || minimum['@angular/core']) {
    devDependencies['@angular/compiler-cli'] =
      minimum['@angular/core'] ?? localVersion('@angular/compiler-cli');
    devDependencies.typescript = localVersion('typescript');
  }
  if (build) {
    for (const name of ['@angular/build', '@angular/cli'])
      devDependencies[name] = localVersion(name);
    for (const name of ['@tailwindcss/postcss', 'tailwindcss']) {
      devDependencies[name] = localVersion(name, storybook);
    }
  }
  const cliRequire = createRequire(
    realpathSync(join(root, 'node_modules/@angular/cli/package.json')),
  );
  const iconPeers = Object.fromEntries(
    ['@angular-devkit/schematics', '@schematics/angular'].map((name) => [
      name,
      cliRequire(`${name}/package.json`).version,
    ]),
  );
  writeJson(join(directory, 'package.json'), {
    private: true,
    type: 'module',
    packageManager: json(join(root, 'package.json')).packageManager,
    dependencies: {
      ...Object.fromEntries(runtime.map((name) => [name, minimum[name] ?? localVersion(name)])),
      ...iconPeers,
      ...designPackages,
    },
    devDependencies,
  });
  writeFileSync(join(directory, '.npmrc'), '@cadenway:registry=https://npm.pkg.github.com\n');
  writeFileSync(
    join(directory, 'pnpm-workspace.yaml'),
    `${readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8').trimEnd()}\nautoInstallPeers: false\nstrictPeerDependencies: true\n`,
  );
  pnpm(directory, 'install', '--no-frozen-lockfile', '--ignore-scripts');
}

function minimumAngularPeers(installed) {
  const minimum = {};
  for (const manifest of Object.values(installed)) {
    for (const [name, range] of Object.entries(manifest.peerDependencies ?? {})) {
      if (!name.startsWith('@angular/')) continue;
      const floor = /^[~^]?(\d+\.\d+\.\d+)$/u.exec(range)?.[1];
      assert(floor, `Set a tested peer floor for ${name}@${range}.`);
      assert(
        !minimum[name] || minimum[name] === floor,
        `Resolve differing peer floors for ${name}.`,
      );
      minimum[name] = floor;
    }
  }
  // The Angular compiler and the bootstrap runtime follow the tested Angular core version.
  minimum['@angular/compiler'] = minimum['@angular/core'];
  minimum['@angular/platform-browser'] = minimum['@angular/core'];
  return minimum;
}

function runAngular(directory, packageName, binary, ...args) {
  const installed = join(directory, 'node_modules', packageName);
  execFileSync(
    process.execPath,
    [join(installed, json(join(installed, 'package.json')).bin[binary]), ...args],
    { cwd: directory, stdio: 'inherit' },
  );
}

function manifests(directory) {
  return Object.fromEntries(
    Object.keys(packages).map((name) => {
      const base = packagePath(join(directory, 'node_modules'), name);
      return [name, { base, ...json(join(base, 'package.json')) }];
    }),
  );
}

function checkPublishedContract(released, candidate) {
  const declarations = [];
  for (const [name, published] of Object.entries(released)) {
    const installed = candidate[name];
    for (const [path, entry] of Object.entries(published.exports)) {
      const actual = installed.exports[path];
      assert(actual, `${name} removed its ${path} export (released in ${published.version}).`);
      for (const file of typeof actual === 'string' ? [actual] : Object.values(actual)) {
        if (!file.includes('*')) {
          assert(
            existsSync(resolve(installed.base, file)),
            `${name} ${path} points to missing ${file}.`,
          );
        }
      }
      if (entry.types) {
        assert(actual.types, `${name} ${path} removed its types export.`);
        declarations.push({
          label: `${name} ${path}`,
          released: resolve(published.base, entry.types),
          candidate: resolve(installed.base, actual.types),
        });
      }
    }
    const leakedTests = readdirSync(installed.base, { recursive: true }).filter((name) =>
      /(?:^|[\\/])tests?[\\/]|\.(?:spec|test|stories)\.[cm]?[jt]s$|\.tsbuildinfo$/u.test(name),
    );
    assert.deepEqual(leakedTests, [], `${name} published test or build-cache files.`);
  }
  for (const { label, symbol, actual, expected } of publishedTypeChanges(declarations)) {
    assert.deepEqual(actual, expected, `${label} changed ${symbol}.`);
  }
}

function writeButtonConsumer(directory) {
  writeJson(join(directory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      experimentalDecorators: true,
      strict: true,
      skipLibCheck: true,
    },
    angularCompilerOptions: { strictTemplates: true },
    files: ['main.ts'],
  });
  writeFileSync(
    join(directory, 'main.ts'),
    `import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideCadenwayIcons } from '@cadenway/icons';
import { CwButton, type CwButtonSize, type CwButtonVariant } from '@cadenway/ui/components/button';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-root',
  imports: [CwButton, NgIcon],
  template: '<button cwButton [size]="size" [variant]="variant" class="bg-canvas"><ng-icon name="phosphorPlusBold" />Save</button>',
})
class App {
  readonly size: CwButtonSize = 'sm';
  readonly variant: CwButtonVariant = 'outline';
}

void bootstrapApplication(App, { providers: provideCadenwayIcons() });
`,
  );
}

function buildButton(directory) {
  const resolveAsset = createRequire(join(directory, 'package.json')).resolve;
  resolveAsset('@cadenway/tokens/fonts/inter-latin-opsz-normal.woff2');
  writeJson(join(directory, 'angular.json'), {
    version: 1,
    cli: { analytics: false },
    projects: {
      consumer: {
        root: '',
        projectType: 'application',
        architect: {
          build: {
            builder: '@angular/build:application',
            options: {
              browser: 'main.ts',
              index: 'index.html',
              tsConfig: 'tsconfig.json',
              styles: ['styles.css'],
              outputPath: 'dist',
              statsJson: true,
              optimization: { scripts: true, styles: { minify: true, inlineCritical: false } },
            },
          },
        },
      },
    },
  });
  writeButtonConsumer(directory);
  writeJson(join(directory, '.postcssrc.json'), { plugins: { '@tailwindcss/postcss': {} } });
  writeFileSync(
    join(directory, 'styles.css'),
    `@import 'tailwindcss';
@import '@cadenway/tokens/tokens.css';
@import '@cadenway/tokens/theme.css';
@source './node_modules/@cadenway/ui';
`,
  );
  writeFileSync(
    join(directory, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Consumer</title></head><body><app-root></app-root></body></html>',
  );
  runAngular(directory, '@angular/cli', 'ng', 'build');
  const stats = json(join(directory, 'dist/browser-stats.json'));
  const editor = /(?:block-editor|tiptap|prosemirror|\bmarked\b)/iu;
  const included = Object.values(stats.outputs)
    .flatMap((output) => Object.entries(output.inputs))
    .filter(([path, input]) => input.bytesInOutput > 0 && editor.test(path))
    .map(([path]) => path);
  assert.deepEqual(included, [], 'The button-only bundle includes the block editor.');
  const browser = join(directory, 'dist/browser');
  const stylesheet = readdirSync(browser).find((name) => /^styles.*\.css$/u.test(name));
  assert(stylesheet, 'The consumer build did not produce its stylesheet.');
  const styles = readFileSync(join(browser, stylesheet), 'utf8');
  assert.match(styles, /\.bg-canvas\b/u);
  assert.match(styles, /\[data-theme=["']?light["']?\]/u);
  assert.match(styles, /\[data-theme=["']?dark["']?\]/u);
  assert.match(styles, /\.woff2\b/u);
  assert(
    readdirSync(join(browser, 'media')).some((name) => name.endsWith('.woff2')),
    'The consumer build did not emit the token fonts.',
  );
}

test('the published design system APIs work from isolated package installations', (context) => {
  const parent = realpathSync(tmpdir());
  const temporary = mkdtempSync(join(parent, 'cadenway-ds-packages-'));
  context.after(() => {
    assert.equal(dirname(realpathSync(temporary)), parent);
    rmSync(temporary, { recursive: true, force: true });
  });
  const reference = join(temporary, 'reference');
  const consumer = join(temporary, 'consumer');
  const archiveDependencies = pack(temporary);
  prepareConsumer(
    reference,
    Object.fromEntries(Object.entries(packages).map(([name, { version }]) => [name, version])),
  );
  prepareConsumer(consumer, archiveDependencies, { build: true });
  const installed = manifests(consumer);
  checkPublishedContract(manifests(reference), installed);
  buildButton(consumer);
  const minimum = minimumAngularPeers(installed);
  if (Object.entries(minimum).some(([name, version]) => localVersion(name) !== version)) {
    const floor = join(temporary, 'minimum-angular');
    prepareConsumer(floor, archiveDependencies, { minimum });
    writeButtonConsumer(floor);
    runAngular(floor, '@angular/compiler-cli', 'ngc', '--noEmit');
  }
});
