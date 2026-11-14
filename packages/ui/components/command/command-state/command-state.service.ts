import {
  ActiveDescendantKeyManager,
  type Highlightable,
  LiveAnnouncer,
  _IdGenerator,
} from '@angular/cdk/a11y';
import {
  computed,
  effect,
  inject,
  Injector,
  type ModelSignal,
  Service,
  signal,
  type Signal,
  untracked,
  type WritableSignal,
} from '@angular/core';

import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwCommandFilter } from '../command.types';

/* Announced after each search (Command sheet, "Accessibilité": « 3 résultats »). */
/**
 * Constant RESULTS
 *
 * @description
 * French result-count announcements for a command search.
 *
 * @type {{ readonly none: "Aucun résultat"; readonly one: "1 résultat"; readonly many: (count: number) => string; }}
 */
const RESULTS: {
  readonly none: 'Aucun résultat';
  readonly one: '1 résultat';
  readonly many: (count: number) => string;
} = {
  none: 'Aucun résultat',
  one: '1 résultat',
  many: (count: number) => `${String(count)} résultats`,
} as const;

/**
 * Interface CommandHost
 *
 * @description
 * The inputs of the element that owns the state: `cw-command` or `cw-command-dialog`.
 */
export interface CommandHost {
  // #region Properties
  /**
   * Property search
   *
   * @description
   * Search text controlled by the owning command.
   *
   * @type {ModelSignal<string>}
   * @readonly
   */
  readonly search: ModelSignal<string>;

  /**
   * Property filter
   *
   * @description
   * Optional scoring function used to filter command items.
   *
   * @type {Signal<CwCommandFilter | null>}
   * @readonly
   */
  readonly filter: Signal<CwCommandFilter | null>;

  /**
   * Property loading
   *
   * @description
   * Whether a server search is running.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly loading: Signal<boolean>;

  /**
   * Property loop
   *
   * @description
   * Whether keyboard navigation wraps around the list.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly loop: Signal<boolean>;
  // #endregion
}

/**
 * Interface CommandOption
 *
 * @description
 * An item as the state sees it; `cw-command-item` builds one for itself.
 */
export interface CommandOption extends Highlightable {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Identifier of the command option.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property element
   *
   * @description
   * Native option element used for document ordering.
   *
   * @type {HTMLElement}
   * @readonly
   */
  readonly element: HTMLElement;

  /**
   * Property group
   *
   * @description
   * Containing group, or null for an ungrouped option.
   *
   * @type {object | null}
   * @readonly
   */
  readonly group: object | null;
  // #endregion
  // #region Methods
  /**
   * Method value
   *
   * @description
   * Returns the option text used for matching.
   * @returns {string} Option text used for matching.
   */
  value(): string;

  /**
   * Method keywords
   *
   * @description
   * Returns alternative terms used for matching.
   * @returns {readonly string[]} Alternative search terms for the option.
   */
  keywords(): readonly string[];

  /**
   * Method isDisabled
   *
   * @description
   * Checks whether the option is unavailable.
   * @returns {boolean} Whether the option is disabled.
   */
  isDisabled(): boolean;

  /**
   * Method select
   *
   * @description
   * Runs the option action.
   */
  select(): void;
  // #endregion
}

/**
 * Service CommandState
 *
 * @description
 * The search, the filtered items and the highlighted one of a command, shared by its parts. `cw-command` and `cw-command-dialog` each provide one and connect their inputs; the input, the list, the groups and the items inject it. The focus stays in the field: the CDK `ActiveDescendantKeyManager`, driven by `ɵnavigateList`, moves the highlight and the field points at it with `aria-activedescendant` (Command sheet). Not exported from the entry point.
 */
@Service({ autoProvided: false })
export class CommandState {
  // #region Properties
  /**
   * Property listId
   *
   * @description
   * Id of the listbox, for the field's `aria-controls`.
   *
   * @type {string}
   * @readonly
   */
  public readonly listId: string = inject(_IdGenerator).getId('cw-command-list-');

  /**
   * Property host
   *
   * @description
   * Connected owner of the command inputs.
   *
   * @type {WritableSignal<CommandHost | null>}
   * @readonly
   */
  private readonly host: WritableSignal<CommandHost | null> = signal<CommandHost | null>(null);

  /**
   * Property announcer
   *
   * @description
   * Live announcer for search result counts.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property options
   *
   * @description
   * Registered command options.
   *
   * @type {WritableSignal<readonly CommandOption[]>}
   * @readonly
   */
  private readonly options: WritableSignal<readonly CommandOption[]> = signal<
    readonly CommandOption[]
  >([]);

  /**
   * Property highlightedOption
   *
   * @description
   * Option currently highlighted by keyboard or pointer.
   *
   * @type {WritableSignal<CommandOption | null>}
   * @readonly
   */
  private readonly highlightedOption: WritableSignal<CommandOption | null> =
    signal<CommandOption | null>(null);

  /**
   * Property lastSearch
   *
   * @description
   * Last search used to choose the initial highlight.
   *
   * @type {string | null}
   */
  private lastSearch: string | null = null;

  /**
   * Property search
   *
   * @description
   * The text typed in the field.
   *
   * @type {Signal<string>}
   * @readonly
   */
  public readonly search: Signal<string> = computed(() => this.host()?.search() ?? '');

  /**
   * Property loading
   *
   * @description
   * Whether a server search is running.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly loading: Signal<boolean> = computed(() => this.host()?.loading() ?? false);

  /**
   * Property entrance
   *
   * @description
   * Whether the rows enter one by one: at opening, not at each keystroke (Command sheet).
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly entrance: WritableSignal<boolean> = signal(true);

  /**
   * Property scores
   *
   * @description
   * Current match scores indexed by option.
   *
   * @type {Signal<Map<CommandOption, number>>}
   * @readonly
   */
  private readonly scores: Signal<Map<CommandOption, number>> = computed(() => {
    const search: string = this.search().trim();
    const filter: CwCommandFilter | null = this.host()?.filter() ?? null;
    return new Map(
      this.options().map((option) => [
        option,
        !search || !filter ? 1 : filter(option.value(), search, option.keywords()),
      ]),
    );
  });

  /**
   * Property visible
   *
   * @description
   * The items that match the search, in document order.
   *
   * @type {Signal<CommandOption[]>}
   * @readonly
   */
  public readonly visible: Signal<CommandOption[]> = computed(() =>
    this.options()
      .filter((option) => (this.scores().get(option) ?? 0) > 0)
      .sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      ),
  );

  /**
   * Property highlighted
   *
   * @description
   * The highlighted item, the one Enter runs.
   *
   * @type {Signal<CommandOption | null>}
   * @readonly
   */
  public readonly highlighted: Signal<CommandOption | null> = this.highlightedOption.asReadonly();

  /**
   * Property activeDescendant
   *
   * @description
   * Id of the highlighted item, for the field's `aria-activedescendant`.
   *
   * @type {Signal<string | null>}
   * @readonly
   */
  public readonly activeDescendant: Signal<string | null> = computed(
    () => this.highlightedOption()?.id ?? null,
  );

  /**
   * Property keyManager
   *
   * @description
   * CDK manager for highlighted options and keyboard navigation.
   *
   * @type {ActiveDescendantKeyManager<CommandOption>}
   * @readonly
   */
  private readonly keyManager: ActiveDescendantKeyManager<CommandOption> =
    new ActiveDescendantKeyManager<CommandOption>(this.visible, inject(Injector))
      .withVerticalOrientation()
      .withHomeAndEnd()
      .skipPredicate((option) => option.isDisabled());
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Synchronizes the highlight and announces search result counts.
   *
   * @constructor
   */
  public constructor() {
    // The first result is highlighted at each keystroke (Command sheet, "Surligné"), and again when
    // the highlighted item stops matching.
    effect(() => {
      const search: string = this.search();
      const visible: CommandOption[] = this.visible();
      untracked(() => {
        const current: CommandOption | null = this.highlightedOption();
        if (search === this.lastSearch && current && visible.includes(current)) return;
        this.lastSearch = search;
        this.highlightFirst(visible);
      });
    });

    effect(() => {
      const search: string = this.search().trim();
      const count: number = this.visible().length;
      if (!search || this.loading()) return;
      const message: string =
        count === 0 ? RESULTS.none : count === 1 ? RESULTS.one : RESULTS.many(count);
      untracked(() => void this.announcer.announce(message, 'polite'));
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method connect
   *
   * @description
   * Connects the inputs of the owning element.
   *
   * @param {CommandHost} host - Owning command inputs to connect.
   */
  public connect(host: CommandHost): void {
    this.host.set(host);
  }

  /**
   * Method register
   *
   * @description
   * Registers an option with the command.
   *
   * @param {CommandOption} option - Command option involved in the operation.
   */
  public register(option: CommandOption): void {
    this.options.update((options) => [...options, option]);
  }

  /**
   * Method unregister
   *
   * @description
   * Removes an option and clears its highlight when needed.
   *
   * @param {CommandOption} option - Command option involved in the operation.
   */
  public unregister(option: CommandOption): void {
    this.options.update((options) => options.filter((other) => other !== option));
    if (this.highlightedOption() === option) this.highlightedOption.set(null);
  }

  /**
   * Method isVisible
   *
   * @description
   * Checks whether an option matches the current search.
   *
   * @param {CommandOption} option - Command option involved in the operation.
   * @returns {boolean} Whether the option matches the current search.
   */
  public isVisible(option: CommandOption): boolean {
    return this.visible().includes(option);
  }

  /**
   * Method hasVisibleIn
   *
   * @description
   * Checks whether a group contains a visible option.
   *
   * @param {object} group - Group whose visible options are checked.
   * @returns {boolean} Whether the group contains a visible option.
   */
  public hasVisibleIn(group: object): boolean {
    return this.visible().some((option) => option.group === group);
  }

  /**
   * Method setSearch
   *
   * @description
   * Updates the owner search and disables entrance animation.
   *
   * @param {string} search - Search text to apply.
   */
  public setSearch(search: string): void {
    this.host()?.search.set(search);
    this.entrance.set(false);
  }

  /**
   * Method reset
   *
   * @description
   * Back to the opening state: rows enter again (the palette reopens).
   */
  public reset(): void {
    this.entrance.set(true);
  }

  /**
   * Method highlight
   *
   * @description
   * Highlights an item under the pointer (Command sheet, "Surligné": ↑ ↓ and hover).
   *
   * @param {CommandOption} option - Command option involved in the operation.
   */
  public highlight(option: CommandOption): void {
    if (option.isDisabled()) return;
    this.keyManager.setActiveItem(option);
    this.highlightedOption.set(option);
  }

  /**
   * Method onKeydown
   *
   * @description
   * The keys of the field: ↑ ↓ Home End move, Enter runs, Escape clears the search first.
   *
   * @param {KeyboardEvent} event - Keyboard event from the search field.
   */
  public onKeydown(event: KeyboardEvent): void {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      this.keyManager.withWrap(this.host()?.loop() ?? true);
      const current: CommandOption | null = this.highlightedOption();
      if (current) this.keyManager.updateActiveItem(current);
      if (ɵnavigateList(this.keyManager, event, 'vertical')) {
        event.preventDefault();
        this.highlightedOption.set(this.keyManager.activeItem);
        this.reveal(this.keyManager.activeItem);
      }
      return;
    }
    if (event.key === 'Enter' && !event.isComposing) {
      const current: CommandOption | null = this.highlightedOption();
      if (current && !current.isDisabled()) {
        event.preventDefault();
        current.select();
      }
      return;
    }
    if (event.key === 'Escape' && this.search()) {
      // Command sheet, "Clavier": Escape clears the search, then closes the palette.
      event.preventDefault();
      event.stopPropagation();
      this.setSearch('');
    }
  }

  /**
   * Method highlightFirst
   *
   * @description
   * Highlights the first enabled visible option.
   *
   * @param {readonly CommandOption[]} visible - Visible options in document order.
   */
  private highlightFirst(visible: readonly CommandOption[]): void {
    const first: CommandOption | null = visible.find((option) => !option.isDisabled()) ?? null;
    if (first) this.keyManager.setActiveItem(first);
    else this.keyManager.updateActiveItem(-1);
    this.highlightedOption.set(first);
  }

  /**
   * Method reveal
   *
   * @description
   * Scrolls a highlighted option into view when supported.
   *
   * @param {CommandOption | null} option - Command option involved in the operation.
   */
  private reveal(option: CommandOption | null): void {
    const element: HTMLElement | undefined = option?.element;
    // jsdom has no scrollIntoView.
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest' });
    }
  }
  // #endregion
}
