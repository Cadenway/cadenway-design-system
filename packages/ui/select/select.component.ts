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
  untracked,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActiveDescendantKeyManager, type Highlightable, _IdGenerator } from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwRipple, CwSwap, ɵFOCUS_FIELD, ɵnavigateList } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorCaretDownBold } from '@ng-icons/phosphor-icons/bold';

import { CwSelectEmpty } from './select-empty/select-empty.component';
import { CwSelectOption } from './select-option/select-option.component';
import { SelectPanel } from './select-panel/select-panel.service';
import { EMPTY } from './select.styles';
import { SELECT_HOST, type SelectHost } from './select.token';
import type { CwSelectCompareWith, CwSelectSize } from './select.types';

/* Literal class strings (Select sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. The trigger has the height of Input; open, it keeps the selected
   veil (`aria-expanded:bg-selected`). */
const TRIGGER =
  'group/trigger relative isolate flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden border border-input bg-transparent text-sm whitespace-nowrap transition-[color,background-color,box-shadow] hover:bg-accent aria-expanded:bg-selected disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 data-placeholder:text-muted-foreground motion-reduce:transition-none [&_ng-icon]:shrink-0';

const SIZES: Record<CwSelectSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/* The panel: at least as wide as the trigger, as wide as its content up to `max-w-sm`, scrolled past
   320 px. It opens from the trigger corner (`--menu-from`) and closes with `menu-out`. */
const PANEL =
  'block max-h-80 max-w-sm overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md animate-menu-in data-[state=closed]:animate-menu-out motion-reduce:animate-none';

/* Typeahead: the letters typed within this delay add up to one search (WAI-ARIA listbox pattern). */
const TYPEAHEAD_MS = 500;

/** The item the CDK key manager moves through: one per option, reading the option when asked. */
interface KeyOption extends Highlightable {
  readonly option: CwSelectOption;
  getLabel(): string;
}

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

function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
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
    SelectPanel,
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
  /** The chosen value, `null` for none; `[(value)]`. */
  readonly value = model<T | null>(null);
  /** Whether the panel is open; `[(open)]`. */
  readonly open = model(false);
  /** Text of the empty trigger; say what to choose (« Choisir un statut »). */
  readonly placeholder = input('Choisir…');
  /** Height of the trigger; the panel keeps one size. */
  readonly size = input<CwSelectSize>('default');
  /** Disables the select (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Equality of two values, for object values; `===` by default. */
  readonly compareWith = input<CwSelectCompareWith<T>>((a, b) => a === b);
  /** Message of a select without options, unless a `cw-select-empty` is projected. */
  readonly emptyText = input('Aucune option');
  /** Accessible name when no label points at the select. */
  readonly ariaLabel = input('');
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Id of the trigger, for `<label for>`; generated when not given. */
  readonly id = input(inject(_IdGenerator).getId('cw-select-'));
  /** Emitted when focus leaves the select: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly optionList = contentChildren(CwSelectOption, { descendants: true });
  private readonly customEmpty = contentChild(CwSelectEmpty);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly display = viewChild<ElementRef<HTMLElement>>('display');
  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private readonly active = signal<CwSelectOption | null>(null);
  private readonly keyOptions = new WeakMap<CwSelectOption, KeyOption>();
  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private typed = '';
  private typedTimer: ReturnType<typeof setTimeout> | undefined;
  // A key that opened, chose or closed already acted: the click the button synthesizes for it
  // (Enter, Space) must not toggle the panel again.
  private keyActed = false;

  protected readonly overlay = inject(SelectPanel);
  protected readonly listboxId = inject(_IdGenerator).getId('cw-select-listbox-');
  protected readonly listboxLabel = signal<string | null>(null);
  protected readonly emptyClass = EMPTY;
  protected readonly hasCustomEmpty = computed(() => !!this.customEmpty());

  /** @internal The options of the select, in order. */
  readonly options = computed(() => this.optionList() as readonly CwSelectOption[]);
  /** @internal The option highlighted by the arrows or the pointer. */
  readonly highlighted = this.active.asReadonly();

  private readonly items = computed(() => this.options().map((option) => this.keyOptionOf(option)));
  private readonly keyManager = new ActiveDescendantKeyManager<KeyOption>(
    this.items,
    inject(Injector),
  ).skipPredicate((item) => item.disabled === true);

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly selectedOption = computed(
    () => this.options().find((option) => this.isSelected(option.value())) ?? null,
  );
  protected readonly selectedLabel = computed(() => this.selectedOption()?.label() ?? '');
  protected readonly activeId = computed(() => this.active()?.id ?? null);
  protected readonly triggerClasses = computed(
    () => `${TRIGGER} ${ɵFOCUS_FIELD} ${SIZES[this.size()]}`,
  );
  protected readonly panelClass = PANEL;

  constructor() {
    // Reactive and template-driven forms: this select is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the select can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    const subscription = this.keyManager.change.subscribe(() => {
      const option = this.keyManager.activeItem?.option ?? null;
      this.active.set(option);
      if (typeof option?.element.scrollIntoView === 'function') {
        option.element.scrollIntoView({ block: 'nearest' });
      }
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      clearTimeout(this.typedTimer);
      this.overlay.dispose();
    });

    // `[(open)]` drives the overlay, whoever changes it: the trigger, the keyboard or the consumer.
    afterRenderEffect({
      write: () => {
        const open = this.open() && !this.isDisabled();
        untracked(() => {
          if (open) this.attach();
          else this.detach();
        });
      },
    });

    // The chosen option's content (glyph and word) is copied into the trigger (Select sheet).
    afterRenderEffect({
      write: () => {
        const option = this.selectedOption();
        const display = this.display()?.nativeElement;
        if (!display) return;
        const label = option?.element.querySelector('[data-cw-select-label]');
        if (!label) {
          display.replaceChildren();
          return;
        }
        const copy = label.cloneNode(true) as HTMLElement;
        copy.removeAttribute('data-cw-select-label');
        for (const element of Array.from(copy.querySelectorAll('[id]'))) {
          element.removeAttribute('id');
        }
        display.replaceChildren(copy);
      },
    });
  }

  /** Moves the focus to the trigger (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  /** @internal Whether `value` is the select's value. */
  isSelected(value: unknown): boolean {
    const current = this.value();
    return current !== null && this.compareWith()(current, value as T);
  }

  /** @internal Chooses an option, closes the panel and keeps the focus on the trigger. */
  choose(option: CwSelectOption): void {
    if (option.disabled()) return;
    const value = option.value() as T;
    this.value.set(value);
    this.onChange(value);
    this.hide();
  }

  /** @internal Highlights an option under the pointer. */
  highlight(option: CwSelectOption): void {
    this.keyManager.setActiveItem(this.keyOptionOf(option));
  }

  writeValue(value: unknown): void {
    this.value.set((value ?? null) as T | null);
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  protected onPointerDown(): void {
    this.keyActed = false;
  }

  protected onClick(): void {
    if (this.keyActed) {
      this.keyActed = false;
      return;
    }
    if (this.open()) this.hide();
    else this.show();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
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
      const option = this.keyManager.activeItem?.option;
      if (option) this.choose(option);
      else this.hide();
    } else if (ɵnavigateList(this.keyManager, event, 'vertical')) {
      event.preventDefault();
    } else if (this.isPrintable(event)) {
      event.preventDefault();
      this.typeahead(key);
    }
  }

  protected onBlur(): void {
    // The focus stays on the trigger while the panel is open (option presses keep it): leaving
    // means the user moved on.
    this.hide();
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  private show(): void {
    if (this.isDisabled()) return;
    this.open.set(true);
    const selected = this.selectedOption();
    if (selected && !selected.disabled()) this.keyManager.setActiveItem(this.keyOptionOf(selected));
    else this.keyManager.setFirstItemActive();
  }

  private hide(): void {
    this.open.set(false);
  }

  private attach(): void {
    const trigger = this.trigger().nativeElement;
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

  private detach(): void {
    if (!this.overlay.attached()) return;
    this.overlay.close(this.panelElement()?.nativeElement, () => {
      this.keyManager.updateActiveItem(-1);
      this.active.set(null);
    });
  }

  private triggerName(trigger: HTMLButtonElement): string | null {
    const labels = Array.from(trigger.labels).map((label) => label.textContent.trim());
    return this.ariaLabel() || labels.join(' ') || null;
  }

  private typeahead(key: string): void {
    clearTimeout(this.typedTimer);
    this.typed += fold(key);
    this.typedTimer = setTimeout(() => {
      this.typed = '';
    }, TYPEAHEAD_MS);

    const items = this.items();
    const start = Math.max(this.keyManager.activeItemIndex ?? -1, 0);
    // A single letter moves on from the highlighted option, so repeating it cycles.
    const offset = this.typed.length === 1 ? 1 : 0;
    for (let step = 0; step < items.length; step++) {
      const item = items[(start + offset + step) % items.length];
      if (!item.disabled && fold(item.getLabel()).startsWith(this.typed)) {
        this.keyManager.setActiveItem(item);
        return;
      }
    }
  }

  private isPrintable(event: KeyboardEvent): boolean {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  }

  private keyOptionOf(option: CwSelectOption): KeyOption {
    let item = this.keyOptions.get(option);
    if (!item) {
      item = keyOptionOf(option);
      this.keyOptions.set(option, item);
    }
    return item;
  }
}
