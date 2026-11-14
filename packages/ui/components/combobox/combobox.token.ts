import { InjectionToken, type Signal } from '@angular/core';

import type { CwComboboxOption } from './combobox-option/combobox-option.component';

/**
 * Interface ComboboxHost
 *
 * @description
 * Context shared with options inside a combobox.
 */
export interface ComboboxHost {
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

  /**
   * Method matches
   *
   * @description
   * Reports whether an option matches the search.
   *
   * @param {CwComboboxOption} option - Option to compare with the current search.
   *
   * @returns {boolean} Whether the option matches the current search.
   */
  matches(option: CwComboboxOption): boolean;
  // #endregion

  // #region Properties
  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Option highlighted by keyboard or pointer.
   *
   * @type {Signal<CwComboboxOption | null>}
   */
  readonly highlighted: Signal<CwComboboxOption | null>;

  /**
   * Property options
   * @readonly
   *
   * @description
   * Options in display order.
   *
   * @type {Signal<readonly CwComboboxOption[]>}
   */
  readonly options: Signal<readonly CwComboboxOption[]>;

  /**
   * Property entering
   * @readonly
   *
   * @description
   * Whether option entrance animations play.
   *
   * @type {Signal<boolean>}
   */
  readonly entering: Signal<boolean>;
  // #endregion

  // #region Methods
  /**
   * Method choose
   *
   * @description
   * Chooses an option.
   *
   * @param {CwComboboxOption} option - Option to select or toggle.
   */
  choose(option: CwComboboxOption): void;

  /**
   * Method highlight
   *
   * @description
   * Highlights an option.
   *
   * @param {CwComboboxOption} option - Option to highlight.
   */
  highlight(option: CwComboboxOption): void;
  // #endregion
}

/**
 * Constant COMBOBOX_HOST
 *
 * @description
 * The combobox an option belongs to. The combobox provides itself under this token, so its options
 * find it without importing its class (it imports them). Not exported from the entry point.
 *
 * @type {InjectionToken<ComboboxHost>}
 */
export const COMBOBOX_HOST: InjectionToken<ComboboxHost> = new InjectionToken<ComboboxHost>(
  'COMBOBOX_HOST',
);
