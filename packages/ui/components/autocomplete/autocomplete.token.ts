import { InjectionToken, type Signal } from '@angular/core';

import type { CwAutocompleteOption } from './autocomplete-option/autocomplete-option.component';

/**
 * Interface AutocompleteHost
 *
 * @description
 * Context shared with autocomplete suggestions.
 */
export interface AutocompleteHost {
  // #region Properties
  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Suggestion highlighted by keyboard or pointer.
   *
   * @type {Signal<CwAutocompleteOption | null>}
   */
  readonly highlighted: Signal<CwAutocompleteOption | null>;

  /**
   * Property options
   * @readonly
   *
   * @description
   * Suggestions in display order.
   *
   * @type {Signal<readonly CwAutocompleteOption[]>}
   */
  readonly options: Signal<readonly CwAutocompleteOption[]>;

  /**
   * Property mark
   * @readonly
   *
   * @description
   * Query text highlighted in labels.
   *
   * @type {Signal<string>}
   */
  readonly mark: Signal<string>;

  /**
   * Property entering
   * @readonly
   *
   * @description
   * Whether suggestion entrance animations play.
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
   * Chooses a suggestion.
   *
   * @param {CwAutocompleteOption} option - Suggestion to select.
   */
  choose(option: CwAutocompleteOption): void;

  /**
   * Method highlightOption
   *
   * @description
   * Highlights a suggestion.
   *
   * @param {CwAutocompleteOption} option - Suggestion to highlight.
   */
  highlightOption(option: CwAutocompleteOption): void;
  // #endregion
}

/**
 * Constant AUTOCOMPLETE_HOST
 *
 * @description
 * The panel a suggestion belongs to. The panel provides itself under this token, so its
 * suggestions find it without importing its class (it imports them). Not exported from the entry
 * point.
 *
 * @type {InjectionToken<AutocompleteHost>}
 */
export const AUTOCOMPLETE_HOST: InjectionToken<AutocompleteHost> =
  new InjectionToken<AutocompleteHost>('AUTOCOMPLETE_HOST');
