import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  output,
  signal,
  type TemplateRef,
  type InputSignal,
  type InputSignalWithTransform,
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
import { ɵConnectedPanel, ɵnavigateList, ɵPanelStack, type ɵStackedPanel } from '@cadenway/ui/core';
import type { Subscription } from 'rxjs';
import { CwSpinner } from '@cadenway/ui/components/spinner';

import { CwAutocompleteOption } from './autocomplete-option/autocomplete-option.component';
import { EMPTY } from './autocomplete.styles';
import { AUTOCOMPLETE_HOST, type AutocompleteHost } from './autocomplete.token';

/* The panel (Autocomplete sheet and preview of the Design System artifact): at least as wide as the
   field, up to `max-w-sm`, scrolled past 320 px. It opens from the field corner (`--menu-from`)
   and closes with `menu-out`. */
/**
 * Constant PANEL
 *
 * @description
 * Classes for the autocomplete suggestion panel.
 *
 * @type {string}
 */
const PANEL: string =
  'block max-h-80 max-w-sm overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md animate-menu-in data-[state=closed]:animate-menu-out motion-reduce:animate-none';

/**
 * Interface KeyOption
 *
 * @description
 * Suggestion adapter for the CDK key manager.
 */
interface KeyOption extends Highlightable {
  // #region Properties
  /**
   * Property option
   * @readonly
   *
   * @description
   * Suggestion represented by this adapter.
   *
   * @type {CwAutocompleteOption}
   */
  readonly option: CwAutocompleteOption;
  // #endregion
}

/**
 * Component CwAutocomplete
 *
 * @description
 * The suggestion panel of a text field: mentions after `@` in a comment, the quick search of tasks,
 * a free entry helped by suggestions (Autocomplete sheet of the Design System artifact). The typed
 * text stays valid: nothing is forced.
 *
 * Declare it once and point a field at it: `<input cwInput [cwAutocomplete]="panel">`. The field
 * (`CwAutocompleteTrigger`) opens it while the user types; this panel holds the suggestions
 * (`cw-autocomplete-option`, `cw-autocomplete-group`) in a CDK overlay at least as wide as the
 * field, with the typed part of each label in bold (`highlight`). It does not filter: listen to
 * `query`, emitted at each keystroke, and give the matching suggestions (`loading` shows the
 * spinner and `loadingText` meanwhile). Without a suggestion it shows `emptyText(query)`.
 * Choosing one emits `optionSelected` with its value. The number of suggestions, the loading and
 * the empty message are announced politely.
 */
@Component({
  selector: 'cw-autocomplete',
  exportAs: 'cwAutocomplete',
  imports: [CwSpinner],
  providers: [
    ɵConnectedPanel,
    { provide: AUTOCOMPLETE_HOST, useExisting: forwardRef(() => CwAutocomplete) },
  ],
  host: { class: 'hidden' },
  templateUrl: './autocomplete.component.html',
})
export class CwAutocomplete<T = unknown> implements AutocompleteHost {
  // #region Properties
  /**
   * Property loading
   * @readonly
   *
   * @description
   * Whether suggestions are loading.
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
   * Property emptyText
   * @readonly
   *
   * @description
   * Message shown when no suggestions match.
   *
   * @type {InputSignal<(query: string) => string>}
   */
  public readonly emptyText: InputSignal<(query: string) => string> = input<
    (query: string) => string
  >((query) => `Aucune suggestion : Entrée garde « ${query} ».`);

  /**
   * Property highlight
   * @readonly
   *
   * @description
   * Whether matching query text is emphasized.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly highlight: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property ariaLabel
   * @readonly
   *
   * @description
   * Accessible name of the suggestion list.
   *
   * @type {InputSignal<string>}
   */
  public readonly ariaLabel: InputSignal<string> = input('Suggestions');

  /**
   * Property resultsLabel
   * @readonly
   *
   * @description
   * Announcement for the number of suggestions.
   *
   * @type {InputSignal<(count: number) => string>}
   */
  public readonly resultsLabel: InputSignal<(count: number) => string> = input<
    (count: number) => string
  >((count) => (count === 1 ? '1 suggestion' : `${String(count)} suggestions`));

  /**
   * Property optionSelected
   * @readonly
   *
   * @description
   * Emits the value of the chosen suggestion.
   *
   * @type {OutputEmitterRef<T>}
   */
  public readonly optionSelected: OutputEmitterRef<T> = output<T>();

  /**
   * Property query
   * @readonly
   *
   * @description
   * Emits the query after each keystroke.
   *
   * @type {OutputEmitterRef<string>}
   */
  public readonly query: OutputEmitterRef<string> = output<string>();

  /**
   * Property optionList
   * @readonly
   *
   * @description
   * Projected suggestions in display order.
   *
   * @type {Signal<readonly CwAutocompleteOption[]>}
   */
  private readonly optionList: Signal<readonly CwAutocompleteOption[]> = contentChildren(
    CwAutocompleteOption,
    { descendants: true },
  );

  /**
   * Property panelElement
   * @readonly
   *
   * @description
   * Rendered suggestion panel.
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
   * Property announcer
   * @readonly
   *
   * @description
   * Announces suggestion and loading states.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property active
   * @readonly
   *
   * @description
   * Currently highlighted suggestion.
   *
   * @type {WritableSignal<CwAutocompleteOption | null>}
   */
  private readonly active: WritableSignal<CwAutocompleteOption | null> =
    signal<CwAutocompleteOption | null>(null);

  /**
   * Property keyOptions
   * @readonly
   *
   * @description
   * Cached keyboard adapters for suggestions.
   *
   * @type {WeakMap<CwAutocompleteOption, KeyOption>}
   */
  private readonly keyOptions: WeakMap<CwAutocompleteOption, KeyOption> = new WeakMap<
    CwAutocompleteOption,
    KeyOption
  >();

  /**
   * Property chosen
   *
   * @description
   * Callback writing a chosen suggestion into the field.
   *
   * @type {((option: CwAutocompleteOption) => void) | null}
   */
  private chosen: ((option: CwAutocompleteOption) => void) | null = null;

  /**
   * Property overlay
   * @readonly
   *
   * @description
   * Connected panel hosting suggestions.
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
   * Property panelClass
   * @readonly
   *
   * @description
   * Classes for the suggestion panel.
   *
   * @type {string}
   */
  protected readonly panelClass: string = PANEL;

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
   * Property typed
   * @readonly
   *
   * @description
   * Current query text.
   *
   * @type {WritableSignal<string>}
   */
  protected readonly typed: WritableSignal<string> = signal('');

  /**
   * Property listboxId
   * @readonly
   *
   * @description
   * Identifier of the suggestion listbox.
   *
   * @internal
   *
   * @type {string}
   */
  public readonly listboxId: string = inject(_IdGenerator).getId('cw-autocomplete-listbox-');

  /**
   * Property isOpen
   * @readonly
   *
   * @description
   * Whether the panel is open.
   *
   * @internal
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly isOpen: WritableSignal<boolean> = signal(false);

  /**
   * Property options
   * @readonly
   *
   * @description
   * Suggestions in display order.
   *
   * @internal
   *
   * @type {Signal<readonly CwAutocompleteOption[]>}
   */
  public readonly options: Signal<readonly CwAutocompleteOption[]> = computed(() =>
    this.optionList(),
  );

  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Currently highlighted suggestion.
   *
   * @internal
   *
   * @type {Signal<CwAutocompleteOption | null>}
   */
  public readonly highlighted: Signal<CwAutocompleteOption | null> = this.active.asReadonly();

  /**
   * Property activeId
   * @readonly
   *
   * @description
   * Identifier of the highlighted suggestion.
   *
   * @internal
   *
   * @type {Signal<string | null>}
   */
  public readonly activeId: Signal<string | null> = computed(() => this.active()?.id ?? null);

  /**
   * Property mark
   * @readonly
   *
   * @description
   * Query text highlighted in labels.
   *
   * @internal
   *
   * @type {Signal<string>}
   */
  public readonly mark: Signal<string> = computed(() => (this.highlight() ? this.typed() : ''));

  /**
   * Property entering
   * @readonly
   *
   * @description
   * Whether suggestion entrance animations play.
   *
   * @internal
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly entering: WritableSignal<boolean> = signal(true);

  /**
   * Property items
   * @readonly
   *
   * @description
   * Keyboard adapters for current suggestions.
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
   * Keyboard manager for the suggestion list.
   *
   * @type {ActiveDescendantKeyManager<KeyOption>}
   */
  private readonly keyManager: ActiveDescendantKeyManager<KeyOption> =
    new ActiveDescendantKeyManager<KeyOption>(this.items, inject(Injector)).skipPredicate(
      (item) => item.disabled === true,
    );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Connects navigation and announces suggestion updates.
   */
  public constructor() {
    const subscription: Subscription = this.keyManager.change.subscribe(() => {
      const option: CwAutocompleteOption | null = this.keyManager.activeItem?.option ?? null;
      this.active.set(option);
      if (typeof option?.element.scrollIntoView === 'function') {
        option.element.scrollIntoView({ block: 'nearest' });
      }
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      this.stack.release(this.stacked);
      this.overlay.dispose();
    });

    // The number of suggestions, the loading state or the empty message, said politely (sheet,
    // "Accessibilité").
    effect(() => {
      if (!this.isOpen()) return;
      const count: number = this.options().length;
      const message: string = this.loading()
        ? this.loadingText()
        : count === 0
          ? this.emptyText()(this.typed())
          : this.resultsLabel()(count);
      untracked(() => {
        void this.announcer.announce(message, 'polite');
      });
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method show
   *
   * @description
   * Opens the panel from the input and registers its selection callback.
   *
   * @internal
   *
   * @param {HTMLElement} origin - Input element anchoring the panel.
   * @param {(option: CwAutocompleteOption) => void} chosen - Callback writing the selected suggestion to that input.
   */
  public show(origin: HTMLElement, chosen: (option: CwAutocompleteOption) => void): void {
    this.chosen = chosen;
    this.stack.open(this.stacked, origin);
    if (!this.isOpen()) this.entering.set(true);
    this.isOpen.set(true);
    this.overlay.open({
      origin,
      template: this.panelTemplate(),
      viewContainerRef: this.viewContainerRef,
      outsideClick: (event) => {
        // A press in the field keeps the panel: the caret moves, the user keeps typing.
        if (!event.composedPath().includes(origin)) this.hide();
      },
    });
  }

  /**
   * Method hide
   *
   * @description
   * Closes the suggestion panel.
   *
   * @internal
   */
  public hide(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.stack.release(this.stacked);
    this.overlay.close(this.panelElement()?.nativeElement, () => {
      this.keyManager.updateActiveItem(-1);
      this.active.set(null);
    });
  }

  /**
   * Method search
   *
   * @description
   * Updates the query and clears the highlighted suggestion.
   *
   * @internal
   *
   * @param {string} text - Query text to emit and highlight.
   */
  public search(text: string): void {
    if (this.isOpen()) this.entering.set(false);
    this.typed.set(text);
    this.query.emit(text);
    // No suggestion is forced: nothing is highlighted until the arrows move (sheet, "Règles").
    this.keyManager.updateActiveItem(-1);
    this.active.set(null);
  }

  /**
   * Method navigate
   *
   * @description
   * Moves the highlighted suggestion with arrow keys.
   *
   * @internal
   *
   * @param {KeyboardEvent} event - Keyboard event containing an arrow key.
   *
   * @returns {boolean} Whether the key was handled as suggestion navigation.
   */
  public navigate(event: KeyboardEvent): boolean {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return false;
    if (this.keyManager.activeItemIndex === -1) {
      if (event.key === 'ArrowDown') this.keyManager.setFirstItemActive();
      else this.keyManager.setLastItemActive();
      return true;
    }
    return ɵnavigateList(this.keyManager, event, 'vertical');
  }

  /**
   * Method chooseActive
   *
   * @description
   * Chooses the highlighted suggestion when available.
   *
   * @internal
   *
   * @returns {boolean} Whether an enabled highlighted suggestion was selected.
   */
  public chooseActive(): boolean {
    const option: CwAutocompleteOption | null = this.active();
    if (!option || option.disabled()) return false;
    this.choose(option);
    return true;
  }

  /**
   * Method choose
   *
   * @description
   * Chooses a suggestion and emits its value.
   *
   * @internal
   *
   * @param {CwAutocompleteOption} option - Enabled suggestion to choose.
   */
  public choose(option: CwAutocompleteOption): void {
    if (option.disabled()) return;
    this.chosen?.(option);
    this.optionSelected.emit(option.value() as T);
    this.hide();
  }

  /**
   * Method highlightOption
   *
   * @description
   * Highlights a suggestion.
   *
   * @internal
   *
   * @param {CwAutocompleteOption} option - Suggestion to highlight.
   */
  public highlightOption(option: CwAutocompleteOption): void {
    this.keyManager.setActiveItem(this.keyOptionOf(option));
  }

  /**
   * Method keyOptionOf
   *
   * @description
   * Returns a cached keyboard adapter for a suggestion.
   *
   * @param {CwAutocompleteOption} option - Suggestion to adapt for keyboard navigation.
   *
   * @returns {KeyOption} Cached keyboard adapter for the suggestion.
   */
  private keyOptionOf(option: CwAutocompleteOption): KeyOption {
    let item: KeyOption | undefined = this.keyOptions.get(option);
    if (!item) {
      // The suggestion's signal input `disabled` cannot be the `disabled: boolean` the manager reads.
      item = {
        option,
        get disabled(): boolean {
          return option.disabled();
        },
        setActiveStyles: () => undefined,
        setInactiveStyles: () => undefined,
      };
      this.keyOptions.set(option, item);
    }
    return item;
  }
  // #endregion
}
