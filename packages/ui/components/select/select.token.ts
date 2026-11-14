import { InjectionToken, type Signal } from '@angular/core';

import type { CwSelectOption } from './select-option/select-option.component';

/**
 * Interface SelectHost
 *
 * @description
 * Context shared with options and groups inside a select.
 */
export interface SelectHost {
  // #region Methods
  /**
   * Method isSelected
   *
   * @description
   * Reports whether a value is selected.
   *
   * @param {unknown} value - Option value to compare with the selection.
   *
   * @returns {boolean} Whether the value is currently selected.
   */
  isSelected(value: unknown): boolean;
  // #endregion

  // #region Properties
  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Option highlighted by keyboard or pointer.
   *
   * @type {Signal<CwSelectOption | null>}
   */
  readonly highlighted: Signal<CwSelectOption | null>;

  /**
   * Property options
   * @readonly
   *
   * @description
   * Options in their display order.
   *
   * @type {Signal<readonly CwSelectOption[]>}
   */
  readonly options: Signal<readonly CwSelectOption[]>;
  // #endregion

  // #region Methods
  /**
   * Method choose
   *
   * @description
   * Chooses an option.
   *
   * @param {CwSelectOption} option - Option to select.
   */
  choose(option: CwSelectOption): void;

  /**
   * Method highlight
   *
   * @description
   * Highlights an option.
   *
   * @param {CwSelectOption} option - Option to highlight.
   */
  highlight(option: CwSelectOption): void;
  // #endregion
}

/**
 * Constant SELECT_HOST
 *
 * @description
 * The select an option belongs to. The select provides itself under this token, so its options
 * find it without importing its class (it imports them). Not exported from the entry point.
 *
 * @type {InjectionToken<SelectHost>}
 */
export const SELECT_HOST: InjectionToken<SelectHost> = new InjectionToken<SelectHost>(
  'SELECT_HOST',
);
