import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FocusKeyManager, type FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';

import type { CwRadioGroupItem } from './radio-group-item.component';
import { RADIO_GROUP_ITEM } from './radio-group-item.token';
import type { CwRadioGroupOrientation } from './radio-group.types';

/* Literal class strings (Radio Group sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. */
const ORIENTATIONS: Record<CwRadioGroupOrientation, string> = {
  vertical: 'grid gap-3',
  horizontal: 'flex flex-wrap gap-4',
};

const NEXT = new Set(['ArrowDown', 'ArrowRight']);
const PREVIOUS = new Set(['ArrowUp', 'ArrowLeft']);

/**
 * A single choice among two to five options, all visible (Radio Group sheet of the Design System
 * artifact). More options: a Select; several choices: checkboxes.
 *
 * `role="radiogroup"` around `cw-radio-group-item` options; name it with the `legend` of its
 * fieldset (a `cw-field` label is wired through `aria-labelledby`) or `ariaLabel`. `[(value)]` is a
 * model (`valueChange` on each selection, `null` while nothing is selected); the group works with
 * Signal Forms (`[formField]`, it is a `FormValueControl<string | null>`) and with Reactive or
 * template-driven forms (it is the control's value accessor). Roving focus: Tab enters on the
 * selected option (or the first one) and leaves the group; the arrows select the next or previous
 * option, wrapping around and skipping disabled ones; Space selects the focused option.
 * `aria-invalid` is set on the group and its radios while the form control is invalid and touched.
 */
@Component({
  selector: 'cw-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'radiogroup',
    '[class]': 'orientationClasses()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-required]': 'required() ? "true" : null',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './radio-group.component.html',
})
export class CwRadioGroup implements FormValueControl<string | null>, ControlValueAccessor {
  /** Value of the selected option, `null` when none is; `[(value)]`. */
  readonly value = model<string | null>(null);
  /** Options stacked (`gap-3`) or in a row (`gap-4`). */
  readonly orientation = input<CwRadioGroupOrientation>('vertical');
  /** Disables every option (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** A choice is required; `aria-required` (Signal Forms binds it from the field). */
  readonly required = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Accessible name when no legend or label names the group (« Visibilité »). */
  readonly ariaLabel = input('');
  /** Emitted when focus leaves the group: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly direction = inject(Directionality, { optional: true });
  private readonly items = contentChildren(RADIO_GROUP_ITEM, { descendants: true });
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  // Reactive Forms state is not a signal: its `events` stream bumps this counter, so the options
  // (each in its own view) follow the validity of the group.
  private readonly controlChanges = signal(0);
  private readonly keyManager = new FocusKeyManager<FocusableOption>(
    computed(() => this.items().map((item) => item.option)),
    inject(Injector),
  ).withWrap();
  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Whether every option is disabled. Read by the options. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** Whether the group shows its error state. Read by the options. */
  readonly isInvalid = computed(() => {
    if (this.invalid() && this.touched()) return true;
    this.controlChanges();
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  });
  /** The option reached by Tab: the selected one when enabled, else the first enabled one. */
  readonly tabStop = computed(() => {
    const enabled = this.items().filter((item) => !item.isDisabled());
    return enabled.find((item) => item.value() === this.value()) ?? enabled.at(0);
  });
  protected readonly orientationClasses = computed(() => ORIENTATIONS[this.orientation()]);

  constructor() {
    // Reactive and template-driven forms: this group is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the group can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    effect((onCleanup) => {
      // Signal Forms' control reads signals and has no `events` stream: it needs no subscription.
      const events = this.ngControl?.control?.events;
      if (!events) return;
      const subscription = events.subscribe(() => {
        this.controlChanges.update((count) => count + 1);
      });
      onCleanup(() => {
        subscription.unsubscribe();
      });
    });
  }

  /** Moves the focus to the tab stop (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    this.tabStop()?.focus(options);
  }

  /** Selects an enabled option and reports the new value. Called by the options on click. */
  select(item: CwRadioGroupItem): void {
    if (item.isDisabled()) return;
    const next = item.value();
    if (next === this.value()) return;
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rtl = this.direction?.value === 'rtl';
    const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    let forward = NEXT.has(event.key);
    if (!forward && !PREVIOUS.has(event.key)) return;
    if (rtl && horizontal) forward = !forward;

    const items = this.items();
    const current = items.findIndex((item) => item.hasFocus());
    if (current < 0) return;
    event.preventDefault();
    // The key manager owns the wrap and skips the disabled options; the focus selects.
    this.keyManager.updateActiveItem(current);
    if (forward) this.keyManager.setNextItemActive();
    else this.keyManager.setPreviousItemActive();
    const active = items.at(this.keyManager.activeItemIndex ?? -1);
    if (active) this.select(active);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.element.contains(next)) return;
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }
}
