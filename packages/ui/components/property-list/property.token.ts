import { InjectionToken, type Signal } from '@angular/core';

import type { CwPropertyListOrientation } from './property-list.types';

/**
 * Interface PropertyHost
 *
 * @description
 * Context supplied by a property to its projected value.
 */
export interface PropertyHost {
  // #region Properties
  /**
   * Property labelId
   * @readonly
   *
   * @description
   * Identifier of the label element.
   *
   * @type {string}
   */
  readonly labelId: string;

  /**
   * Property errorId
   * @readonly
   *
   * @description
   * Identifier of the error message.
   *
   * @type {string}
   */
  readonly errorId: string;

  /**
   * Property label
   * @readonly
   *
   * @description
   * Accessible label of the property.
   *
   * @type {Signal<string>}
   */
  readonly label: Signal<string>;

  /**
   * Property error
   * @readonly
   *
   * @description
   * Validation error message, if present.
   *
   * @type {Signal<string | null>}
   */
  readonly error: Signal<string | null>;

  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Layout of the parent property list.
   *
   * @type {Signal<CwPropertyListOrientation>}
   */
  readonly orientation: Signal<CwPropertyListOrientation>;

  /**
   * Property isReadonly
   * @readonly
   *
   * @description
   * Whether the property or its list is read-only.
   *
   * @type {Signal<boolean>}
   */
  readonly isReadonly: Signal<boolean>;
  // #endregion
}

/**
 * Constant PROPERTY
 *
 * @description
 * The enclosing property, provided by `cw-property` so the value directive finds it without
 * importing its class (it imports the directive). Not exported from the entry point.
 *
 * @type {InjectionToken<PropertyHost>}
 */
export const PROPERTY: InjectionToken<PropertyHost> = new InjectionToken<PropertyHost>('PROPERTY');
