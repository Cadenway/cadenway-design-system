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
import { CwSpinner } from '@cadenway/ui/components/spinner';

import { CwAutocompleteOption } from './autocomplete-option/autocomplete-option.component';
import { EMPTY } from './autocomplete.styles';
import { AUTOCOMPLETE_HOST, type AutocompleteHost } from './autocomplete.token';

/* The panel (Autocomplete sheet and preview of the Design System artifact): at least as wide as the
   field, up to `max-w-sm`, scrolled past 320 px. It opens from the field corner (`--menu-from`)
   and closes with `menu-out`. */
const PANEL =
  'block max-h-80 max-w-sm overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md animate-menu-in data-[state=closed]:animate-menu-out motion-reduce:animate-none';

/** The item the CDK key manager moves through: one per suggestion, reading it when asked. */
interface KeyOption extends Highlightable {
  readonly option: CwAutocompleteOption;
}

/**
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
  /** Suggestions are loading: the spinner and `loadingText` replace the list. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Text next to the spinner while loading. */
  readonly loadingText = input('Recherche…');
  /** Message without suggestion; it receives the typed text. */
  readonly emptyText = input<(query: string) => string>(
    (query) => `Aucune suggestion : Entrée garde « ${query} ».`,
  );
  /** Sets the typed part of each label in bold. */
  readonly highlight = input(true, { transform: booleanAttribute });
  /** Accessible name of the list of suggestions. */
  readonly ariaLabel = input('Suggestions');
  /** The announcement of the number of suggestions. */
  readonly resultsLabel = input<(count: number) => string>((count) =>
    count === 1 ? '1 suggestion' : `${String(count)} suggestions`,
  );
  /** Emits the value of the chosen suggestion. */
  readonly optionSelected = output<T>();
  /** Emits the typed text (after the `trigger` character, if any) at each keystroke. */
  readonly query = output<string>();

  private readonly optionList = contentChildren(CwAutocompleteOption, { descendants: true });
  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTemplate');
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly active = signal<CwAutocompleteOption | null>(null);
  private readonly keyOptions = new WeakMap<CwAutocompleteOption, KeyOption>();
  private chosen: ((option: CwAutocompleteOption) => void) | null = null;

  protected readonly overlay = inject(ɵConnectedPanel);
  private readonly stack = inject(ɵPanelStack);
  // This panel as the shared panel stack sees it: another panel opened by the user closes it.
  private readonly stacked: ɵStackedPanel = {
    close: () => {
      this.hide();
    },
    contains: (node) => this.overlay.contains(node),
  };
  protected readonly panelClass = PANEL;
  protected readonly emptyClass = EMPTY;
  protected readonly typed = signal('');

  /** @internal The id of the listbox, for the field's `aria-controls`. */
  readonly listboxId = inject(_IdGenerator).getId('cw-autocomplete-listbox-');
  /** @internal Whether the panel is shown (and not closing). */
  readonly isOpen = signal(false);
  /** @internal The suggestions of the panel, in order. */
  readonly options = computed(() => this.optionList() as readonly CwAutocompleteOption[]);
  /** @internal The suggestion highlighted by the arrows or the pointer. */
  readonly highlighted = this.active.asReadonly();
  /** @internal The id of the highlighted suggestion, for the field's `aria-activedescendant`. */
  readonly activeId = computed(() => this.active()?.id ?? null);
  /** @internal The typed text set in bold in the labels. */
  readonly mark = computed(() => (this.highlight() ? this.typed() : ''));
  /** @internal Whether the rows play their entrance (at opening, until the next keystroke). */
  readonly entering = signal(true);

  private readonly items = computed(() => this.options().map((option) => this.keyOptionOf(option)));
  private readonly keyManager = new ActiveDescendantKeyManager<KeyOption>(
    this.items,
    inject(Injector),
  ).skipPredicate((item) => item.disabled === true);

  constructor() {
    const subscription = this.keyManager.change.subscribe(() => {
      const option = this.keyManager.activeItem?.option ?? null;
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
      const count = this.options().length;
      const message = this.loading()
        ? this.loadingText()
        : count === 0
          ? this.emptyText()(this.typed())
          : this.resultsLabel()(count);
      untracked(() => {
        void this.announcer.announce(message, 'polite');
      });
    });
  }

  /** @internal Shows the panel against `origin`; `chosen` writes a chosen suggestion into the field. */
  show(origin: HTMLElement, chosen: (option: CwAutocompleteOption) => void): void {
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

  /** @internal Closes the panel; the typed text stays in the field. */
  hide(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.stack.release(this.stacked);
    this.overlay.close(this.panelElement()?.nativeElement, () => {
      this.keyManager.updateActiveItem(-1);
      this.active.set(null);
    });
  }

  /** @internal Takes the typed text: emits `query`, sets the bold, clears the highlight. */
  search(text: string): void {
    if (this.isOpen()) this.entering.set(false);
    this.typed.set(text);
    this.query.emit(text);
    // No suggestion is forced: nothing is highlighted until the arrows move (sheet, "Règles").
    this.keyManager.updateActiveItem(-1);
    this.active.set(null);
  }

  /** @internal Moves the highlight with ↓ ↑; returns whether the key was handled. */
  navigate(event: KeyboardEvent): boolean {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return false;
    if (this.keyManager.activeItemIndex === -1) {
      if (event.key === 'ArrowDown') this.keyManager.setFirstItemActive();
      else this.keyManager.setLastItemActive();
      return true;
    }
    return ɵnavigateList(this.keyManager, event, 'vertical');
  }

  /** @internal Chooses the highlighted suggestion; returns whether there was one. */
  chooseActive(): boolean {
    const option = this.active();
    if (!option || option.disabled()) return false;
    this.choose(option);
    return true;
  }

  /** @internal Chooses a suggestion: the field takes its text, `optionSelected` emits its value. */
  choose(option: CwAutocompleteOption): void {
    if (option.disabled()) return;
    this.chosen?.(option);
    this.optionSelected.emit(option.value() as T);
    this.hide();
  }

  /** @internal Highlights a suggestion under the pointer. */
  highlightOption(option: CwAutocompleteOption): void {
    this.keyManager.setActiveItem(this.keyOptionOf(option));
  }

  private keyOptionOf(option: CwAutocompleteOption): KeyOption {
    let item = this.keyOptions.get(option);
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
}
