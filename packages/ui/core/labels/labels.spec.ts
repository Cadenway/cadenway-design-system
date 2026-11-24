import { Component, inject, InjectionToken, Injector, type Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ɵlabelsToken, ɵprovideLabels } from './labels';

/**
 * Interface Texts
 *
 * @description
 * Two texts of a fictitious brick, enough to tell merged values from defaults.
 */
interface Texts {
  // #region Properties
  /**
   * Property close
   *
   * @description
   * Accessible name of a close button.
   *
   * @type {string}
   * @readonly
   */
  readonly close: string;

  /**
   * Property empty
   *
   * @description
   * Text shown when nothing matches.
   *
   * @type {string}
   * @readonly
   */
  readonly empty: string;
  // #endregion
}

/**
 * Constant DEFAULTS
 *
 * @description
 * French defaults of the fictitious brick.
 *
 * @type {Texts}
 */
const DEFAULTS: Texts = { close: 'Fermer', empty: 'Aucun résultat' };

/**
 * Constant TEXTS
 *
 * @description
 * Token under test.
 *
 * @type {InjectionToken<Texts>}
 */
const TEXTS: InjectionToken<Texts> = ɵlabelsToken<Texts>('TEXTS', DEFAULTS);

/**
 * Function provideTexts
 *
 * @description
 * The `provideCw…Labels` function the fictitious brick would export.
 *
 * @param {Partial<Texts> | (() => Partial<Texts>)} overrides - Texts to replace.
 *
 * @returns {Provider} Provider of the merged texts.
 */
function provideTexts(overrides: Partial<Texts> | (() => Partial<Texts>)): Provider {
  return ɵprovideLabels(TEXTS, DEFAULTS, overrides);
}

/**
 * Component Reader
 *
 * @description
 * Reads the texts its element injector resolves.
 */
@Component({
  selector: 'cw-test-reader',
  template: '',
})
class Reader {
  // #region Properties
  /**
   * Property texts
   *
   * @description
   * Texts resolved for this element.
   *
   * @type {Texts}
   * @readonly
   */
  public readonly texts: Texts = inject(TEXTS);
  // #endregion
}

/**
 * Component Subtree
 *
 * @description
 * A component subtree that replaces one text over the application's.
 */
@Component({
  selector: 'cw-test-subtree',
  imports: [Reader],
  providers: [provideTexts({ empty: 'Nothing here' })],
  template: '<cw-test-reader />',
})
class Subtree {}

describe('ɵlabelsToken', () => {
  it('resolves to the defaults when nothing is provided', () => {
    expect(TestBed.inject(TEXTS)).toEqual(DEFAULTS);
  });
});

describe('ɵprovideLabels', () => {
  it('merges the overrides over the defaults', () => {
    TestBed.configureTestingModule({ providers: [provideTexts({ close: 'Close' })] });

    expect(TestBed.inject(TEXTS)).toEqual({ close: 'Close', empty: 'Aucun résultat' });
  });

  it('calls a function override once, in an injection context', () => {
    let injector: Injector | undefined;
    const factory: () => Partial<Texts> = vi.fn(() => {
      injector = inject(Injector);
      return { close: 'Close' };
    });
    TestBed.configureTestingModule({ providers: [provideTexts(factory)] });

    expect(TestBed.inject(TEXTS).close).toBe('Close');
    expect(TestBed.inject(TEXTS).close).toBe('Close');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(injector).toBeDefined();
  });

  it('merges a component subtree over the texts of its parent injector', () => {
    TestBed.configureTestingModule({ providers: [provideTexts({ close: 'Close' })] });
    const reader: Reader = TestBed.createComponent(Subtree).debugElement.children[0]
      ?.componentInstance as Reader;

    expect(reader.texts).toEqual({ close: 'Close', empty: 'Nothing here' });
  });
});
