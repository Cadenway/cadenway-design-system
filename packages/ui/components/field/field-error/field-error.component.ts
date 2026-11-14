import {
  Component,
  computed,
  HostAttributeToken,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { FieldContext, registerFieldPart } from '../field-context/field-context.service';
import type { CwFieldErrorItem, CwFieldErrors } from '../field.types';

/**
 * Function isErrorList
 *
 * @description
 * Identifies Signal Forms error lists.
 *
 * @param {CwFieldErrors} errors - Reactive Forms errors, Signal Forms errors or an empty value.
 *
 * @returns {errors is readonly CwFieldErrorItem[]} Whether the value is a Signal Forms error list.
 */
function isErrorList(errors: CwFieldErrors): errors is readonly CwFieldErrorItem[] {
  return Array.isArray(errors);
}

/**
 * Component CwFieldError
 *
 * @description
 * The error of a field: a filled `warning-circle` and a sentence that says what to do, in
 * `text-destructive` (Field sheet).
 *
 * In a `cw-field` it is shown only while the field is invalid (the control invalid and touched, or
 * `invalid` forced), and its id is then added to the control's `aria-describedby`; outside a field
 * it is always shown. The text is the first message found in `errors` (a Signal Forms error's own
 * `message`, else `messages[kind]`; Reactive Forms keys are looked up in `messages`), else the
 * projected content. It appears without animation.
 */
@Component({
  selector: 'cw-field-error',
  imports: [NgIcon],
  providers: [provideIcons({ phosphorWarningCircleFill })],
  host: {
    '[attr.id]': 'id',
    '[class]':
      'shown() ? "flex items-center gap-1 text-xs font-medium text-destructive" : "hidden"',
  },
  templateUrl: './field-error.component.html',
})
export class CwFieldError {
  // #region Properties
  /**
   * Property errors
   * @readonly
   *
   * @description
   * Errors of the control.
   *
   * @type {InputSignal<CwFieldErrors>}
   */
  public readonly errors: InputSignal<CwFieldErrors> = input<CwFieldErrors>(null);

  /**
   * Property messages
   * @readonly
   *
   * @description
   * Messages indexed by error kind.
   *
   * @type {InputSignal<Readonly<Record<string, string>>>}
   */
  public readonly messages: InputSignal<Readonly<Record<string, string>>> = input<
    Readonly<Record<string, string>>
  >({});

  /**
   * Property context
   * @readonly
   *
   * @description
   * Parent field context when present.
   *
   * @type {FieldContext | null}
   */
  private readonly context: FieldContext | null = inject(FieldContext, { optional: true });

  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier registered with the parent field.
   *
   * @type {string}
   */
  protected readonly id: string =
    inject(new HostAttributeToken('id'), { optional: true }) ??
    inject(_IdGenerator).getId('cw-field-error-');

  /**
   * Property shown
   * @readonly
   *
   * @description
   * Whether the error is visible.
   *
   * @type {Signal<boolean>}
   */
  protected readonly shown: Signal<boolean> = computed(() => this.context?.isInvalid() ?? true);

  /**
   * Property message
   * @readonly
   *
   * @description
   * First available error message.
   *
   * @type {Signal<string | null>}
   */
  protected readonly message: Signal<string | null> = computed(() => {
    const errors: CwFieldErrors = this.errors();
    const messages: Readonly<Record<string, string>> = this.messages();
    if (!errors) return null;
    if (isErrorList(errors)) {
      for (const error of errors) {
        const text: string | undefined = error.message ?? messages[error.kind];
        if (text) return text;
      }
      return null;
    }
    for (const kind of Object.keys(errors)) {
      const text: string | undefined = messages[kind];
      if (text) return text;
    }
    return null;
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Registers the error with the parent field.
   */
  public constructor() {
    if (this.context) registerFieldPart(this.context.errors, this.id);
  }
  // #endregion
}
