import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  type TemplateRef,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
  untracked,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActiveDescendantKeyManager, type Highlightable, _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { Subscription } from 'rxjs';
import type { FormValueControl } from '@angular/forms/signals';
import {
  CwRipple,
  CwSwap,
  ɵConnectedPanel,
  ɵFOCUS_FIELD,
  ɵfold,
  ɵnavigateList,
  ɵPanelStack,
  type ɵStackedPanel,
} from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { CwSelectEmpty } from './select-empty/select-empty.component';
import { CwSelectOption } from './select-option/select-option.component';
import { EMPTY } from './select.styles';
import { SELECT_HOST, type SelectHost } from './select.token';
import type { CwSelectCompareWith, CwSelectSize } from './select.types';

/* Literal class strings (Select sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. The trigger has the height of Input; open, it keeps the selected
   veil (`aria-expanded:bg-selected`). */
/**
 * Constant TRIGGER
 *
 * @description
 * Base classes for the select trigger.
 *
 * @type {string}
 */
const TRIGGER: string =
  'group/trigger relative isolate flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden border border-input bg-transparent text-sm whitespace-nowrap transition-[color,background-color,box-shadow] hover:bg-accent aria-expanded:bg-selected disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 data-placeholder:text-muted-foreground motion-reduce:transition-none [&_ng-icon]:shrink-0';

/**
 * Constant SIZES
 *
 * @description
 * Trigger classes by size.
 *
 * @type {Record<CwSelectSize, string>}
 */
const SIZES: Record<CwSelectSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/* The panel: at least as wide as the trigger, as wide as its content up to `max-w-sm`, scrolled past
   320 px. It opens from the trigger corner (`--menu-from`) and closes with `menu-out`. */
/**
 * Constant PANEL
 *
 * @description
 * Classes for the option panel.
 *
 * @type {string}
 */
const PANEL: string =
  'block max-h-80 max-w-sm overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md animate-menu-in data-[state=closed]:animate-menu-out motion-reduce:animate-none';

/* Typeahead: the letters typed within this delay add up to one search (WAI-ARIA listbox pattern). */
/**
 * Constant TYPEAHEAD_MS
 *
 * @description
 * Delay in milliseconds for accumulating typeahead input.
 *
 * @type {number}
 */
const TYPEAHEAD_MS: number = 500;

/**
 * Interface KeyOption
 *
 * @description
 * Select option adapter used by the CDK key manager.
 */
interface KeyOption extends Highlightable {
  // #region Properties
  /**
   * Property option
   * @readonly
   *
   * @description
   * Option represented by this adapter.
   *
   * @type {CwSelectOption}
   */
  readonly option: CwSelectOption;
  // #endregion

  // #region Methods
  /**
   * Method getLabel
   *
   * @description
   * Returns the option text for typeahead.
   *
   * @returns {string} Visible option text used by typeahead.
   */
  getLabel(): string;
  // #endregion
}

/**
 * Function keyOptionOf
 *
 * @description
 * Creates a keyboard manager adapter for an option.
 *
 * @param {CwSelectOption} option - Option to adapt for keyboard navigation.
 *
 * @returns {KeyOption} Keyboard adapter associated with the option.
 */
function keyOptionOf(option: CwSelectOption): KeyOption {
  // The option's signal input `disabled` cannot be the `disabled: boolean` the manager reads.
  return {
    option,
    get disabled(): boolean {
      return option.disabled();
    },
    getLabel: () => option.label(),
    setActiveStyles: () => undefined,
    setInactiveStyles: () => undefined,
  };
}

/**
 * Component CwSelect
 *
 * @description
 * A single-choice drop-down list without search, for 3 to 10 known options: status, priority,
 * destination list (Select sheet of the Design System artifact).
 *
 * The trigger is a `button role="combobox"` with the height of Input (`size`); it shows the chosen
 * option's content (glyph and word, the label sliding in through `CwSwap`) or `placeholder`. The
 * panel is a listbox in a CDK overlay, below the trigger (above when there is no room), at least
 * as wide as it; options come from `cw-select-option`, `cw-select-group` and
 * `cw-select-separator`, the empty message from `emptyText` or a projected `cw-select-empty`.
 *
 * Keyboard (focus stays on the trigger, `aria-activedescendant`): Enter, Space, ↓ or ↑ open on the
 * chosen option; ↓ ↑ Home End move (disabled options skipped); letters jump to the option that
 * starts with them; Enter or Space choose and close; Escape closes unchanged; Tab closes and moves
 * on. A click outside closes.
 *
 * `[(value)]` and `[(open)]` are models (`valueChange`, `openChange`); `compareWith` matches object
 * values. The select works with Signal Forms (`[formField]`, it is a `FormValueControl`) and with
 * Reactive or template-driven forms (it is the control's value accessor); `aria-invalid` is set
 * when the control is invalid and touched. Name it with a `<label for>` (its `id`) or `ariaLabel`.
 */
@Component({
  selector: 'cw-select',
  imports: [NgIcon, CwRipple, CwSwap],
  providers: [
    provideIcons({ phosphorCaretDownBold }),
    ɵConnectedPanel,
    { provide: SELECT_HOST, useExisting: forwardRef(() => CwSelect) },
  ],
  host: {
    class: 'block',
    '[attr.id]': 'null',
  },
  templateUrl: './select.component.html',
})
export class CwSelect<T = unknown>
  implements FormValueControl<T | null>, ControlValueAccessor, SelectHost
{
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Currently selected value.
   *
   * @type {ModelSignal<T | null>}
   */
  public readonly value: ModelSignal<T | null> = model<T | null>(null);

  /**
   * Property open
   * @readonly
   *
   * @description
   * Whether the panel is open.
   *
   * @type {ModelSignal<boolean>}
   */
  public readonly open: ModelSignal<boolean> = model(false);

  /**
   * Property placeholder
   * @readonly
   *
   * @description
   * Text shown when no value is selected.
   *
   * @type {InputSignal<string>}
   */
  public readonly placeholder: InputSignal<string> = input('Choisir…');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Height of the trigger.
   *
   * @type {InputSignal<CwSelectSize>}
   */
  public readonly size: InputSignal<CwSelectSize> = input<CwSelectSize>('default');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the select is disabled.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property compareWith
   * @readonly
   *
   * @description
   * Equality function for option values.
   *
   * @type {InputSignal<CwSelectCompareWith<T>>}
   */
  public readonly compareWith: InputSignal<CwSelectCompareWith<T>> = input<CwSelectCompareWith<T>>(
    (a, b) => a === b,
  );

  /**
   * Property emptyText
   * @readonly
   *
   * @description
   * Message shown when no options are available.
   *
   * @type {InputSignal<string>}
   */
  public readonly emptyText: InputSignal<string> = input('Aucune option');

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name when no label is associated.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('');

  /**
   * Property invalid
   * @readonly
   *
   * @description
   * Invalid state supplied by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property touched
   * @readonly
   *
   * @description
   * Touched state supplied by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly touched: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property required
   * @readonly
   *
   * @description
   * Required state supplied by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier of the trigger.
   *
   * @type {InputSignal<string>}
   */
  public readonly id: InputSignal<string> = input(inject(_IdGenerator).getId('cw-select-'));

  /**
   * Property touch
   * @readonly
   *
   * @description
   * Emits when focus leaves the select.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property optionList
   * @readonly
   *
   * @description
   * Projected options in display order.
   *
   * @type {Signal<readonly CwSelectOption[]>}
   */
  private readonly optionList: Signal<readonly CwSelectOption[]> = contentChildren(CwSelectOption, {
    descendants: true,
  });

  /**
   * Property customEmpty
   * @readonly
   *
   * @description
   * Projected empty message when present.
   *
   * @type {Signal<CwSelectEmpty | undefined>}
   */
  private readonly customEmpty: Signal<CwSelectEmpty | undefined> = contentChild(CwSelectEmpty);

  /**
   * Property trigger
   * @readonly
   *
   * @description
   * Select trigger element.
   *
   * @type {Signal<ElementRef<HTMLButtonElement>>}
   */
  private readonly trigger: Signal<ElementRef<HTMLButtonElement>> =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  /**
   * Property display
   * @readonly
   *
   * @description
   * Container showing the selected option.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   */
  private readonly display: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('display');

  /**
   * Property panelElement
   * @readonly
   *
   * @description
   * Rendered option panel.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   */
  private readonly panelElement: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('panel');

  /**
   * Property panelTemplate
   * @readonly
   *
   * @description
   * Template attached to the panel.
   *
   * @type {Signal<TemplateRef<unknown>>}
   */
  private readonly panelTemplate: Signal<TemplateRef<unknown>> =
    viewChild.required<TemplateRef<unknown>>('panelTemplate');

  /**
   * Property viewContainerRef
   * @readonly
   *
   * @description
   * Container used to attach the panel.
   *
   * @type {ViewContainerRef}
   */
  private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  /**
   * Property ngControl
   * @readonly
   *
   * @description
   * Reactive or template-driven form control.
   *
   * @type {NgControl | null}
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property formDisabled
   * @readonly
   *
   * @description
   * Disabled state supplied by the value accessor.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   * @readonly
   *
   * @description
   * Touched state supplied by the value accessor.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property active
   * @readonly
   *
   * @description
   * Option currently highlighted.
   *
   * @type {WritableSignal<CwSelectOption | null>}
   */
  private readonly active: WritableSignal<CwSelectOption | null> = signal<CwSelectOption | null>(
    null,
  );

  /**
   * Property keyOptions
   * @readonly
   *
   * @description
   * Cached keyboard adapters for options.
   *
   * @type {WeakMap<CwSelectOption, KeyOption>}
   */
  private readonly keyOptions: WeakMap<CwSelectOption, KeyOption> = new WeakMap<
    CwSelectOption,
    KeyOption
  >();

  /**
   * Property onChange
   *
   * @description
   * Callback registered by the form control.
   *
   * @type {(value: T | null) => void}
   */
  private onChange: (value: T | null) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Touch callback registered by the form control.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property typed
   *
   * @description
   * Accumulated typeahead input.
   *
   * @type {string}
   */
  private typed: string = '';

  /**
   * Property typedTimer
   *
   * @description
   * Timer clearing typeahead input.
   *
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  private typedTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Property keyActed
   *
   * @description
   * Whether a keyboard action already handled the synthesized click.
   *
   * @type {boolean}
   */
  private keyActed: boolean = false;

  /**
   * Property overlay
   * @readonly
   *
   * @description
   * Connected panel hosting the options.
   *
   * @type {ɵConnectedPanel}
   */
  protected readonly overlay: ɵConnectedPanel = inject(ɵConnectedPanel);

  /**
   * Property stack
   * @readonly
   *
   * @description
   * Shared stack of floating panels.
   *
   * @type {ɵPanelStack}
   */
  private readonly stack: ɵPanelStack = inject(ɵPanelStack);

  /**
   * Property stacked
   * @readonly
   *
   * @description
   * Panel adapter registered with the stack.
   *
   * @type {ɵStackedPanel}
   */
  private readonly stacked: ɵStackedPanel = {
    close: () => {
      this.hide();
    },
    contains: (node) => this.overlay.contains(node),
  };

  /**
   * Property listboxId
   * @readonly
   *
   * @description
   * Identifier of the listbox.
   *
   * @type {string}
   */
  protected readonly listboxId: string = inject(_IdGenerator).getId('cw-select-listbox-');

  /**
   * Property listboxLabel
   * @readonly
   *
   * @description
   * Accessible name of the listbox.
   *
   * @type {WritableSignal<string | null>}
   */
  protected readonly listboxLabel: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property emptyClass
   * @readonly
   *
   * @description
   * Classes for the empty message.
   *
   * @type {string}
   */
  protected readonly emptyClass: string = EMPTY;

  /**
   * Property hasCustomEmpty
   * @readonly
   *
   * @description
   * Whether an empty message is projected.
   *
   * @type {Signal<boolean>}
   */
  protected readonly hasCustomEmpty: Signal<boolean> = computed(() => !!this.customEmpty());

  /**
   * Property options
   * @readonly
   *
   * @description
   * Options in display order.
   *
   * @internal
   *
   * @type {Signal<readonly CwSelectOption[]>}
   */
  public readonly options: Signal<readonly CwSelectOption[]> = computed(() => this.optionList());

  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Option highlighted by keyboard or pointer.
   *
   * @internal
   *
   * @type {Signal<CwSelectOption | null>}
   */
  public readonly highlighted: Signal<CwSelectOption | null> = this.active.asReadonly();

  /**
   * Property items
   * @readonly
   *
   * @description
   * Keyboard adapters for the current options.
   *
   * @type {Signal<KeyOption[]>}
   */
  private readonly items: Signal<KeyOption[]> = computed(() =>
    this.options().map((option) => this.keyOptionOf(option)),
  );

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard manager for the option list.
   *
   * @type {ActiveDescendantKeyManager<KeyOption>}
   */
  private readonly keyManager: ActiveDescendantKeyManager<KeyOption> =
    new ActiveDescendantKeyManager<KeyOption>(this.items, inject(Injector)).skipPredicate(
      (item) => item.disabled === true,
    );

  /**
   * Property isDisabled
   * @readonly
   *
   * @description
   * Combined input and form disabled state.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property selectedOption
   * @readonly
   *
   * @description
   * Option matching the selected value.
   *
   * @type {Signal<CwSelectOption | null>}
   */
  protected readonly selectedOption: Signal<CwSelectOption | null> = computed(
    () => this.options().find((option) => this.isSelected(option.value())) ?? null,
  );

  /**
   * Property selectedLabel
   * @readonly
   *
   * @description
   * Text of the selected option.
   *
   * @type {Signal<string>}
   */
  protected readonly selectedLabel: Signal<string> = computed(
    () => this.selectedOption()?.label() ?? '',
  );

  /**
   * Property activeId
   * @readonly
   *
   * @description
   * Identifier of the highlighted option.
   *
   * @type {Signal<string | null>}
   */
  protected readonly activeId: Signal<string | null> = computed(() => this.active()?.id ?? null);

  /**
   * Property triggerClasses
   * @readonly
   *
   * @description
   * Trigger classes for the current size.
   *
   * @type {Signal<string>}
   */
  protected readonly triggerClasses: Signal<string> = computed(
    () => `${TRIGGER} ${ɵFOCUS_FIELD} ${SIZES[this.size()]}`,
  );

  /**
   * Property panelClass
   * @readonly
   *
   * @description
   * Classes for the option panel.
   *
   * @type {string}
   */
  protected readonly panelClass: string = PANEL;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Connects forms, keyboard navigation and the option panel.
   */
  public constructor() {
    // Reactive and template-driven forms: this select is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the select can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    const subscription: Subscription = this.keyManager.change.subscribe(() => {
      const option: CwSelectOption | null = this.keyManager.activeItem?.option ?? null;
      this.active.set(option);
      if (typeof option?.element.scrollIntoView === 'function') {
        option.element.scrollIntoView({ block: 'nearest' });
      }
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      clearTimeout(this.typedTimer);
      this.stack.release(this.stacked);
      this.overlay.dispose();
    });

    // `[(open)]` drives the overlay, whoever changes it: the trigger, the keyboard or the consumer.
    afterRenderEffect({
      write: () => {
        const open: boolean = this.open() && !this.isDisabled();
        untracked(() => {
          if (open) this.attach();
          else this.detach();
        });
      },
    });

    // The chosen option's content (glyph and word) is copied into the trigger (Select sheet).
    afterRenderEffect({
      write: () => {
        const option: CwSelectOption | null = this.selectedOption();
        const display: HTMLElement | undefined = this.display()?.nativeElement;
        if (!display) return;
        const label: Element | null | undefined =
          option?.element.querySelector('[data-cw-select-label]');
        if (!label) {
          display.replaceChildren();
          return;
        }
        const copy: HTMLElement = label.cloneNode(true) as HTMLElement;
        copy.removeAttribute('data-cw-select-label');
        for (const element of Array.from(copy.querySelectorAll('[id]'))) {
          element.removeAttribute('id');
        }
        display.replaceChildren(copy);
      },
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Focuses the select trigger.
   *
   * @param {FocusOptions} [options] - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  /**
   * Method isSelected
   *
   * @description
   * Reports whether a value is selected.
   *
   * @internal
   *
   * @param {unknown} value - Option value to compare with the current selection.
   *
   * @returns {boolean} Whether the value matches the current selection.
   */
  public isSelected(value: unknown): boolean {
    const current: T | null = this.value();
    return current !== null && this.compareWith()(current, value as T);
  }

  /**
   * Method choose
   *
   * @description
   * Selects an enabled option and closes the panel.
   *
   * @internal
   *
   * @param {CwSelectOption} option - Option to select unless it is disabled.
   */
  public choose(option: CwSelectOption): void {
    if (option.disabled()) return;
    const value: T = option.value() as T;
    this.value.set(value);
    this.onChange(value);
    this.hide();
  }

  /**
   * Method highlight
   *
   * @description
   * Highlights an option.
   *
   * @internal
   *
   * @param {CwSelectOption} option - Option to highlight in the keyboard manager.
   */
  public highlight(option: CwSelectOption): void {
    this.keyManager.setActiveItem(this.keyOptionOf(option));
  }

  /**
   * Method writeValue
   *
   * @description
   * Writes the value supplied by a form.
   *
   * @param {unknown} value - Value supplied by the form; null or undefined clears the selection.
   */
  public writeValue(value: unknown): void {
    this.value.set((value ?? null) as T | null);
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the form change callback.
   *
   * @param {(value: T | null) => void} fn - Callback notified when the selected value changes.
   */
  public registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   *
   * @description
   * Registers the form touch callback.
   *
   * @param {() => void} fn - Callback notified when focus leaves the select.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   *
   * @description
   * Sets the disabled state supplied by a form.
   *
   * @param {boolean} isDisabled - Disabled state supplied by the form.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Method isInvalid
   *
   * @description
   * Reports whether validation feedback is shown.
   *
   * @returns {boolean} Whether validation feedback should be displayed.
   */
  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  /**
   * Method onPointerDown
   *
   * @description
   * Clears the synthesized-click guard.
   */
  protected onPointerDown(): void {
    this.keyActed = false;
  }

  /**
   * Method onClick
   *
   * @description
   * Toggles the panel on click.
   */
  protected onClick(): void {
    if (this.keyActed) {
      this.keyActed = false;
      return;
    }
    if (this.open()) this.hide();
    else this.show();
  }

  /**
   * Method onKeydown
   *
   * @description
   * Handles list navigation, selection and typeahead.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the trigger.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const key: string = event.key;
    if (!this.open()) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.keyActed = key === 'Enter' || key === ' ';
        this.show();
      } else if (this.isPrintable(event)) {
        event.preventDefault();
        this.show();
        this.typeahead(key);
      }
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this.hide();
    } else if (key === 'Tab') {
      this.hide();
    } else if (key === ' ' && this.typed !== '') {
      event.preventDefault();
      this.typeahead(key);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.keyActed = true;
      const option: CwSelectOption | undefined = this.keyManager.activeItem?.option;
      if (option) this.choose(option);
      else this.hide();
    } else if (ɵnavigateList(this.keyManager, event, 'vertical')) {
      event.preventDefault();
    } else if (this.isPrintable(event)) {
      event.preventDefault();
      this.typeahead(key);
    }
  }

  /**
   * Method onBlur
   *
   * @description
   * Closes the panel and marks the control touched.
   */
  protected onBlur(): void {
    // The focus stays on the trigger while the panel is open (option presses keep it): leaving
    // means the user moved on.
    this.hide();
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method show
   *
   * @description
   * Opens the panel and highlights the selected option.
   */
  private show(): void {
    if (this.isDisabled()) return;
    this.stack.open(this.stacked, this.trigger().nativeElement);
    this.open.set(true);
    const selected: CwSelectOption | null = this.selectedOption();
    if (selected && !selected.disabled()) this.keyManager.setActiveItem(this.keyOptionOf(selected));
    else this.keyManager.setFirstItemActive();
  }

  /**
   * Method hide
   *
   * @description
   * Closes the panel.
   */
  private hide(): void {
    this.open.set(false);
  }

  /**
   * Method attach
   *
   * @description
   * Attaches the connected option panel.
   */
  private attach(): void {
    const trigger: HTMLButtonElement = this.trigger().nativeElement;
    this.listboxLabel.set(this.triggerName(trigger));
    this.overlay.open({
      origin: trigger,
      template: this.panelTemplate(),
      viewContainerRef: this.viewContainerRef,
      outsideClick: (event) => {
        // A press on the trigger toggles the panel through its own click.
        if (!event.composedPath().includes(trigger)) this.hide();
      },
    });
  }

  /**
   * Method detach
   *
   * @description
   * Closes the panel and clears the active option.
   */
  private detach(): void {
    this.stack.release(this.stacked);
    if (!this.overlay.attached()) return;
    this.overlay.close(this.panelElement()?.nativeElement, () => {
      this.keyManager.updateActiveItem(-1);
      this.active.set(null);
    });
  }

  /**
   * Method triggerName
   *
   * @description
   * Returns the accessible name of the trigger.
   *
   * @param {HTMLButtonElement} trigger - Trigger whose associated labels supply the name.
   *
   * @returns {string | null} Explicit or associated label text, or null when neither exists.
   */
  private triggerName(trigger: HTMLButtonElement): string | null {
    const labels: string[] = Array.from(trigger.labels).map((label) => label.textContent.trim());
    return this.ariaLabel() || labels.join(' ') || null;
  }

  /**
   * Method typeahead
   *
   * @description
   * Highlights an option matching typed text.
   *
   * @param {string} key - Character to add to the current typeahead query.
   */
  private typeahead(key: string): void {
    clearTimeout(this.typedTimer);
    this.typed += ɵfold(key);
    this.typedTimer = setTimeout(() => {
      this.typed = '';
    }, TYPEAHEAD_MS);

    const items: KeyOption[] = this.items();
    const start: number = Math.max(this.keyManager.activeItemIndex ?? -1, 0);
    // A single letter moves on from the highlighted option, so repeating it cycles.
    const offset: number = this.typed.length === 1 ? 1 : 0;
    for (let step: number = 0; step < items.length; step++) {
      const item: KeyOption = items[(start + offset + step) % items.length];
      if (!item.disabled && ɵfold(item.getLabel()).startsWith(this.typed)) {
        this.keyManager.setActiveItem(item);
        return;
      }
    }
  }

  /**
   * Method isPrintable
   *
   * @description
   * Reports whether a keyboard event contains a printable character.
   *
   * @param {KeyboardEvent} event - Keyboard event to examine.
   *
   * @returns {boolean} Whether the event represents an unmodified printable character.
   */
  private isPrintable(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  }

  /**
   * Method keyOptionOf
   *
   * @description
   * Returns a cached keyboard adapter for an option.
   *
   * @param {CwSelectOption} option - Option to adapt for keyboard navigation.
   *
   * @returns {KeyOption} Keyboard adapter associated with the option.
   */
  private keyOptionOf(option: CwSelectOption): KeyOption {
    let item: KeyOption | undefined = this.keyOptions.get(option);
    if (!item) {
      item = keyOptionOf(option);
      this.keyOptions.set(option, item);
    }
    return item;
  }
  // #endregion
}
