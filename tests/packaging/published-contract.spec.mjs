import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { publishedTypeChanges } from './published-contract.mjs';

// Fixtures written as ng-packagr declares a brick; the Angular types stay unresolved on purpose,
// the metadata being compared from its printed type arguments.
const preamble = `import type * as i0 from './angular';
type Signal<T> = () => T;
type InputSignal<T> = () => T;
`;

function input(name, required = false) {
  return `"${name}": { "alias": "${name}"; "required": ${required}; "isSignal": true; };`;
}

function component(name, members, { inputs = [], outputs = [] } = {}) {
  return `export declare class ${name} {
  ${members.join('\n  ')}
  static ɵfac: i0.ɵɵFactoryDeclaration<${name}, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<${name}, "cw-${name.toLowerCase()}", never, { ${inputs.join(' ')} }, { ${outputs.join(' ')} }, never, never, true, never>;
}
`;
}

const fixtures = {
  'keeps unchanged declarations': {
    released: `export declare class A { readonly a: string; }
export type Size = 'sm';
export declare function f(): void;`,
    candidate: `export declare class A { readonly a: string; }
export type Size = 'sm';
export declare function f(): void;`,
    changed: [],
  },
  'accepts new exports': {
    released: `export type A = 'a';`,
    candidate: `export type A = 'a';
export declare const B: number;`,
    changed: [],
  },
  'reports a removed export': {
    released: `export type A = 'a';
export type B = 'b';`,
    candidate: `export type A = 'a';`,
    changed: ['B'],
  },
  'accepts a new optional interface member': {
    released: `export interface Config { readonly a: string; }`,
    candidate: `export interface Config { readonly a: string; readonly b?: number; }`,
    changed: [],
  },
  'reports a removed or changed interface member, even a narrower one': {
    released: `export interface Removed { a: string; b: string; }
export interface Narrowed { readonly mode: 'a' | 'b'; }`,
    candidate: `export interface Removed { a: string; }
export interface Narrowed { readonly mode: 'a'; }`,
    changed: ['Narrowed', 'Removed'],
  },
  'accepts new class members and ignores private ones': {
    released: `export declare class A { readonly a: string; private b; private readonly c; }`,
    candidate: `export declare class A {
  readonly a: string;
  protected d(): void;
  e(): void;
  private readonly c;
  private f;
}`,
    changed: [],
  },
  'reports a changed or removed public class member': {
    released: `export declare class A { m(a: string): void; readonly n: number; }`,
    candidate: `export declare class A { m(a: number): void; }`,
    changed: ['A'],
  },
  'ignores the protected members of components': {
    released: `${preamble}${component('CwA', [
      'protected readonly marks: readonly string[];',
      'protected readonly gone: Signal<string>;',
    ])}`,
    candidate: `${preamble}${component('CwA', [
      'protected readonly marks: Signal<readonly string[]>;',
      'protected readonly lockup: Signal<boolean>;',
    ])}`,
    changed: [],
  },
  'compares the protected members of other classes and abstract directives': {
    released: `${preamble}export declare class Base { protected x: string; }
export declare abstract class CwBase {
  protected y: string;
  static ɵdir: i0.ɵɵDirectiveDeclaration<CwBase, never, never, {}, {}, never, never, true, never>;
}`,
    candidate: `${preamble}export declare class Base { protected x: number; }
export declare abstract class CwBase {
  protected y: number;
  static ɵdir: i0.ɵɵDirectiveDeclaration<CwBase, never, never, {}, {}, never, never, true, never>;
}`,
    changed: ['Base', 'CwBase'],
  },
  'accepts a narrower readonly class property': {
    released: `${preamble}interface Labels { a: string; }
export declare class A { readonly texts: Signal<Labels>; }`,
    candidate: `${preamble}interface Labels { a: string; }
interface ProvidedLabels extends Labels { b: string; }
export declare class A { readonly texts: Signal<ProvidedLabels>; }`,
    changed: [],
  },
  'reports a wider readonly or a changed writable class property': {
    released: `export declare class Wider { readonly a: 'x'; }
export declare class Writable { a: 'x' | 'y'; }`,
    candidate: `export declare class Wider { readonly a: string; }
export declare class Writable { a: 'x'; }`,
    changed: ['Wider', 'Writable'],
  },
  'reports a property whose type no longer resolves': {
    released: `${preamble}interface Labels { a: string; }
export declare class A { readonly texts: Signal<Labels>; }`,
    candidate: `${preamble}export declare class A { readonly texts: Signal<Missing>; }`,
    changed: ['A'],
  },
  'reports a narrower component input': {
    released: `${preamble}${component('CwA', ["readonly size: InputSignal<'sm' | 'md'>;"], {
      inputs: [input('size')],
    })}`,
    candidate: `${preamble}${component('CwA', ["readonly size: InputSignal<'sm'>;"], {
      inputs: [input('size')],
    })}`,
    changed: ['CwA'],
  },
  'accepts new optional inputs and new outputs': {
    released: `${preamble}${component('CwA', ["readonly size: InputSignal<'sm' | 'md'>;"], {
      inputs: [input('size')],
    })}`,
    candidate: `${preamble}${component(
      'CwA',
      [
        "readonly size: InputSignal<'sm' | 'md'>;",
        'readonly tone: InputSignal<string>;',
        'readonly closed: OutputEmitterRef<void>;',
      ],
      { inputs: [input('size'), input('tone')], outputs: ['"closed": "closed";'] },
    )}`,
    changed: [],
  },
  'reports a new required input and a removed output': {
    released: `${preamble}${component('CwRequired', ['readonly a: InputSignal<string>;'], {
      inputs: [input('a')],
    })}${component('CwRemoved', ['readonly closed: OutputEmitterRef<void>;'], {
      outputs: ['"closed": "closed";'],
    })}`,
    candidate: `${preamble}${component(
      'CwRequired',
      ['readonly a: InputSignal<string>;', 'readonly b: InputSignal<string>;'],
      { inputs: [input('a'), input('b', true)] },
    )}${component('CwRemoved', ['readonly closed: OutputEmitterRef<void>;'])}`,
    changed: ['CwRemoved', 'CwRequired'],
  },
  'accepts a wider type alias': {
    released: `export type Variant = 'mark';`,
    candidate: `export type Variant = 'mark' | 'lockup';`,
    changed: [],
  },
  'reports a narrower type alias and any change to a generic one': {
    released: `export type Size = 'sm' | 'md';
export type KeyFn<T> = (item: T) => string;
export type Id<T> = string;`,
    candidate: `export type Size = 'sm';
export type KeyFn<T> = (item: T, index: number) => string;
export type Id<T, U> = string;`,
    changed: ['Id', 'KeyFn', 'Size'],
  },
  'accepts a constant of an equivalent or narrower type': {
    released: `export declare const LABELS: Readonly<Record<'a', string>>;
export declare const LIMIT: number;`,
    candidate: `type Labels = Readonly<Record<'a', string>>;
export declare const LABELS: Labels;
export declare const LIMIT: 1;`,
    changed: [],
  },
  'reports a constant of a wider type': {
    released: `export declare const LIMIT: 1;`,
    candidate: `export declare const LIMIT: number;`,
    changed: ['LIMIT'],
  },
  'reports a changed class or interface header': {
    released: `export declare class A { }
export interface B { }`,
    candidate: `export declare class A<T = unknown> { }
interface C { }
export interface B extends C { }`,
    changed: ['A', 'B'],
  },
  'compares other declarations by their printed text': {
    released: `export declare function f(a: string): void;`,
    candidate: `export declare function f(a: string, b?: number): void;`,
    changed: ['f'],
  },
  'reports a declaration of another kind': {
    released: `export interface X { a: string; }`,
    candidate: `export type X = { a: string; };`,
    changed: ['X'],
  },
  'shows the candidate member in place of the changed one': {
    released: `export declare class A { readonly a: string; b(): void; }`,
    candidate: `export declare class A { b(): void; readonly a: number; c(): void; }`,
    changed: ['A'],
  },
};

describe('the published type contract', () => {
  let temporary;
  let changes;

  before(() => {
    temporary = mkdtempSync(join(realpathSync(tmpdir()), 'cadenway-ds-contract-'));
    for (const side of ['released', 'candidate']) mkdirSync(join(temporary, side));
    const entries = Object.entries(fixtures).map(([label, { released, candidate }], index) => {
      const write = (side, text) => {
        const file = join(temporary, side, `fixture-${index}.d.ts`);
        // Like the ng-packagr bundles, an explicit export list keeps undeclared exports out.
        writeFileSync(file, `${text}\nexport {};\n`);
        return file;
      };
      return {
        label,
        released: write('released', released),
        candidate: write('candidate', candidate),
      };
    });
    changes = publishedTypeChanges(entries);
  });

  after(() => rmSync(temporary, { recursive: true, force: true }));

  for (const [label, { changed }] of Object.entries(fixtures)) {
    it(label, () => {
      const symbols = changes
        .filter((change) => change.label === label)
        .map(({ symbol }) => symbol);
      assert.deepEqual(symbols.sort(), changed);
    });
  }

  it('reports the candidate member next to the released one', () => {
    const { actual, expected } = changes.find(
      ({ label }) => label === 'shows the candidate member in place of the changed one',
    );
    assert.deepEqual(expected, [
      { declaration: 'class A {\n}', members: ['readonly a: string;', 'b(): void;'] },
    ]);
    assert.deepEqual(actual, [
      { declaration: 'class A {\n}', members: ['readonly a: number;', 'b(): void;'] },
    ]);
  });
});
