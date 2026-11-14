import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';
import { NgControl } from '@angular/forms';
import type { Subscription } from 'rxjs';

import { FieldContext, type FieldLabelRef } from './field-context/field-context.service';
import type { CwFieldOrientation } from './field.types';

/* The element `cw-field` wires to its label, description and error: the first form control of its
   content, a native one or a brick's inner element (`cw-checkbox`, `cw-switch` render a button with a
   role, `cw-radio-group` is the radiogroup itself). */
/**
 * Constant CONTROL
 *
 * @description
 * Selector for the first form control within the field.
 *
 * @type {string}
 */
const CONTROL: string =
  'input:not([type=hidden]), textarea, select, [role=switch], [role=checkbox], [role=radiogroup], [role=combobox], [role=slider], [role=spinbutton]';

/* Elements a `<label for>` can name; any other control is named through `aria-labelledby`. */
/**
 * Constant LABELABLE
 *
 * @description
 * Selector for elements named by a native label.
 *
 * @type {string}
 */
const LABELABLE: string = 'input, textarea, select, button, meter, output, progress';

/* Literal class strings (Field sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
/**
 * Constant BASE
 *
 * @description
 * Base classes for a field.
 *
 * @type {string}
 */
const BASE: string = 'group/field flex w-full data-[disabled=true]:opacity-50';

/**
 * Constant ORIENTATIONS
 *
 * @description
 * Layout classes for each field orientation.
 *
 * @type {Record<CwFieldOrientation, string>}
 */
const ORIENTATIONS: Record<CwFieldOrientation, string> = {
  vertical: 'flex-col gap-2',
  // A 16 px box or radio sits on the first 20 px line of the content next to it.
  horizontal:
    'flex-row items-start gap-3 [&>cw-checkbox]:mt-0.5 [&>cw-radio-group-item]:mt-0.5 [&>cw-switch[data-size=sm]]:mt-0.5',
};

/**
 * Function splitIds
 *
 * @description
 * Splits an accessibility attribute into nonempty identifiers.
 *
 * @param {string | null} value - Whitespace-separated accessibility identifiers, or null.
 *
 * @returns {string[]} Nonempty identifiers in their original order.
 */
function splitIds(value: string | null): string[] {
  return (value ?? '').split(/\s+/).filter((id) => id !== '');
}

/**
 * Component CwField
 *
 * @description
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
  providers: [FieldContext],
  host: {
    '[class]': 'classes()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-invalid]': 'isInvalid() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
  },
  templateUrl: './field.component.html',
})
export class CwField {
  // #region Properties
  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Layout of the field and control.
   *
   * @type {InputSignal<CwFieldOrientation>}
   */
  public readonly orientation: InputSignal<CwFieldOrientation> =
    input<CwFieldOrientation>('vertical');

  /**
   * Property invalid
   * @readonly
   *
   * @description
   * Whether the error state is forced.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the disabled state is forced.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property context
   * @readonly
   *
   * @description
   * Shared context for field parts.
   *
   * @type {FieldContext}
   */
  private readonly context: FieldContext = inject(FieldContext, { self: true });

  /**
   * Property element
   * @readonly
   *
   * @description
   * Host element containing the control.
   *
   * @type {HTMLElement}
   */
  private readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property idGenerator
   * @readonly
   *
   * @description
   * Generator for accessible identifiers.
   *
   * @type {_IdGenerator}
   */
  private readonly idGenerator: _IdGenerator = inject(_IdGenerator);

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Form control projected into the field.
   *
   * @type {Signal<NgControl | undefined>}
   */
  private readonly ngControl: Signal<NgControl | undefined> = contentChild(NgControl, {
    descendants: true,
  });
  // Reactive Forms state is not a signal: its `events` stream bumps this counter.
  /**
   * Property controlChanges
   * @readonly
   *
   * @description
   * Counter updated when the form control emits changes.
   *
   * @type {WritableSignal<number>}
   */
  private readonly controlChanges: WritableSignal<number> = signal(0);

  /**
   * Property wired
   *
   * @description
   * Control most recently wired to the field.
   *
   * @type {HTMLElement | null}
   */
  private wired: HTMLElement | null = null;

  /**
   * Property baseDescribedBy
   *
   * @description
   * Description identifiers originally supplied by the consumer.
   *
   * @type {string[]}
   */
  private baseDescribedBy: string[] = [];

  /**
   * Property baseLabelledBy
   *
   * @description
   * Label identifiers originally supplied by the consumer.
   *
   * @type {string[]}
   */
  private baseLabelledBy: string[] = [];

  /**
   * Property forcedInvalid
   *
   * @description
   * Whether this field added aria-invalid.
   *
   * @type {boolean}
   */
  private forcedInvalid: boolean = false;

  /**
   * Property controlInvalid
   * @readonly
   *
   * @description
   * Whether the form control is invalid and touched.
   *
   * @type {Signal<boolean>}
   */
  private readonly controlInvalid: Signal<boolean> = computed(() => {
    this.controlChanges();
    const control: NgControl | undefined = this.ngControl();
    return !!control && control.invalid === true && control.touched === true;
  });

  /**
   * Property controlDisabled
   * @readonly
   *
   * @description
   * Whether the form control is disabled.
   *
   * @type {Signal<boolean>}
   */
  private readonly controlDisabled: Signal<boolean> = computed(() => {
    this.controlChanges();
    return this.ngControl()?.disabled === true;
  });

  /**
   * Property isInvalid
   * @readonly
   *
   * @description
   * Combined forced and form invalid state.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isInvalid: Signal<boolean> = computed(
    () => this.invalid() || this.controlInvalid(),
  );

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Combined forced and form disabled state.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.controlDisabled(),
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Layout classes for the current orientation.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${BASE} ${ORIENTATIONS[this.orientation()]}`,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Tracks form state and wires field parts after rendering.
   */
  public constructor() {
    this.context.connect(this.isInvalid);

    effect((onCleanup) => {
      // Signal Forms' control reads signals and has no `events` stream: it needs no subscription.
      const events: NonNullable<NgControl['control']>['events'] | undefined =
        this.ngControl()?.control?.events;
      if (!events) return;
      const subscription: Subscription = events.subscribe(() => {
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
  // #endregion

  // #region Methods
  /**
   * Method wire
   *
   * @description
   * Links the control to its labels, descriptions and errors.
   *
   * @param {readonly FieldLabelRef[]} labels - Registered labels to associate with the control.
   * @param {readonly string[]} descriptions - Description identifiers to include in aria-describedby.
   * @param {readonly string[]} errors - Visible error identifiers to include in aria-describedby.
   * @param {boolean} forceInvalid - Whether to set aria-invalid independently of form state.
   */
  private wire(
    labels: readonly FieldLabelRef[],
    descriptions: readonly string[],
    errors: readonly string[],
    forceInvalid: boolean,
  ): void {
    const control: HTMLElement | null = this.element.querySelector<HTMLElement>(CONTROL);
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

  /**
   * Method setIds
   *
   * @description
   * Sets or removes an accessibility attribute with deduplicated identifiers.
   *
   * @param {HTMLElement} control - Control whose accessibility attribute is updated.
   * @param {string} attribute - Accessibility attribute containing identifiers.
   * @param {string[]} ids - Identifiers to deduplicate and write.
   */
  private setIds(control: HTMLElement, attribute: string, ids: string[]): void {
    const value: string = [...new Set(ids)].join(' ');
    if (value) control.setAttribute(attribute, value);
    else control.removeAttribute(attribute);
  }
  // #endregion
}
