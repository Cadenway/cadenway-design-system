import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  effect,
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
import {
  ActiveDescendantKeyManager,
  type Highlightable,
  LiveAnnouncer,
  _IdGenerator,
} from '@angular/cdk/a11y';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { Subscription } from 'rxjs';
import type { FormValueControl } from '@angular/forms/signals';
import {
  CwRipple,
  ɵConnectedPanel,
  ɵFOCUS_FIELD,
  ɵfold,
  ɵnavigateList,
  ɵPanelStack,
  type ɵStackedPanel,
} from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/components/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretUpDownBold,
  phosphorMagnifyingGlassBold,
  phosphorPlusBold,
} from '@ng-icons/phosphor-icons/bold';

import { CwComboboxEmpty } from './combobox-empty/combobox-empty.component';
import { CwComboboxOption } from './combobox-option/combobox-option.component';
import { EMPTY, OPTION } from './combobox.styles';
import { COMBOBOX_HOST, type ComboboxHost } from './combobox.token';
import type { CwComboboxCompareWith, CwComboboxFilter, CwComboboxSize } from './combobox.types';

/* Literal class strings (Combobox sheet and preview of the Design System artifact): the trigger has
   the classes of Select; open, it keeps the selected veil (`aria-expanded:bg-selected`). */
/**
 * Constant TRIGGER
 *
 * @description
 * Base classes for the combobox trigger.
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
 * @type {Record<CwComboboxSize, string>}
 */
const SIZES: Record<CwComboboxSize, string> = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded-lg px-2.5',
  lg: 'h-9 rounded-lg px-3',
};

/* The panel: no padding, the search on top, the list scrolled below it; at least as wide as the
   trigger, up to `max-w-sm`. It opens from the trigger corner and closes with `menu-out`. */
/**
 * Constant PANEL
 *
 * @description
 * Classes for the searchable option panel.
 *
 * @type {string}
 */
const PANEL: string =
  'flex max-h-80 max-w-sm flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md animate-menu-in data-[state=closed]:animate-menu-out motion-reduce:animate-none';

/**
 * Interface KeyOption
 *
 * @description
 * Keyboard adapter for an option or the creation row.
 */
interface KeyOption extends Highlightable {
  // #region Properties
  /**
   * Property option
   * @readonly
   *
   * @description
   * Option represented by this adapter, or null for the creation row.
   *
   * @type {CwComboboxOption | null}
   */
  readonly option: CwComboboxOption | null;
  // #endregion

  // #region Methods
  /**
   * Method getLabel
   *
   * @description
   * Returns the option text for keyboard navigation.
   *
   * @returns {string} Text used by keyboard navigation for this row.
   */
  getLabel(): string;
  // #endregion
}

/**
 * Function defaultFilter
 *
 * @description
 * Matches the query against option text and keywords without accents or case.
 *
 * @param {{ label: string; keywords: readonly string[] }} option - Option label and search keywords.
 * @param {string} query - Typed search text.
 *
 * @returns {boolean} Whether the normalized query occurs in the label or keywords.
 */
function defaultFilter(
  option: { label: string; keywords: readonly string[] },
  query: string,
): boolean {
  const folded: string = ɵfold(query.trim());
  return [option.label, ...option.keywords].some((text) => ɵfold(text).includes(folded));
}

/**
 * Component CwCombobox
 *
 * @description
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
    ɵConnectedPanel,
    { provide: COMBOBOX_HOST, useExisting: forwardRef(() => CwCombobox) },
  ],
  host: {
    class: 'block',
    '[attr.id]': 'null',
  },
  templateUrl: './combobox.component.html',
})
export class CwCombobox<T = unknown>
  implements FormValueControl<T | readonly T[] | null>, ControlValueAccessor, ComboboxHost
{
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Selected value or values.
   *
   * @type {ModelSignal<T | readonly T[] | null>}
   */
  public readonly value: ModelSignal<T | readonly T[] | null> = model<T | readonly T[] | null>(
    null,
  );

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
   * Property multiple
   * @readonly
   *
   * @description
   * Whether multiple values may be selected.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly multiple: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

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
   * Property searchPlaceholder
   * @readonly
   *
   * @description
   * Placeholder and accessible name of the search field.
   *
   * @type {InputSignal<string>}
   */
  public readonly searchPlaceholder: InputSignal<string> = input('Rechercher…');

  /**
   * Property emptyText
   * @readonly
   *
   * @description
   * Message shown when the search has no results.
   *
   * @type {InputSignal<string | ((query: string) => string)>}
   */
  public readonly emptyText: InputSignal<string | ((query: string) => string)> = input<
    string | ((query: string) => string)
  >('Aucun résultat');

  /**
   * Property creatable
   * @readonly
   *
   * @description
   * Whether a creation row is offered.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly creatable: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property createLabel
   * @readonly
   *
   * @description
   * Label of the creation row.
   *
   * @type {InputSignal<(query: string) => string>}
   */
  public readonly createLabel: InputSignal<(query: string) => string> = input<
    (query: string) => string
  >((query) => `Créer « ${query} »`);

  /**
   * Property loading
   * @readonly
   *
   * @description
   * Whether results are loading.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly loading: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property loadingText
   * @readonly
   *
   * @description
   * Text shown while loading.
   *
   * @type {InputSignal<string>}
   */
  public readonly loadingText: InputSignal<string> = input('Recherche…');

  /**
   * Property filter
   * @readonly
   *
   * @description
   * Optional custom search filter.
   *
   * @type {InputSignal<CwComboboxFilter<T> | null>}
   */
  public readonly filter: InputSignal<CwComboboxFilter<T> | null> =
    input<CwComboboxFilter<T> | null>(null);

  /**
   * Property summary
   * @readonly
   *
   * @description
   * Trigger text for multiple selected values.
   *
   * @type {InputSignal<(count: number) => string>}
   */
  public readonly summary: InputSignal<(count: number) => string> = input<
    (count: number) => string
  >((count) => `${String(count)} sélectionnés`);

  /**
   * Property resultsLabel
   * @readonly
   *
   * @description
   * Announcement for the number of results.
   *
   * @type {InputSignal<(count: number) => string>}
   */
  public readonly resultsLabel: InputSignal<(count: number) => string> = input<
    (count: number) => string
  >((count) => (count === 1 ? '1 résultat' : `${String(count)} résultats`));

  /**
   * Property size
   * @readonly
   *
   * @description
   * Trigger size.
   *
   * @type {InputSignal<CwComboboxSize>}
   */
  public readonly size: InputSignal<CwComboboxSize> = input<CwComboboxSize>('default');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the combobox is disabled.
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
   * @type {InputSignal<CwComboboxCompareWith<T>>}
   */
  public readonly compareWith: InputSignal<CwComboboxCompareWith<T>> = input<
    CwComboboxCompareWith<T>
  >((a, b) => a === b);

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
  public readonly id: InputSignal<string> = input(inject(_IdGenerator).getId('cw-combobox-'));

  /**
   * Property search
   * @readonly
   *
   * @description
   * Emits the query after each keystroke.
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly search: OutputEmitterRef<string> = output<string>();

  /**
   * Property create
   * @readonly
   *
   * @description
   * Emits the query when creation is requested.
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly create: OutputEmitterRef<string> = output<string>();

  /**
   * Property touch
   * @readonly
   *
   * @description
   * Emits when focus leaves the combobox.
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
   * @type {Signal<readonly CwComboboxOption[]>}
   */
  private readonly optionList: Signal<readonly CwComboboxOption[]> = contentChildren(
    CwComboboxOption,
    { descendants: true },
  );

  /**
   * Property customEmpty
   * @readonly
   *
   * @description
   * Projected empty message when present.
   *
   * @type {Signal<CwComboboxEmpty | undefined>}
   */
  private readonly customEmpty: Signal<CwComboboxEmpty | undefined> = contentChild(CwComboboxEmpty);

  /**
   * Property trigger
   * @readonly
   *
   * @description
   * Combobox trigger element.
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
   * Property searchField
   * @readonly
   *
   * @description
   * Search input in the panel.
   *
   * @type {Signal<ElementRef<HTMLInputElement> | undefined>}
   */
  private readonly searchField: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>('searchField');

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
   * Property injector
   * @readonly
   *
   * @description
   * Injector used to schedule focus.
   *
   * @type {Injector}
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announces search results.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

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
   * Disabled state supplied by the form.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   * @readonly
   *
   * @description
   * Touched state supplied by the form.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property active
   * @readonly
   *
   * @description
   * Current keyboard item.
   *
   * @type {WritableSignal<KeyOption | null>}
   */
  private readonly active: WritableSignal<KeyOption | null> = signal<KeyOption | null>(null);

  /**
   * Property keyOptions
   * @readonly
   *
   * @description
   * Cached keyboard adapters for options.
   *
   * @type {WeakMap<CwComboboxOption, KeyOption>}
   */
  private readonly keyOptions: WeakMap<CwComboboxOption, KeyOption> = new WeakMap<
    CwComboboxOption,
    KeyOption
  >();

  /**
   * Property onChange
   *
   * @description
   * Callback registered by the form control.
   *
   * @type {(value: T | readonly T[] | null) => void}
   */
  private onChange: (value: T | readonly T[] | null) => void = () => undefined;

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
   * Connected panel hosting options.
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
      this.hide(false);
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
  protected readonly listboxId: string = inject(_IdGenerator).getId('cw-combobox-listbox-');

  /**
   * Property createId
   * @readonly
   *
   * @description
   * Identifier of the creation row.
   *
   * @type {string}
   */
  protected readonly createId: string = inject(_IdGenerator).getId('cw-combobox-create-');

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
   * Property query
   * @readonly
   *
   * @description
   * Current search query.
   *
   * @type {WritableSignal<string>}
   */
  protected readonly query: WritableSignal<string> = signal('');

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
   * Property optionClass
   * @readonly
   *
   * @description
   * Classes for an option row.
   *
   * @type {string}
   */
  protected readonly optionClass: string = OPTION;

  /**
   * Property panelClass
   * @readonly
   *
   * @description
   * Classes for the panel.
   *
   * @type {string}
   */
  protected readonly panelClass: string = PANEL;

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
   * @type {Signal<readonly CwComboboxOption[]>}
   */
  public readonly options: Signal<readonly CwComboboxOption[]> = computed(() => this.optionList());

  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Option highlighted by keyboard or pointer.
   *
   * @internal
   *
   * @type {Signal<CwComboboxOption | null>}
   */
  public readonly highlighted: Signal<CwComboboxOption | null> = computed(
    () => this.active()?.option ?? null,
  );

  /**
   * Property entering
   * @readonly
   *
   * @description
   * Whether option entrance animations play.
   *
   * @internal
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly entering: WritableSignal<boolean> = signal(true);

  /**
   * Property createItem
   * @readonly
   *
   * @description
   * Keyboard adapter for the creation row.
   *
   * @type {KeyOption}
   */
  private readonly createItem: KeyOption = {
    option: null,
    disabled: false,
    getLabel: () => this.createLabel()(this.query().trim()),
    setActiveStyles: () => undefined,
    setInactiveStyles: () => undefined,
  };

  /**
   * Property selectedValues
   * @readonly
   *
   * @description
   * Selected values normalized as an array.
   *
   * @type {Signal<readonly T[]>}
   */
  private readonly selectedValues: Signal<readonly T[]> = computed<readonly T[]>(() => {
    const value: T | readonly T[] | null = this.value();
    if (value === null) return [];
    return Array.isArray(value) ? (value as readonly T[]) : [value as T];
  });

  /**
   * Property visibleOptions
   * @readonly
   *
   * @description
   * Options matching the search.
   *
   * @type {Signal<CwComboboxOption[]>}
   */
  protected readonly visibleOptions: Signal<CwComboboxOption[]> = computed(() =>
    this.options().filter((option) => option.visible()),
  );

  /**
   * Property showCreate
   * @readonly
   *
   * @description
   * Whether the creation row is available.
   *
   * @type {Signal<boolean>}
   */
  protected readonly showCreate: Signal<boolean> = computed(() => {
    const query: string = ɵfold(this.query().trim());
    if (!this.creatable() || query === '' || this.loading()) return false;
    return !this.options().some((option) => ɵfold(option.label()) === query);
  });

  /**
   * Property items
   * @readonly
   *
   * @description
   * Keyboard adapters for visible rows.
   *
   * @type {Signal<KeyOption[]>}
   */
  private readonly items: Signal<KeyOption[]> = computed(() => [
    ...this.visibleOptions().map((option) => this.keyOptionOf(option)),
    ...(this.showCreate() ? [this.createItem] : []),
  ]);

  /**
   * Property keyManager
   * @readonly
   *
   * @description
   * Keyboard manager for the result list.
   *
   * @type {ActiveDescendantKeyManager<KeyOption>}
   */
  private readonly keyManager: ActiveDescendantKeyManager<KeyOption> =
    new ActiveDescendantKeyManager<KeyOption>(this.items, this.injector).skipPredicate(
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
   * Property selectedOptions
   * @readonly
   *
   * @description
   * Options matching selected values.
   *
   * @type {Signal<CwComboboxOption[]>}
   */
  protected readonly selectedOptions: Signal<CwComboboxOption[]> = computed(() =>
    this.options().filter((option) => this.isSelected(option.value())),
  );

  /**
   * Property activeId
   * @readonly
   *
   * @description
   * Identifier of the highlighted row.
   *
   * @type {Signal<string | null>}
   */
  protected readonly activeId: Signal<string | null> = computed(() => {
    const active: KeyOption | null = this.active();
    if (!active) return null;
    return active.option ? active.option.id : this.createId;
  });

  /**
   * Property createActive
   * @readonly
   *
   * @description
   * Whether the creation row is highlighted.
   *
   * @type {Signal<boolean>}
   */
  protected readonly createActive: Signal<boolean> = computed(
    () => this.active() === this.createItem,
  );

  /**
   * Property emptyMessage
   * @readonly
   *
   * @description
   * Message for an empty search result.
   *
   * @type {Signal<string>}
   */
  protected readonly emptyMessage: Signal<string> = computed(() => {
    const text: string | ((query: string) => string) = this.emptyText();
    return typeof text === 'function' ? text(this.query().trim()) : text;
  });

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
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Connects forms, search navigation and the option panel.
   */
  public constructor() {
    // Reactive and template-driven forms: this combobox is the control's value accessor. Set here
    // rather than through NG_VALUE_ACCESSOR, so the combobox can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    const subscription: Subscription = this.keyManager.change.subscribe(() => {
      const item: (Highlightable & KeyOption) | null = this.keyManager.activeItem;
      this.active.set(item);
      const element: HTMLElement | undefined = item?.option?.element;
      if (typeof element?.scrollIntoView === 'function')
        element.scrollIntoView({ block: 'nearest' });
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
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

    // The chosen option's content (avatar and name) is copied into the trigger (Combobox sheet).
    afterRenderEffect({
      write: () => {
        const option: CwComboboxOption | undefined = this.selectedOptions().at(0);
        const display: HTMLElement | undefined = this.display()?.nativeElement;
        if (!display) return;
        const label: Element | null | undefined = option?.element.querySelector(
          '[data-cw-combobox-label]',
        );
        if (!label) {
          display.replaceChildren();
          return;
        }
        const copy: HTMLElement = label.cloneNode(true) as HTMLElement;
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
      const query: string = this.query();
      if (!this.open() || this.loading() || query === '') return;
      const count: number = this.visibleOptions().length;
      const message: string = count === 0 ? this.emptyMessage() : this.resultsLabel()(count);
      untracked(() => {
        void this.announcer.announce(message, 'polite');
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Focuses the combobox trigger.
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
   * @param {unknown} value - Option value to compare with the selection.
   *
   * @returns {boolean} Whether the value is currently selected.
   */
  public isSelected(value: unknown): boolean {
    const compare: CwComboboxCompareWith<T> = this.compareWith();
    return this.selectedValues().some((selected) => compare(selected, value as T));
  }

  /**
   * Method matches
   *
   * @description
   * Reports whether an option matches the query.
   *
   * @internal
   *
   * @param {CwComboboxOption} option - Option whose label and keywords are searched.
   *
   * @returns {boolean} Whether the option matches the query or the query is empty.
   */
  public matches(option: CwComboboxOption): boolean {
    const query: string = this.query().trim();
    if (query === '') return true;
    const candidate: { value: T; label: string; keywords: readonly string[] } = {
      value: option.value() as T,
      label: option.label(),
      keywords: option.keywords(),
    };
    const filter: CwComboboxFilter<T> | null = this.filter();
    return filter ? filter(candidate, query) : defaultFilter(candidate, query);
  }

  /**
   * Method choose
   *
   * @description
   * Selects or toggles an enabled option.
   *
   * @internal
   *
   * @param {CwComboboxOption} option - Enabled option to select or toggle.
   */
  public choose(option: CwComboboxOption): void {
    if (option.disabled()) return;
    const value: T = option.value() as T;
    if (this.multiple()) {
      const compare: CwComboboxCompareWith<T> = this.compareWith();
      const current: readonly T[] = this.selectedValues();
      const next: T[] = this.isSelected(value)
        ? current.filter((selected) => !compare(selected, value))
        : [...current, value];
      this.setValue(next);
      this.keyManager.setActiveItem(this.keyOptionOf(option));
      return;
    }
    this.setValue(value);
    this.hide(true);
  }

  /**
   * Method highlight
   *
   * @description
   * Highlights an option.
   *
   * @internal
   *
   * @param {CwComboboxOption} option - Option to highlight in the result list.
   */
  public highlight(option: CwComboboxOption): void {
    this.keyManager.setActiveItem(this.keyOptionOf(option));
  }

  /**
   * Method writeValue
   *
   * @description
   * Writes a value supplied by a form.
   *
   * @param {unknown} value - Value supplied by the form; null clears a single selection.
   */
  public writeValue(value: unknown): void {
    this.value.set((value ?? (this.multiple() ? [] : null)) as T | readonly T[] | null);
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the form change callback.
   *
   * @param {(value: T | readonly T[] | null) => void} fn - Callback notified when the selected values change.
   */
  public registerOnChange(fn: (value: T | readonly T[] | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   *
   * @description
   * Registers the form touch callback.
   *
   * @param {() => void} fn - Callback notified when the control is touched.
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
   * Method onTriggerClick
   *
   * @description
   * Toggles the panel on click.
   */
  protected onTriggerClick(): void {
    if (this.keyActed) {
      this.keyActed = false;
      return;
    }
    if (this.open()) this.hide(false);
    else this.show('');
  }

  /**
   * Method onTriggerKeydown
   *
   * @description
   * Opens or closes the panel using the keyboard.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the trigger.
   */
  protected onTriggerKeydown(event: KeyboardEvent): void {
    const key: string = event.key;
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

  /**
   * Method onTriggerBlur
   *
   * @description
   * Marks the control touched when focus leaves.
   */
  protected onTriggerBlur(): void {
    if (!this.open()) this.markTouched();
  }

  /**
   * Method onSearchInput
   *
   * @description
   * Updates the query and search results.
   *
   * @param {Event} event - Input event containing the current query.
   */
  protected onSearchInput(event: Event): void {
    const query: string = (event.target as HTMLInputElement).value;
    this.entering.set(false);
    this.query.set(query);
    this.search.emit(query);
    this.keyManager.setFirstItemActive();
  }

  /**
   * Method onSearchKeydown
   *
   * @description
   * Handles result navigation and selection.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the search field.
   */
  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (ɵnavigateList(this.keyManager, event, 'vertical')) event.preventDefault();
        return;
      case 'Enter': {
        event.preventDefault();
        const item: (Highlightable & KeyOption) | null = this.keyManager.activeItem;
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

  /**
   * Method onPanelMousedown
   *
   * @description
   * Keeps focus in the search field.
   *
   * @param {MouseEvent} event - Mouse event received inside the panel.
   */
  protected onPanelMousedown(event: MouseEvent): void {
    // Presses in the panel keep the focus in the search field, except in the field itself.
    if (event.target !== this.searchField()?.nativeElement) event.preventDefault();
  }

  /**
   * Method onPanelFocusout
   *
   * @description
   * Closes the panel when focus leaves.
   *
   * @param {FocusEvent} event - Focus event used to determine whether focus left the panel.
   */
  protected onPanelFocusout(event: FocusEvent): void {
    const next: Node | null = event.relatedTarget as Node | null;
    const panel: HTMLElement | undefined = this.panelElement()?.nativeElement;
    if (next && !panel?.contains(next) && next !== this.trigger().nativeElement) this.hide(false);
  }

  /**
   * Method onCreateClick
   *
   * @description
   * Creates an option from the query.
   */
  protected onCreateClick(): void {
    this.createFromQuery();
  }

  /**
   * Method onCreatePointerMove
   *
   * @description
   * Highlights the creation row.
   */
  protected onCreatePointerMove(): void {
    if (!this.createActive()) this.keyManager.setActiveItem(this.createItem);
  }

  /**
   * Method createFromQuery
   *
   * @description
   * Emits a nonempty creation query.
   */
  private createFromQuery(): void {
    const query: string = this.query().trim();
    if (query === '') return;
    this.create.emit(query);
    if (this.multiple()) this.setQuery('');
    else this.hide(true);
  }

  /**
   * Method setValue
   *
   * @description
   * Updates the value and notifies the form.
   *
   * @param {T | readonly T[] | null} value - Selected value or values to send to the form.
   */
  private setValue(value: T | readonly T[] | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  /**
   * Method setQuery
   *
   * @description
   * Updates and emits the search query.
   *
   * @param {string} query - Search text to store and emit.
   */
  private setQuery(query: string): void {
    this.query.set(query);
    this.search.emit(query);
    this.keyManager.setFirstItemActive();
  }

  /**
   * Method show
   *
   * @description
   * Opens the panel and selects an initial row.
   *
   * @param {string} query - Initial search text when the panel opens.
   */
  private show(query: string): void {
    if (this.isDisabled()) return;
    this.stack.open(this.stacked, this.trigger().nativeElement);
    this.entering.set(true);
    this.query.set(query);
    if (query !== '') {
      this.entering.set(false);
      this.search.emit(query);
    }
    this.open.set(true);
    const selected: CwComboboxOption | undefined = this.selectedOptions().at(0);
    if (query === '' && selected && !selected.disabled()) {
      this.keyManager.setActiveItem(this.keyOptionOf(selected));
    } else {
      this.keyManager.setFirstItemActive();
    }
  }

  /**
   * Method hide
   *
   * @description
   * Closes the panel and optionally restores focus.
   *
   * @param {boolean} restoreFocus - Whether to return focus to the trigger.
   */
  private hide(restoreFocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    this.markTouched();
    if (restoreFocus) this.trigger().nativeElement.focus();
  }

  /**
   * Method markTouched
   *
   * @description
   * Reports the touched state to forms.
   */
  private markTouched(): void {
    this.accessorTouched.set(true);
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method attach
   *
   * @description
   * Attaches the connected panel and focuses the search field.
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
        if (!event.composedPath().includes(trigger)) this.hide(false);
      },
    });
    // The search field takes the focus once the panel is in the page (sheet, "Anatomie"), also
    // when the panel reopens during its closing animation and was never removed.
    afterNextRender(
      () => {
        const field: HTMLInputElement | undefined = this.searchField()?.nativeElement;
        if (!field || field.ownerDocument.activeElement === field) return;
        field.focus();
        const end: number = field.value.length;
        field.setSelectionRange(end, end);
      },
      { injector: this.injector },
    );
  }

  /**
   * Method detach
   *
   * @description
   * Closes the panel and clears search state.
   */
  private detach(): void {
    this.stack.release(this.stacked);
    if (!this.overlay.attached()) return;
    this.overlay.close(this.panelElement()?.nativeElement, () => {
      this.keyManager.updateActiveItem(-1);
      this.active.set(null);
      this.query.set('');
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
   * Method keyOptionOf
   *
   * @description
   * Returns a cached keyboard adapter for an option.
   *
   * @param {CwComboboxOption} option - Option to adapt for keyboard navigation.
   *
   * @returns {KeyOption} Cached keyboard adapter for the option.
   */
  private keyOptionOf(option: CwComboboxOption): KeyOption {
    let item: KeyOption | undefined = this.keyOptions.get(option);
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
  // #endregion
}
