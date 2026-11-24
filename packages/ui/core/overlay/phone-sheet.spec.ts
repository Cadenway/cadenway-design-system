import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideCwPhoneSheets, ɵphoneSheet, type ɵPhoneSheet } from './phone-sheet';

/**
 * Function emulateScreen
 *
 * @description
 * Gives the test DOM a `matchMedia` answering the phone query, which jsdom lacks.
 *
 * @param {boolean} phone - Whether the phone media query matches.
 */
function emulateScreen(phone: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): Pick<MediaQueryList, 'matches' | 'media'> => ({
      matches: phone,
      media: query,
    }),
  });
}

describe('ɵphoneSheet', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('keeps panels next to their trigger when the application did not opt in', () => {
    emulateScreen(true);

    expect(ɵphoneSheet(TestBed.inject(Injector), null)).toBeNull();
  });

  it('keeps panels next to their trigger on a large screen', () => {
    emulateScreen(false);
    TestBed.configureTestingModule({ providers: [provideCwPhoneSheets()] });

    expect(ɵphoneSheet(TestBed.inject(Injector), null)).toBeNull();
  });

  it('docks panels above the tab bar on a phone, between 8 px gutters', () => {
    emulateScreen(true);
    TestBed.configureTestingModule({ providers: [provideCwPhoneSheets()] });
    const sheet: ɵPhoneSheet | null = ɵphoneSheet(TestBed.inject(Injector), null);

    expect(sheet?.width).toBe('calc(100% - 16px)');
    expect(sheet?.maxHeight).toBe('calc(100dvh - 72px)');
  });

  it('takes the bottom offset and the gutters of its configuration', () => {
    emulateScreen(true);
    TestBed.configureTestingModule({ providers: [provideCwPhoneSheets({ bottom: 8, gutter: 4 })] });
    const sheet: ɵPhoneSheet | null = ɵphoneSheet(TestBed.inject(Injector), null);

    expect(sheet?.width).toBe('calc(100% - 8px)');
    expect(sheet?.maxHeight).toBe('calc(100dvh - 12px)');
  });

  it('keeps the defaults for options given as undefined', () => {
    emulateScreen(true);
    TestBed.configureTestingModule({
      providers: [provideCwPhoneSheets({ bottom: undefined, gutter: undefined })],
    });
    const sheet: ɵPhoneSheet | null = ɵphoneSheet(TestBed.inject(Injector), null);

    expect(sheet?.maxHeight).toBe('calc(100dvh - 72px)');
  });
});
