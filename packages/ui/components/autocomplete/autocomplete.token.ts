import { InjectionToken, type Signal } from '@angular/core';

import type { CwAutocompleteOption } from './autocomplete-option/autocomplete-option.component';

/** What a suggestion reads from the panel that holds it. */
export interface AutocompleteHost {
  /** The suggestion highlighted by the arrows or the pointer, for `data-highlighted`. */
  readonly highlighted: Signal<CwAutocompleteOption | null>;
  /** The suggestions of the panel, in order, for the entrance stagger. */
  readonly options: Signal<readonly CwAutocompleteOption[]>;
  /** The typed text to set in bold in each label; empty when `highlight` is off. */
  readonly mark: Signal<string>;
  /** Whether the rows play their entrance: at opening only, not at each keystroke. */
  readonly entering: Signal<boolean>;
  /** Chooses a suggestion (click). */
  choose(option: CwAutocompleteOption): void;
  /** Highlights a suggestion (pointer). */
  highlightOption(option: CwAutocompleteOption): void;
}

/**
 * The panel a suggestion belongs to. The panel provides itself under this token, so its
 * suggestions find it without importing its class (it imports them). Not exported from the entry
 * point.
 */
export const AUTOCOMPLETE_HOST = new InjectionToken<AutocompleteHost>('AUTOCOMPLETE_HOST');
