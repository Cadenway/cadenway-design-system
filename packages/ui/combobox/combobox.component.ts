import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  type TemplateRef,
  ViewContainerRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  ActiveDescendantKeyManager,
  type Highlightable,
  LiveAnnouncer,
  _IdGenerator,
} from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwRipple, ɵFOCUS_FIELD, ɵnavigateList } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretUpDownBold,
  phosphorMagnifyingGlassBold,
  phosphorPlusBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwComboboxEmpty } from './combobox-empty/combobox-empty.component';
import { CwComboboxOption } from './combobox-option/combobox-option.component';
import { ComboboxPanel } from './combobox-panel/combobox-panel.service';
import { EMPTY, OPTION, fold } from './combobox.styles';
import { COMBOBOX_HOST, type ComboboxHost } from './combobox.token';
import type { CwComboboxCompareWith, CwComboboxFilter, CwComboboxSize } from './combobox.types';

/* Literal class strings (Combobox sheet and preview of the Design System artifact): the trigger has
   the classes of Select; open, it keeps the selected veil (`aria-expanded:bg-selected`). */
const TRIGGER =
  'group/trigger relative isolate flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden border border-input bg-transparent text-sm whitespace-nowrap transition-[color,background-color,box-shadow] hover:bg-accent aria-expanded:bg-selected disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/15 data-placeholder:text-muted-foreground motion-reduce:transition-none [&_ng-icon]:shrink-0';

const SIZES: Record<CwComboboxSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/* The panel: no padding, the search on top, the list scrolled below it; at least as wide as the
   trigger, up to `max-w-sm`. It opens from the trigger corner and closes with `menu-out`. */
const PANEL =
  'flex max-h-80 max-w-sm flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md animate-menu-in data-[state=closed]:animate-menu-out motion-reduce:animate-none';

/** The item the CDK key manager moves through: an option, or the row that creates one. */
interface KeyOption extends Highlightable {
  readonly option: CwComboboxOption | null;
  getLabel(): string;
}

function defaultFilter(
  option: { label: string; keywords: readonly string[] },
  query: string,
): boolean {
  const folded = fold(query.trim());
  return [option.label, ...option.keywords].some((text) => fold(text).includes(folded));
}

/**
 * A Select with a search: one or several values in a long list (assignees, labels, destination
 * list), created on the fly when allowed (Combobox sheet of the Design System artifact).
 *
 * The trigger is a `button role="combobox"` with the classes of Select (`size`); it shows the chosen
 * option's content, `summary(count)` for several, or `placeholder`. The panel (CDK overlay, at
 * least the trigger's width) holds a search field that takes the focus and the listbox of
 * `cw-combobox-option` and `cw-combobox-group`; the search filters the options without accents
 * nor case on their text and `keywords` (`filter` replaces the rule), and emits `search` at each
 * keystroke for a server search (debounce on the caller's side). `loading` shows the spinner and
 * `loadingText` in place of the list; a search without result shows `emptyText` or a projected
 * `cw-combobox-empty`. `creatable` adds a last row, `createLabel(query)`, when no option has the
 * exact text typed; choosing it emits `create`.
 *
 * Keyboard: Enter, ↓, ↑ or a character on the trigger open the panel and focus the search; ↓ ↑ move
 * (disabled options skipped); Enter chooses (single: closes; `multiple`: ticks or unticks and
 * stays open); Escape clears the search, then closes; Tab closes. The number of results is
 * announced (`resultsLabel`).
 *
 * `[(value)]` (`T | null`, or `T[]` in `multiple`) and `[(open)]` are models; `compareWith` matches
 * object values. The combobox works with Signal Forms (`[formField]`, it is a `FormValueControl`)
 * and with Reactive or template-driven forms (it is the control's value accessor); `aria-invalid`
 * is set when the control is invalid and touched. Name it with a `<label for>` (its `id`) or
 * `ariaLabel`.
 */
@Component({
  selector: 'cw-combobox',
  imports: [NgIcon, CwRipple, CwSpinner],
  providers: [
    provideIcons({ phosphorCaretUpDownBold, phosphorMagnifyingGlassBold, phosphorPlusBold }),
    ComboboxPanel,
    { provide: COMBOBOX_HOST, useExisting: forwardRef(() => CwCombobox) },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    '[attr.id]': 'null',
  },
  templateUrl: './combobox.component.html',
})
export class CwCombobox<T = unknown>
  implements FormValueControl<T | readonly T[] | null>, ControlValueAccessor, ComboboxHost
{
  /** The chosen value (`null` for none), or the chosen values in `multiple`; `[(value)]`. */
  readonly value = model<T | readonly T[] | null>(null);
  /** Whether the panel is open; `[(open)]`. */
  readonly open = model(false);
  /** Several values: ticks on the right, the panel stays open, the trigger sums them up. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Text of the empty trigger (« Assigner »). */
  readonly placeholder = input('Choisir…');
  /** Placeholder and accessible name of the search field. */
  readonly searchPlaceholder = input('Rechercher…');
  /** Message of a search without result; a function receives the search (« Aucun résultat pour « zoé ». »). */
  readonly emptyText = input<string | ((query: string) => string)>('Aucun résultat');
  /** Offers a last row that creates the typed value when no option has its exact text. */
  readonly creatable = input(false, { transform: booleanAttribute });
  /** Text of the creation row (« Créer l'étiquette « mobile » », « Inviter « zoé » par e-mail »). */
  readonly createLabel = input<(query: string) => string>((query) => `Créer « ${query} »`);
  /** Results are loading: the spinner and `loadingText` replace the list. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Text next to the spinner while loading. */
  readonly loadingText = input('Recherche…');
  /** Local filter of the options; without accents nor case on their text and keywords by default. */
  readonly filter = input<CwComboboxFilter<T> | null>(null);
  /** Trigger text for several values in `multiple` (« 3 personnes »). */
  readonly summary = input<(count: number) => string>((count) => `${String(count)} sélectionnés`);
  /** The announcement of the number of results after a keystroke. */
  readonly resultsLabel = input<(count: number) => string>((count) =>
    count === 1 ? '1 résultat' : `${String(count)} résultats`,
  );
  /** Height of the trigger; the search field stays 36 px. */
  readonly size = input<CwComboboxSize>('default');
  /** Disables the combobox (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Equality of two values, for object values; `===` by default. */
  readonly compareWith = input<CwComboboxCompareWith<T>>((a, b) => a === b);
  /** Accessible name when no label points at the combobox. */
  readonly ariaLabel = input('');
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Id of the trigger, for `<label for>`; generated when not given. */
  readonly id = input(inject(_IdGenerator).getId('cw-combobox-'));
  /** Emits the search at each keystroke, for a server search. */
  // The sheet names this output `search`; the host is `cw-combobox`, where no native `search`
  // event (an `input type=search` one) is ever dispatched.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly search = output<string>();
  /** Emits the typed text when the creation row is chosen. */
  readonly create = output<string>();
  /** Emitted when focus leaves the combobox: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly optionList = contentChildren(CwComboboxOption, { descendants: true });
  private readonly customEmpty = contentChild(CwComboboxEmpty);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly display = viewChild<ElementRef<HTMLElement>>('display');
  private readonly searchField = viewChild<ElementRef<HTMLInputElement>>('searchField');
  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private readonly active = signal<KeyOption | null>(null);
  private readonly keyOptions = new WeakMap<CwComboboxOption, KeyOption>();
  private onChange: (value: T | readonly T[] | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  // A key that opened the panel already acted: the click the button synthesizes for it (Enter,
  // Space) must not toggle the panel again.
  private keyActed = false;

  protected readonly overlay = inject(ComboboxPanel);
  protected readonly listboxId = inject(_IdGenerator).getId('cw-combobox-listbox-');
  protected readonly createId = inject(_IdGenerator).getId('cw-combobox-create-');
  protected readonly listboxLabel = signal<string | null>(null);
  protected readonly query = signal('');
  protected readonly emptyClass = EMPTY;
  protected readonly optionClass = OPTION;
  protected readonly panelClass = PANEL;
  protected readonly hasCustomEmpty = computed(() => !!this.customEmpty());

  /** @internal The options of the combobox, in order. */
  readonly options = computed(() => this.optionList() as readonly CwComboboxOption[]);
  /** @internal The option highlighted by the arrows or the pointer. */
  readonly highlighted = computed(() => this.active()?.option ?? null);
  /** @internal Whether the rows play their entrance (at opening, until the first keystroke). */
  readonly entering = signal(true);

  private readonly createItem: KeyOption = {
    option: null,
    disabled: false,
    getLabel: () => this.createLabel()(this.query().trim()),
    setActiveStyles: () => undefined,
    setInactiveStyles: () => undefined,
  };

  private readonly selectedValues = computed<readonly T[]>(() => {
    const value = this.value();
    if (value === null) return [];
    return Array.isArray(value) ? (value as readonly T[]) : [value as T];
  });
  protected readonly visibleOptions = computed(() =>
    this.options().filter((option) => option.visible()),
  );
  protected readonly showCreate = computed(() => {
    const query = fold(this.query().trim());
    if (!this.creatable() || query === '' || this.loading()) return false;
    return !this.options().some((option) => fold(option.label()) === query);
  });
  private readonly items = computed(() => [
    ...this.visibleOptions().map((option) => this.keyOptionOf(option)),
    ...(this.showCreate() ? [this.createItem] : []),
  ]);
  private readonly keyManager = new ActiveDescendantKeyManager<KeyOption>(
    this.items,
    this.injector,
  ).skipPredicate((item) => item.disabled === true);

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly selectedOptions = computed(() =>
    this.options().filter((option) => this.isSelected(option.value())),
  );
  protected readonly activeId = computed(() => {
    const active = this.active();
    if (!active) return null;
    return active.option ? active.option.id : this.createId;
  });
  protected readonly createActive = computed(() => this.active() === this.createItem);
  protected readonly emptyMessage = computed(() => {
    const text = this.emptyText();
    return typeof text === 'function' ? text(this.query().trim()) : text;
  });
  protected readonly triggerClasses = computed(
    () => `${TRIGGER} ${ɵFOCUS_FIELD} ${SIZES[this.size()]}`,
  );

  constructor() {
    // Reactive and template-driven forms: this combobox is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the combobox can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    const subscription = this.keyManager.change.subscribe(() => {
      const item = this.keyManager.activeItem;
      this.active.set(item);
      const element = item?.option?.element;
      if (typeof element?.scrollIntoView === 'function')
        element.scrollIntoView({ block: 'nearest' });
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
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

    // The chosen option's content (avatar and name) is copied into the trigger (Combobox sheet).
    afterRenderEffect({
      write: () => {
        const option = this.selectedOptions().at(0);
        const display = this.display()?.nativeElement;
        if (!display) return;
        const label = option?.element.querySelector('[data-cw-combobox-label]');
        if (!label) {
          display.replaceChildren();
          return;
        }
        const copy = label.cloneNode(true) as HTMLElement;
        copy.removeAttribute('data-cw-combobox-label');
        for (const element of Array.from(copy.querySelectorAll('[id]'))) {
          element.removeAttribute('id');
        }
        display.replaceChildren(copy);
      },
    });

    // The number of results, or the empty message, is announced after a keystroke (sheet,
    // "Accessibilité": « 3 résultats »).
    effect(() => {
      const query = this.query();
      if (!this.open() || this.loading() || query === '') return;
      const count = this.visibleOptions().length;
      const message = count === 0 ? this.emptyMessage() : this.resultsLabel()(count);
      untracked(() => {
        void this.announcer.announce(message, 'polite');
      });
    });
  }

  /** Moves the focus to the trigger (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  /** @internal Whether `value` is (one of) the combobox's value(s). */
  isSelected(value: unknown): boolean {
    const compare = this.compareWith();
    return this.selectedValues().some((selected) => compare(selected, value as T));
  }

  /** @internal Whether an option matches the search. */
  matches(option: CwComboboxOption): boolean {
    const query = this.query().trim();
    if (query === '') return true;
    const candidate = {
      value: option.value() as T,
      label: option.label(),
      keywords: option.keywords(),
    };
    const filter = this.filter();
    return filter ? filter(candidate, query) : defaultFilter(candidate, query);
  }

  /** @internal Chooses an option: single, it closes; `multiple`, it ticks or unticks and stays open. */
  choose(option: CwComboboxOption): void {
    if (option.disabled()) return;
    const value = option.value() as T;
    if (this.multiple()) {
      const compare = this.compareWith();
      const current = this.selectedValues();
      const next = this.isSelected(value)
        ? current.filter((selected) => !compare(selected, value))
        : [...current, value];
      this.setValue(next);
      this.keyManager.setActiveItem(this.keyOptionOf(option));
      return;
    }
    this.setValue(value);
    this.hide(true);
  }

  /** @internal Highlights an option under the pointer. */
  highlight(option: CwComboboxOption): void {
    this.keyManager.setActiveItem(this.keyOptionOf(option));
  }

  writeValue(value: unknown): void {
    this.value.set((value ?? (this.multiple() ? [] : null)) as T | readonly T[] | null);
  }

  registerOnChange(fn: (value: T | readonly T[] | null) => void): void {
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

  protected onTriggerClick(): void {
    if (this.keyActed) {
      this.keyActed = false;
      return;
    }
    if (this.open()) this.hide(false);
    else this.show('');
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (this.open()) {
      if (key === 'Escape') {
        event.preventDefault();
        this.hide(false);
      }
      return;
    }
    if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      this.keyActed = key === 'Enter' || key === ' ';
      this.show('');
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // A character opens the panel and starts the search with it.
      event.preventDefault();
      this.show(key);
    }
  }

  protected onTriggerBlur(): void {
    if (!this.open()) this.markTouched();
  }

  protected onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.entering.set(false);
    this.query.set(query);
    this.search.emit(query);
    this.keyManager.setFirstItemActive();
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (ɵnavigateList(this.keyManager, event, 'vertical')) event.preventDefault();
        return;
      case 'Enter': {
        event.preventDefault();
        const item = this.keyManager.activeItem;
        if (item === this.createItem) this.createFromQuery();
        else if (item?.option) this.choose(item.option);
        return;
      }
      case 'Escape':
        event.preventDefault();
        if (this.query() !== '') this.setQuery('');
        else this.hide(true);
        return;
      case 'Tab':
        this.hide(false);
        return;
    }
  }

  protected onPanelMousedown(event: MouseEvent): void {
    // Presses in the panel keep the focus in the search field, except in the field itself.
    if (event.target !== this.searchField()?.nativeElement) event.preventDefault();
  }

  protected onPanelFocusout(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const panel = this.panelElement()?.nativeElement;
    if (next && !panel?.contains(next) && next !== this.trigger().nativeElement) this.hide(false);
  }

  protected onCreateClick(): void {
    this.createFromQuery();
  }

  protected onCreatePointerMove(): void {
    if (!this.createActive()) this.keyManager.setActiveItem(this.createItem);
  }

  private createFromQuery(): void {
    const query = this.query().trim();
    if (query === '') return;
    this.create.emit(query);
    if (this.multiple()) this.setQuery('');
    else this.hide(true);
  }

  private setValue(value: T | readonly T[] | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  private setQuery(query: string): void {
    this.query.set(query);
    this.search.emit(query);
    this.keyManager.setFirstItemActive();
  }

  private show(query: string): void {
    if (this.isDisabled()) return;
    this.entering.set(true);
    this.query.set(query);
    if (query !== '') {
      this.entering.set(false);
      this.search.emit(query);
    }
    this.open.set(true);
    const selected = this.selectedOptions().at(0);
    if (query === '' && selected && !selected.disabled()) {
      this.keyManager.setActiveItem(this.keyOptionOf(selected));
    } else {
      this.keyManager.setFirstItemActive();
    }
  }

  private hide(restoreFocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    this.markTouched();
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  private markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
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
        if (!event.composedPath().includes(trigger)) this.hide(false);
      },
    });
    // The search field takes the focus once the panel is in the page (sheet, "Anatomie"), also
    // when the panel reopens during its closing animation and was never removed.
    afterNextRender(
      () => {
        const field = this.searchField()?.nativeElement;
        if (!field || field.ownerDocument.activeElement === field) return;
        field.focus();
        const end = field.value.length;
        field.setSelectionRange(end, end);
      },
      { injector: this.injector },
    );
  }

  private detach(): void {
    if (!this.overlay.attached()) return;
    this.overlay.close(this.panelElement()?.nativeElement, () => {
      this.keyManager.updateActiveItem(-1);
      this.active.set(null);
      this.query.set('');
    });
  }

  private triggerName(trigger: HTMLButtonElement): string | null {
    const labels = Array.from(trigger.labels).map((label) => label.textContent.trim());
    return this.ariaLabel() || labels.join(' ') || null;
  }

  private keyOptionOf(option: CwComboboxOption): KeyOption {
    let item = this.keyOptions.get(option);
    if (!item) {
      // The option's signal input `disabled` cannot be the `disabled: boolean` the manager reads.
      item = {
        option,
        get disabled(): boolean {
          return option.disabled() || !option.visible();
        },
        getLabel: () => option.label(),
        setActiveStyles: () => undefined,
        setInactiveStyles: () => undefined,
      };
      this.keyOptions.set(option, item);
    }
    return item;
  }
}
