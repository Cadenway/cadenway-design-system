import type { Mock } from 'vitest';
import { createEnvironmentInjector, EnvironmentInjector, inject, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideCwLocale, ɵLOCALE, ɵperLocale } from './locale';

describe('ɵLOCALE', () => {
  it('resolves to French when nothing is provided', () => {
    expect(TestBed.inject(ɵLOCALE)).toBe('fr-FR');
  });
});

describe('provideCwLocale', () => {
  it('sets the canonical locale of the injector', () => {
    TestBed.configureTestingModule({ providers: [provideCwLocale('en-us')] });

    expect(TestBed.inject(ɵLOCALE)).toBe('en-US');
  });

  it('calls a function once, in an injection context', () => {
    const read: Mock<() => string> = vi.fn<() => string>(() => inject(LOCALE_ID));
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }, provideCwLocale(read)],
    });

    expect(TestBed.inject(ɵLOCALE)).toBe('de-DE');
    expect(TestBed.inject(ɵLOCALE)).toBe('de-DE');
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('lets a nested injector replace the locale of its parent', () => {
    TestBed.configureTestingModule({ providers: [provideCwLocale('en-US')] });
    const parent: EnvironmentInjector = TestBed.inject(EnvironmentInjector);
    const child: EnvironmentInjector = createEnvironmentInjector(
      [provideCwLocale('en-GB')],
      parent,
    );

    expect(child.get(ɵLOCALE)).toBe('en-GB');
    expect(parent.get(ɵLOCALE)).toBe('en-US');
  });

  it('rejects a tag that is not BCP 47, naming the provider', () => {
    TestBed.configureTestingModule({ providers: [provideCwLocale('en_US')] });

    expect(() => TestBed.inject(ɵLOCALE)).toThrow(/provideCwLocale: "en_US"/);
  });
});

describe('ɵperLocale', () => {
  it('builds the value of a locale once and keeps locales apart', () => {
    const create: Mock<(locale: string) => Intl.NumberFormat> = vi.fn(
      (locale: string) => new Intl.NumberFormat(locale),
    );
    const formats: (locale: string) => Intl.NumberFormat = ɵperLocale(create);

    expect(formats('fr-FR').format(1234.5)).toBe('1 234,5');
    expect(formats('en-US').format(1234.5)).toBe('1,234.5');
    expect(formats('fr-FR')).toBe(formats('fr-FR'));
    expect(create).toHaveBeenCalledTimes(2);
  });
});
