/*
 * The locale of every `Intl` format of `@cadenway/ui`: dates, months, weekdays, numbers, relative
 * times, file sizes, case mapping and sorting. The texts of the bricks are a separate concern
 * (French defaults overridable by inputs); this only decides how values are written.
 */

import { InjectionToken, type Provider } from '@angular/core';

/**
 * Constant DEFAULT_LOCALE
 *
 * @description
 * Locale used when nothing is provided: the French of the mockup, so a consumer that provides
 * nothing (`cadenway-website`) keeps today's output.
 *
 * @type {string}
 */
const DEFAULT_LOCALE: string = 'fr-FR';

/**
 * Constant ɵLOCALE
 *
 * @description
 * The BCP 47 language tag every brick formats with, canonicalized (`en-US`, not `en-us`). It
 * resolves to `fr-FR` from the root injector unless `provideCwLocale` sets it. A brick with a
 * `locale` input uses it as the input's default, so the input keeps precedence.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @type {InjectionToken<string>}
 */
export const ɵLOCALE: InjectionToken<string> = new InjectionToken<string>('CW_LOCALE', {
  providedIn: 'root',
  factory: (): string => DEFAULT_LOCALE,
});

/**
 * Function provideCwLocale
 *
 * @description
 * Sets the locale of the dates, numbers, relative times and file sizes written by every brick
 * below the injector it is provided in (the application, a route or a component subtree), for
 * example `provideCwLocale('en-US')` in an English application. Without it the bricks write French
 * (`fr-FR`). A nested provider replaces the locale of its parent. A function is called once, in an
 * injection context, when a brick first reads the locale, so it can return Angular's locale:
 * `provideCwLocale(() => inject(LOCALE_ID))`. A brick's own `locale` input still overrides it.
 *
 * The locale is read once per injector: switching language at run time means a new injector, as
 * an `@angular/localize` build per locale already does.
 *
 * @param {string | (() => string)} locale - BCP 47 language tag such as `en-US`, or a function
 * returning one.
 *
 * @returns {Provider} Provider of the canonical locale.
 *
 * @throws {RangeError} When a brick reads a locale that is not a BCP 47 language tag (`en_US`).
 */
export function provideCwLocale(locale: string | (() => string)): Provider {
  return {
    provide: ɵLOCALE,
    useFactory: (): string => canonicalLocale(typeof locale === 'function' ? locale() : locale),
  };
}

/**
 * Function ɵperLocale
 *
 * @description
 * Wraps a factory of `Intl` formatters so that it runs once per locale: the bricks keep the cost
 * of today's module-level formatters (built once, shared by every instance) whatever the number of
 * rows, messages or chips on the page. The cache holds one entry per distinct locale, one or two
 * in an application.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {(locale: string) => T} create - Builds the formatters of one locale.
 *
 * @returns {(locale: string) => T} Function returning the cached formatters of a locale.
 */
export function ɵperLocale<T>(create: (locale: string) => T): (locale: string) => T {
  const cache: Map<string, T> = new Map<string, T>();
  return (locale: string): T => {
    const cached: T | undefined = cache.get(locale);
    if (cached !== undefined) return cached;
    const created: T = create(locale);
    cache.set(locale, created);
    return created;
  };
}

/**
 * Function canonicalLocale
 *
 * @description
 * Validates a provided locale and returns its canonical form, so that an invalid tag fails once,
 * with the provider's name, instead of inside the first brick that formats a value.
 *
 * @param {string} locale - Language tag given to `provideCwLocale`.
 *
 * @returns {string} Canonical BCP 47 language tag.
 *
 * @throws {RangeError} When the tag is not a BCP 47 language tag.
 */
function canonicalLocale(locale: string): string {
  let canonical: string | undefined;
  try {
    canonical = Intl.getCanonicalLocales(locale)[0];
  } catch {
    canonical = undefined;
  }
  if (canonical === undefined) {
    throw new RangeError(
      `provideCwLocale: "${locale}" is not a BCP 47 language tag such as "en-US".`,
    );
  }
  return canonical;
}
