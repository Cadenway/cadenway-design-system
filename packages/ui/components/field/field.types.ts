import type { ValidationErrors } from '@angular/forms';

/**
 * Type CwFieldOrientation
 *
 * @description
 * Layout of a field: label above the control, or content beside the control.
 *
 * @type {'vertical' | 'horizontal'}
 */
export type CwFieldOrientation = 'vertical' | 'horizontal';

/**
 * Type CwFieldLabelVariant
 *
 * @description
 * Look of a field label: plain text, or a choice card wrapping its control.
 *
 * @type {'default' | 'card'}
 */
export type CwFieldLabelVariant = 'default' | 'card';

/**
 * Interface CwFieldErrorItem
 *
 * @description
 * Signal Forms error kind and optional message.
 */
export interface CwFieldErrorItem {
  // #region Properties
  /**
   * Property kind
   * @readonly
   *
   * @description
   * Error kind used to look up a message.
   *
   * @type {string}
   */
  readonly kind: string;

  /**
   * Property message
   * @readonly
   *
   * @description
   * Error message overriding the configured messages.
   *
   * @type {string | undefined}
   */
  readonly message?: string;
  // #endregion
}

/**
 * Type CwFieldErrors
 *
 * @description
 * The errors `cw-field-error` displays: Reactive Forms `ValidationErrors`, the Signal Forms error
 * list, or nothing.
 *
 * @type {ValidationErrors | readonly CwFieldErrorItem[] | null | undefined}
 */
export type CwFieldErrors = ValidationErrors | readonly CwFieldErrorItem[] | null | undefined;
