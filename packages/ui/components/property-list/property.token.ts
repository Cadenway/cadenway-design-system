import { InjectionToken, type Signal } from '@angular/core';

import type { CwPropertyListOrientation } from './property-list.types';

/** What a `[cwPropertyValue]` reads from its `cw-property`. Internal. */
export interface PropertyHost {
  /** Id of the label (`dt`), the start of the value's accessible name. */
  readonly labelId: string;
  /** Id of the error message, for `aria-describedby`. */
  readonly errorId: string;
  readonly label: Signal<string>;
  readonly error: Signal<string | null>;
  readonly orientation: Signal<CwPropertyListOrientation>;
  /** The property or its list is read-only. */
  readonly isReadonly: Signal<boolean>;
}

/**
 * The enclosing property, provided by `cw-property` so the value directive finds it without
 * importing its class (it imports the directive). Not exported from the entry point.
 */
export const PROPERTY = new InjectionToken<PropertyHost>('PROPERTY');
