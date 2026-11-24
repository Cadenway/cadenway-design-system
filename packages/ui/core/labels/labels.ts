import { inject, InjectionToken, type Provider } from '@angular/core';

/**
 * Type ɵLabelsOverrides
 *
 * @description
 * What a `provideCw…Labels` function accepts: some texts of one brick, or a function returning
 * them. The function runs once, in an injection context, when the brick first reads its labels, so
 * it may call `inject()` and read `$localize` translations loaded at run time.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @type {Partial<T> | (() => Partial<T>)}
 */
export type ɵLabelsOverrides<T extends object> = Partial<T> | (() => Partial<T>);

/**
 * Function ɵlabelsToken
 *
 * @description
 * Creates the injection token that carries the texts of one brick. Without a provider it resolves
 * to `defaults` (the French copy of the mockup) from the root injector, so a consumer that provides
 * nothing keeps today's texts.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {string} description - Token name shown in dependency injection errors.
 * @param {T} defaults - Complete texts used when no provider overrides them.
 *
 * @returns {InjectionToken<T>} Token resolving to the effective texts.
 */
export function ɵlabelsToken<T extends object>(
  description: string,
  defaults: T,
): InjectionToken<T> {
  return new InjectionToken<T>(description, { providedIn: 'root', factory: (): T => defaults });
}

/**
 * Function ɵprovideLabels
 *
 * @description
 * Builds the provider behind every `provideCw…Labels` function. The overrides are merged over the
 * texts of the parent injector (or over `defaults` at the root), so an application provides its
 * texts once and a route or a component subtree can still replace a few of them. A brick's own
 * `labels` or text inputs keep precedence over what is provided.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {InjectionToken<T>} token - Token created with `ɵlabelsToken`.
 * @param {T} defaults - The token's complete default texts.
 * @param {ɵLabelsOverrides<T>} overrides - Texts to replace, or a function returning them.
 *
 * @returns {Provider} Provider usable in application, route, component or test providers.
 */
export function ɵprovideLabels<T extends object>(
  token: InjectionToken<T>,
  defaults: T,
  overrides: ɵLabelsOverrides<T>,
): Provider {
  return {
    provide: token,
    useFactory: (): T => ({
      ...(inject(token, { skipSelf: true, optional: true }) ?? defaults),
      ...resolveOverrides(overrides),
    }),
  };
}

/**
 * Function resolveOverrides
 *
 * @description
 * Returns the texts an override describes, calling it when it is a function.
 *
 * @param {ɵLabelsOverrides<T>} overrides - Texts or the function returning them.
 *
 * @returns {Partial<T>} The texts to merge.
 */
function resolveOverrides<T extends object>(overrides: ɵLabelsOverrides<T>): Partial<T> {
  return typeof overrides === 'function' ? overrides() : overrides;
}
