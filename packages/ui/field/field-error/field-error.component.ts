import { Component, computed, HostAttributeToken, inject, input } from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { FieldContext, registerFieldPart } from '../field-context/field-context.service';
import type { CwFieldErrorItem, CwFieldErrors } from '../field.types';

function isErrorList(errors: CwFieldErrors): errors is readonly CwFieldErrorItem[] {
  return Array.isArray(errors);
}

/**
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
  /** Errors of the control; the first one with a message is displayed. */
  readonly errors = input<CwFieldErrors>(null);
  /** French sentence per error kind (`{ required: 'Indiquez un préfixe.' }`). */
  readonly messages = input<Readonly<Record<string, string>>>({});

  private readonly context = inject(FieldContext, { optional: true });

  protected readonly id =
    inject(new HostAttributeToken('id'), { optional: true }) ??
    inject(_IdGenerator).getId('cw-field-error-');
  protected readonly shown = computed(() => this.context?.isInvalid() ?? true);
  protected readonly message = computed(() => {
    const errors = this.errors();
    const messages = this.messages();
    if (!errors) return null;
    if (isErrorList(errors)) {
      for (const error of errors) {
        const text = error.message ?? messages[error.kind];
        if (text) return text;
      }
      return null;
    }
    for (const kind of Object.keys(errors)) {
      const text = messages[kind];
      if (text) return text;
    }
    return null;
  });

  constructor() {
    if (this.context) registerFieldPart(this.context.errors, this.id);
  }
}
