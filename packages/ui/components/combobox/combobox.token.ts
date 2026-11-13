import { InjectionToken, type Signal } from '@angular/core';

import type { CwComboboxOption } from './combobox-option/combobox-option.component';

/** What an option, a group or the empty message reads from the combobox that holds it. */
export interface ComboboxHost {
  /** Whether the option's value is (one of) the combobox's value(s). */
  isSelected(value: unknown): boolean;
  /** Whether the option matches the current search. */
  matches(option: CwComboboxOption): boolean;
  /** The option highlighted by the arrows or the pointer, for `data-highlighted`. */
  readonly highlighted: Signal<CwComboboxOption | null>;
  /** The options of the combobox, in order, for the entrance stagger. */
  readonly options: Signal<readonly CwComboboxOption[]>;
  /** Whether the rows play their entrance: at opening only, not at each keystroke. */
  readonly entering: Signal<boolean>;
  /** Chooses an option (click). */
  choose(option: CwComboboxOption): void;
  /** Highlights an option (pointer). */
  highlight(option: CwComboboxOption): void;
}

/**
 * The combobox an option belongs to. The combobox provides itself under this token, so its options
 * find it without importing its class (it imports them). Not exported from the entry point.
 */
export const COMBOBOX_HOST = new InjectionToken<ComboboxHost>('COMBOBOX_HOST');
