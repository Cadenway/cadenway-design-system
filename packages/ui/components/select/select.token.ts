import { InjectionToken, type Signal } from '@angular/core';

import type { CwSelectOption } from './select-option/select-option.component';

/** What an option, a group or the empty message reads from the select that holds it. */
export interface SelectHost {
  /** Whether the option's value is the select's value. */
  isSelected(value: unknown): boolean;
  /** The option highlighted by the arrows or the pointer, for `data-highlighted`. */
  readonly highlighted: Signal<CwSelectOption | null>;
  /** The options of the select, in order, for the entrance stagger. */
  readonly options: Signal<readonly CwSelectOption[]>;
  /** Chooses an option (click). */
  choose(option: CwSelectOption): void;
  /** Highlights an option (pointer). */
  highlight(option: CwSelectOption): void;
}

/**
 * The select an option belongs to. The select provides itself under this token, so its options
 * find it without importing its class (it imports them). Not exported from the entry point.
 */
export const SELECT_HOST = new InjectionToken<SelectHost>('SELECT_HOST');
