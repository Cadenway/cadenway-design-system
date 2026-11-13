import type { ValidationErrors } from '@angular/forms';

/** Layout of a field: label above the control, or content beside the control. */
export type CwFieldOrientation = 'vertical' | 'horizontal';

/** Look of a field label: plain text, or a choice card wrapping its control. */
export type CwFieldLabelVariant = 'default' | 'card';

/** One error of a Signal Forms field (`field().errors()`): its kind and its optional message. */
export interface CwFieldErrorItem {
  /** Kind of the error (`required`, `minLength`…), the key looked up in `messages`. */
  readonly kind: string;
  /** Message carried by the error itself; it wins over `messages`. */
  readonly message?: string;
}

/**
 * The errors `cw-field-error` displays: Reactive Forms `ValidationErrors`, the Signal Forms error
 * list, or nothing.
 */
export type CwFieldErrors = ValidationErrors | readonly CwFieldErrorItem[] | null | undefined;
