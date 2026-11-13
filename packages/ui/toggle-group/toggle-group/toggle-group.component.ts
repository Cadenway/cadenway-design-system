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
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwToggleGroupItem } from '../toggle-group-item/toggle-group-item.component';
import { TOGGLE_GROUP_ITEM } from '../toggle-group-item.token';
import type {
  CwToggleGroupOrientation,
  CwToggleGroupSize,
  CwToggleGroupType,
  CwToggleGroupValue,
  CwToggleGroupVariant,
} from '../toggle-group.types';

/* Attached items (spacing 0): inner corners cancelled, shared borders merged, the focused item above
   its neighbors so its ring shows whole. `sm` items have `rounded-md` corners. */
const ATTACHED: Record<CwToggleGroupOrientation, Record<'sm' | 'other', string>> = {
  horizontal: {
    sm: 'flex w-fit items-center [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:border-l-0',
    other:
      'flex w-fit items-center [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg [&>*:not(:first-child)]:border-l-0',
  },
  vertical: {
    sm: 'flex w-fit flex-col [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md [&>*:not(:first-child)]:border-t-0',
    other:
      'flex w-fit flex-col [&>*]:focus-visible:z-10 [&>*]:rounded-none [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg [&>*:not(:first-child)]:border-t-0',
  },
};

const SPACED: Record<CwToggleGroupOrientation, string> = {
  horizontal: 'flex w-fit items-center gap-1',
  vertical: 'flex w-fit flex-col gap-1',
};

/**
 * A set of linked toggles for one display setting, single or multiple choice: text formatting,
 * density, grouping (Toggle Group sheet of the Design System artifact).
 *
 * Project `button[cwToggleGroupItem]` elements. `type="single"` is a `role="radiogroup"` whose items
 * are `role="radio"` with `aria-checked`; the arrows select as they move. `type="multiple"` is a
 * `role="group"` whose items carry `aria-pressed`; the arrows only move the focus. One Tab stop
 * (roving tabindex through the CDK `FocusKeyManager`): the last focused item, else the first item
 * that is on, else the first enabled one; the arrows follow `orientation` and wrap, Home and End
 * reach the ends, disabled items are skipped. `variant` and `size` apply to every item; `spacing` 0
 * welds them, any other value spaces them by `gap-1`.
 *
 * `[(value)]` is a model (`string | null` in single, `string[]` in multiple); the group works with
 * Signal Forms (`[formField]`, it is a `FormValueControl`) and with Reactive or template-driven forms
 * (it is the control's value accessor). `aria-invalid` is set when the control is invalid and touched.
 * Name it with `ariaLabel`. Style hooks: `data-orientation`, `data-spacing`, `data-disabled`.
 */
@Component({
  selector: 'cw-toggle-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'type() === "single" ? "radiogroup" : "group"',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-invalid]': 'isInvalid() ? "true" : null',
    '[attr.aria-required]': 'required() && type() === "single" ? "true" : null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-spacing]': 'spacing()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './toggle-group.component.html',
})
export class CwToggleGroup implements FormValueControl<CwToggleGroupValue>, ControlValueAccessor {
  /** Single choice (radio group, the default) or multiple choice. */
  readonly type = input<CwToggleGroupType>('single');
  /** Value: `string | null` in single choice, `string[]` in multiple choice; `[(value)]`. */
  readonly value = model<CwToggleGroupValue>(null);
  /** Look of every item. */
  readonly variant = input<CwToggleGroupVariant>('default');
  /** Height of every item. */
  readonly size = input<CwToggleGroupSize>('default');
  /** 0 welds the items together; any other value spaces them by 4 px (`gap-1`). */
  readonly spacing = input(0, { transform: numberAttribute });
  /** Direction of the group and of its arrow keys. */
  readonly orientation = input<CwToggleGroupOrientation>('horizontal');
  /** Disables every item (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required` in single choice. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Accessible name of the group (« Grouper par »). */
  readonly ariaLabel = input('');
  /** Emitted when focus leaves the group: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly items = contentChildren(TOGGLE_GROUP_ITEM);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dir = inject(Directionality, { optional: true });
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private readonly lastFocused = signal<CwToggleGroupItem | null>(null);
  private onChange: (value: CwToggleGroupValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  private readonly keyManager = new FocusKeyManager(
    computed(() => this.items().map((item) => item.keyOption)),
    inject(Injector),
  )
    .withWrap()
    .withHomeAndEnd();

  /** @internal Whether every item is disabled, by the group input or the form control. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** @internal The values that are on, whatever the type. */
  readonly selected = computed<readonly string[]>(() => {
    const value = this.value();
    if (Array.isArray(value)) return value as readonly string[];
    return typeof value === 'string' ? [value] : [];
  });

  /** @internal The single item that takes the Tab stop. */
  readonly tabStop = computed(() => {
    const enabled = this.items().filter((item) => !item.isDisabled());
    const last = this.lastFocused();
    if (last && enabled.includes(last)) return last;
    const selected = this.selected();
    return enabled.find((item) => selected.includes(item.value())) ?? enabled.at(0) ?? null;
  });

  protected readonly classes = computed(() => {
    const orientation = this.orientation();
    if (this.spacing() > 0) return SPACED[orientation];
    return ATTACHED[orientation][this.size() === 'sm' ? 'sm' : 'other'];
  });

  constructor() {
    // Reactive and template-driven forms: this group is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the group can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    effect(() => {
      if (this.orientation() === 'vertical') {
        this.keyManager.withVerticalOrientation(true).withHorizontalOrientation(null);
      } else {
        this.keyManager
          .withVerticalOrientation(false)
          .withHorizontalOrientation(this.dir?.value === 'rtl' ? 'rtl' : 'ltr');
      }
    });
  }

  /** Moves the focus to the Tab stop (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    this.tabStop()?.focus(options);
  }

  writeValue(value: unknown): void {
    if (Array.isArray(value)) {
      this.value.set(value.filter((entry): entry is string => typeof entry === 'string'));
    } else {
      this.value.set(typeof value === 'string' ? value : null);
    }
  }

  registerOnChange(fn: (value: CwToggleGroupValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /** @internal Called by an item on click: selects it (single) or flips it (multiple). */
  activate(item: CwToggleGroupItem): void {
    const value = item.value();
    let next: CwToggleGroupValue;
    if (this.type() === 'single') {
      // A radio group keeps its choice: clicking the item that is on leaves it on.
      if (this.value() === value) return;
      next = value;
    } else {
      const selected = this.selected();
      next = selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value];
    }
    this.value.set(next);
    this.onChange(next);
  }

  /** @internal Called by an item when it receives the focus. */
  focused(item: CwToggleGroupItem): void {
    this.lastFocused.set(item);
    this.keyManager.updateActiveItem(item.keyOption);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const before = this.keyManager.activeItem;
    const orientation = this.orientation() === 'vertical' ? 'vertical' : 'horizontal';
    if (ɵnavigateList(this.keyManager, event, orientation, this.dir?.value === 'rtl')) {
      event.preventDefault();
    }
    const after = this.keyManager.activeItem;
    if (this.type() !== 'single' || !after || after === before) return;
    // Single choice follows the focus, as a native radio group does (Toggle Group sheet, "Clavier").
    const item = this.items().find((candidate) => candidate.keyOption === after);
    if (item) this.activate(item);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && this.host.contains(event.relatedTarget)) return;
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }
}
