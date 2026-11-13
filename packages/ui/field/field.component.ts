import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgControl } from '@angular/forms';

import { FieldContext, type FieldLabelRef } from './field-context/field-context.service';
import type { CwFieldOrientation } from './field.types';

/* The element `cw-field` wires to its label, description and error: the first form control of its
   content, a native one or a brick's inner element (`cw-checkbox`, `cw-switch` render a button with a
   role, `cw-radio-group` is the radiogroup itself). */
const CONTROL =
  'input:not([type=hidden]), textarea, select, [role=switch], [role=checkbox], [role=radiogroup], [role=combobox], [role=slider], [role=spinbutton]';

/* Elements a `<label for>` can name; any other control is named through `aria-labelledby`. */
const LABELABLE = 'input, textarea, select, button, meter, output, progress';

/* Literal class strings (Field sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
const BASE = 'group/field flex w-full data-[disabled=true]:opacity-50';

const ORIENTATIONS: Record<CwFieldOrientation, string> = {
  vertical: 'flex-col gap-2',
  // A 16 px box or radio sits on the first 20 px line of the content next to it.
  horizontal:
    'flex-row items-start gap-3 [&>cw-checkbox]:mt-0.5 [&>cw-radio-group-item]:mt-0.5 [&>cw-switch[data-size=sm]]:mt-0.5',
};

function splitIds(value: string | null): string[] {
  return (value ?? '').split(/\s+/).filter((id) => id !== '');
}

/**
 * One form field: a label, a control, an optional description and an error, laid out vertically
 * or side by side (Field sheet of the Design System artifact).
 *
 * The field wires its parts to the first control of its content (a native `input`, `textarea` or
 * `select`, or the inner element of `cw-checkbox`, `cw-switch`, `cw-radio-group`…): it gives the
 * control an `id` when it has none, points each `label[cwFieldLabel]` without its own `for` at it
 * (`aria-labelledby` for a control a label cannot name), and adds the ids of its descriptions, and
 * of its error while shown, to the control's `aria-describedby` (the consumer's own ids are kept).
 *
 * `invalid` and `disabled` are deduced from the bound form control (Reactive, template-driven or
 * Signal Forms: invalid once touched); the inputs force them. Invalid sets `data-invalid="true"`,
 * shows `cw-field-error` and, when forced, sets `aria-invalid` on the control; the label does not
 * change. Disabled sets `data-disabled="true"` and `aria-disabled="true"`, and dims the whole
 * field to 50 %.
 */
@Component({
  selector: 'cw-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FieldContext],
  host: {
    '[class]': 'classes()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-invalid]': 'isInvalid() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
    // The dimmed texts of a disabled field are exempt from contrast, as the disabled control is.
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
  },
  templateUrl: './field.component.html',
})
export class CwField {
  /** Label, control and description stacked, or content on the left and control on the right. */
  readonly orientation = input<CwFieldOrientation>('vertical');
  /** Forces the error state (a server error, a check outside the form). */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Forces the disabled look. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly context = inject(FieldContext, { self: true });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly idGenerator = inject(_IdGenerator);
  private readonly ngControl = contentChild(NgControl, { descendants: true });
  // Reactive Forms state is not a signal: its `events` stream bumps this counter.
  private readonly controlChanges = signal(0);
  private wired: HTMLElement | null = null;
  private baseDescribedBy: string[] = [];
  private baseLabelledBy: string[] = [];
  private forcedInvalid = false;

  private readonly controlInvalid = computed(() => {
    this.controlChanges();
    const control = this.ngControl();
    return !!control && control.invalid === true && control.touched === true;
  });
  private readonly controlDisabled = computed(() => {
    this.controlChanges();
    return this.ngControl()?.disabled === true;
  });

  protected readonly isInvalid = computed(() => this.invalid() || this.controlInvalid());
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());
  protected readonly classes = computed(() => `${BASE} ${ORIENTATIONS[this.orientation()]}`);

  constructor() {
    this.context.connect(this.isInvalid);

    effect((onCleanup) => {
      // Signal Forms' control reads signals and has no `events` stream: it needs no subscription.
      const events = this.ngControl()?.control?.events;
      if (!events) return;
      const subscription = events.subscribe(() => {
        this.controlChanges.update((count) => count + 1);
      });
      onCleanup(() => {
        subscription.unsubscribe();
      });
    });

    afterRenderEffect(() => {
      this.wire(
        this.context.labels(),
        this.context.descriptions(),
        this.isInvalid() ? this.context.errors() : [],
        this.invalid(),
      );
    });
  }

  private wire(
    labels: readonly FieldLabelRef[],
    descriptions: readonly string[],
    errors: readonly string[],
    forceInvalid: boolean,
  ): void {
    const control = this.element.querySelector<HTMLElement>(CONTROL);
    if (!control) return;
    if (control !== this.wired) {
      this.wired = control;
      this.baseDescribedBy = splitIds(control.getAttribute('aria-describedby'));
      this.baseLabelledBy = splitIds(control.getAttribute('aria-labelledby'));
    }
    if (!control.id) control.id = this.idGenerator.getId('cw-field-control-');

    const labelledBy: string[] = [];
    for (const label of labels) {
      if (label.explicit) continue;
      if (control.matches(LABELABLE)) {
        label.element.htmlFor = control.id;
      } else {
        if (!label.element.id) label.element.id = this.idGenerator.getId('cw-field-label-');
        labelledBy.push(label.element.id);
      }
    }
    this.setIds(control, 'aria-labelledby', [...this.baseLabelledBy, ...labelledBy]);
    this.setIds(control, 'aria-describedby', [...this.baseDescribedBy, ...descriptions, ...errors]);

    if (forceInvalid) {
      control.setAttribute('aria-invalid', 'true');
      this.forcedInvalid = true;
    } else if (this.forcedInvalid) {
      this.forcedInvalid = false;
      if (!this.controlInvalid()) control.removeAttribute('aria-invalid');
    }
  }

  private setIds(control: HTMLElement, attribute: string, ids: string[]): void {
    const value = [...new Set(ids)].join(' ');
    if (value) control.setAttribute(attribute, value);
    else control.removeAttribute(attribute);
  }
}
