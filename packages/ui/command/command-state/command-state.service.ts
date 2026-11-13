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
} from '@angular/core';

import { ɵnavigateList } from '@cadenway/ui/core';

import type { CwCommandFilter } from '../command.types';

/* Announced after each search (Command sheet, "Accessibilité": « 3 résultats »). */
const RESULTS = {
  none: 'Aucun résultat',
  one: '1 résultat',
  many: (count: number) => `${String(count)} résultats`,
} as const;

/** The inputs of the element that owns the state: `cw-command` or `cw-command-dialog`. */
export interface CommandHost {
  readonly search: ModelSignal<string>;
  readonly filter: Signal<CwCommandFilter | null>;
  readonly loading: Signal<boolean>;
  readonly loop: Signal<boolean>;
}

/** An item as the state sees it; `cw-command-item` builds one for itself. */
export interface CommandOption extends Highlightable {
  readonly id: string;
  readonly element: HTMLElement;
  readonly group: object | null;
  value(): string;
  keywords(): readonly string[];
  isDisabled(): boolean;
  select(): void;
}

/**
 * The search, the filtered items and the highlighted one of a command, shared by its parts.
 *
 * `cw-command` and `cw-command-dialog` each provide one and connect their inputs; the input, the
 * list, the groups and the items inject it. The focus stays in the field: the CDK
 * `ActiveDescendantKeyManager`, driven by `ɵnavigateList`, moves the highlight and the field points
 * at it with `aria-activedescendant` (Command sheet). Not exported from the entry point.
 */
@Service({ autoProvided: false })
export class CommandState {
  /** Id of the listbox, for the field's `aria-controls`. */
  readonly listId = inject(_IdGenerator).getId('cw-command-list-');

  private readonly host = signal<CommandHost | null>(null);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly options = signal<readonly CommandOption[]>([]);
  private readonly highlightedOption = signal<CommandOption | null>(null);
  private lastSearch: string | null = null;

  /** The text typed in the field. */
  readonly search = computed(() => this.host()?.search() ?? '');
  /** Whether a server search is running. */
  readonly loading = computed(() => this.host()?.loading() ?? false);
  /** Whether the rows enter one by one: at opening, not at each keystroke (Command sheet). */
  readonly entrance = signal(true);

  private readonly scores = computed(() => {
    const search = this.search().trim();
    const filter = this.host()?.filter() ?? null;
    return new Map(
      this.options().map((option) => [
        option,
        !search || !filter ? 1 : filter(option.value(), search, option.keywords()),
      ]),
    );
  });

  /** The items that match the search, in document order. */
  readonly visible = computed(() =>
    this.options()
      .filter((option) => (this.scores().get(option) ?? 0) > 0)
      .sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      ),
  );

  /** The highlighted item, the one Enter runs. */
  readonly highlighted = this.highlightedOption.asReadonly();
  /** Id of the highlighted item, for the field's `aria-activedescendant`. */
  readonly activeDescendant = computed(() => this.highlightedOption()?.id ?? null);

  private readonly keyManager = new ActiveDescendantKeyManager<CommandOption>(
    this.visible,
    inject(Injector),
  )
    .withVerticalOrientation()
    .withHomeAndEnd()
    .skipPredicate((option) => option.isDisabled());

  constructor() {
    // The first result is highlighted at each keystroke (Command sheet, "Surligné"), and again when
    // the highlighted item stops matching.
    effect(() => {
      const search = this.search();
      const visible = this.visible();
      untracked(() => {
        const current = this.highlightedOption();
        if (search === this.lastSearch && current && visible.includes(current)) return;
        this.lastSearch = search;
        this.highlightFirst(visible);
      });
    });

    effect(() => {
      const search = this.search().trim();
      const count = this.visible().length;
      if (!search || this.loading()) return;
      const message = count === 0 ? RESULTS.none : count === 1 ? RESULTS.one : RESULTS.many(count);
      untracked(() => void this.announcer.announce(message, 'polite'));
    });
  }

  /** Connects the inputs of the owning element. */
  connect(host: CommandHost): void {
    this.host.set(host);
  }

  register(option: CommandOption): void {
    this.options.update((options) => [...options, option]);
  }

  unregister(option: CommandOption): void {
    this.options.update((options) => options.filter((other) => other !== option));
    if (this.highlightedOption() === option) this.highlightedOption.set(null);
  }

  isVisible(option: CommandOption): boolean {
    return this.visible().includes(option);
  }

  hasVisibleIn(group: object): boolean {
    return this.visible().some((option) => option.group === group);
  }

  setSearch(search: string): void {
    this.host()?.search.set(search);
    this.entrance.set(false);
  }

  /** Back to the opening state: rows enter again (the palette reopens). */
  reset(): void {
    this.entrance.set(true);
  }

  /** Highlights an item under the pointer (Command sheet, "Surligné": ↑ ↓ and hover). */
  highlight(option: CommandOption): void {
    if (option.isDisabled()) return;
    this.keyManager.setActiveItem(option);
    this.highlightedOption.set(option);
  }

  /** The keys of the field: ↑ ↓ Home End move, Enter runs, Escape clears the search first. */
  onKeydown(event: KeyboardEvent): void {
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      this.keyManager.withWrap(this.host()?.loop() ?? true);
      const current = this.highlightedOption();
      if (current) this.keyManager.updateActiveItem(current);
      if (ɵnavigateList(this.keyManager, event, 'vertical')) {
        event.preventDefault();
        this.highlightedOption.set(this.keyManager.activeItem);
        this.reveal(this.keyManager.activeItem);
      }
      return;
    }
    if (event.key === 'Enter' && !event.isComposing) {
      const current = this.highlightedOption();
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

  private highlightFirst(visible: readonly CommandOption[]): void {
    const first = visible.find((option) => !option.isDisabled()) ?? null;
    if (first) this.keyManager.setActiveItem(first);
    else this.keyManager.updateActiveItem(-1);
    this.highlightedOption.set(first);
  }

  private reveal(option: CommandOption | null): void {
    const element = option?.element;
    // jsdom has no scrollIntoView.
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest' });
    }
  }
}
