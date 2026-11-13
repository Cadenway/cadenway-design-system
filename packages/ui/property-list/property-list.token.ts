import { InjectionToken, type Signal } from '@angular/core';

import type { CwPropertyListOrientation } from './property-list.types';

/** What the groups and the properties read from their `cw-property-list`. Internal. */
export interface PropertyListHost {
  readonly orientation: Signal<CwPropertyListOrientation>;
  readonly readonly: Signal<boolean>;
  /** Whether the empty properties are folded away right now. */
  readonly foldEmpty: Signal<boolean>;
  /** The classes of a `dl`-like container of rows, for the list and its groups. */
  readonly rowsClasses: Signal<string>;
  /** Whether a group is the first one of the list (no separator above it). */
  isFirstGroup(group: object): boolean;
}

/**
 * The enclosing property list, provided by `cw-property-list` so its groups and properties find it
 * without importing its class (it imports them). Not exported from the entry point.
 */
export const PROPERTY_LIST = new InjectionToken<PropertyListHost>('PROPERTY_LIST');
