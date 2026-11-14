import { InjectionToken, type Signal } from '@angular/core';

import type { CwPropertyListOrientation } from './property-list.types';

/**
 * Interface PropertyListHost
 *
 * @description
 * Context supplied by a property list to its rows and groups.
 */
export interface PropertyListHost {
  // #region Properties
  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Layout of the property list.
   *
   * @type {Signal<CwPropertyListOrientation>}
   */
  readonly orientation: Signal<CwPropertyListOrientation>;

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * Whether all values are read-only.
   *
   * @type {Signal<boolean>}
   */
  readonly readonly: Signal<boolean>;

  /**
   * Property foldEmpty
   * @readonly
   *
   * @description
   * Whether empty properties are currently folded.
   *
   * @type {Signal<boolean>}
   */
  readonly foldEmpty: Signal<boolean>;

  /**
   * Property rowsClasses
   * @readonly
   *
   * @description
   * Classes for the container of property rows.
   *
   * @type {Signal<string>}
   */
  readonly rowsClasses: Signal<string>;
  // #endregion

  // #region Methods
  /**
   * Method isFirstGroup
   *
   * @description
   * Reports whether a group is first in the list.
   *
   * @param {object} group - Group to compare with the first projected group.
   *
   * @returns {boolean} Whether the supplied group is first in the list.
   */
  isFirstGroup(group: object): boolean;
  // #endregion
}

/**
 * Constant PROPERTY_LIST
 *
 * @description
 * The enclosing property list, provided by `cw-property-list` so its groups and properties find it
 * without importing its class (it imports them). Not exported from the entry point.
 *
 * @type {InjectionToken<PropertyListHost>}
 */
export const PROPERTY_LIST: InjectionToken<PropertyListHost> = new InjectionToken<PropertyListHost>(
  'PROPERTY_LIST',
);
