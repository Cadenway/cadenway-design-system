import {
  afterEveryRender,
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  untracked,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { ɵenterDelay, ɵfold } from '@cadenway/ui/core';

import { MARK, OPTION, OPTION_ENTER } from '../autocomplete.styles';
import { AUTOCOMPLETE_HOST, type AutocompleteHost } from '../autocomplete.token';

/**
 * Interface Painted
 *
 * @description
 * Original text node and nodes inserted for query highlighting.
 */
interface Painted {
  // #region Properties
  /**
   * Property node
   * @readonly
   *
   * @description
   * Original text node.
   *
   * @type {Text}
   */
  readonly node: Text;

  /**
   * Property original
   * @readonly
   *
   * @description
   * Text before highlighting.
   *
   * @type {string}
   */
  readonly original: string;

  /**
   * Property prefix
   * @readonly
   *
   * @description
   * Text preceding the highlighted match.
   *
   * @type {string}
   */
  readonly prefix: string;

  /**
   * Property added
   * @readonly
   *
   * @description
   * Nodes inserted for the highlighted match.
   *
   * @type {readonly Node[]}
   */
  readonly added: readonly Node[];
  // #endregion
}

/* Text inside another component (an avatar's hidden name, an icon) or hidden from assistive
   technologies is not the label the user reads: the bold goes on the visible words only. */
/**
 * Function isLabelText
 *
 * @description
 * Reports whether a text node belongs to the visible label.
 *
 * @param {Text} node - Text node to inspect.
 * @param {HTMLElement} root - Suggestion content root delimiting the search.
 *
 * @returns {boolean} Whether the node belongs to visible label text.
 */
function isLabelText(node: Text, root: HTMLElement): boolean {
  for (
    let parent: HTMLElement | null = node.parentElement;
    parent && parent !== root;
    parent = parent.parentElement
  ) {
    if (parent.tagName.includes('-') || parent.getAttribute('aria-hidden') === 'true') return false;
  }
  return true;
}

/* Where the typed text starts in `text`, compared without accents nor case; -1 when absent. The
   comparison is made character by character so that the index stays valid in the original. */
/**
 * Function indexOf
 *
 * @description
 * Finds a query without case or accent differences.
 *
 * @param {string} text - Original text in which to search.
 * @param {string} query - Normalized query to find.
 *
 * @returns {number} Index of the matching text, or minus one when absent.
 */
function indexOf(text: string, query: string): number {
  const chars: string[] = Array.from(text, (char) => ɵfold(char));
  if (chars.some((char) => char.length !== 1)) return ɵfold(text).indexOf(query);
  return chars.join('').indexOf(query);
}

/**
 * Component CwAutocompleteOption
 *
 * @description
 * A suggestion of a `cw-autocomplete`: a glyph or an avatar, the label with the typed part in bold,
 * a meta on the right (an id, a team) (Autocomplete sheet of the Design System artifact).
 *
 * `value` is what `optionSelected` emits. Choosing the suggestion writes `label` into the field
 * (or, after a `trigger` character, in place of the typed mention); without `label`, the value
 * when it is a string, else the visible text of the content (the hidden name of an avatar left
 * out): give `label` when the content also holds a meta. Push a meta to the right with `ml-auto`
 * on its element. `disabled` dims it, sets `aria-disabled`, and the arrows skip it. The bold does not
 * change the text read by assistive technologies. Only valid inside `cw-autocomplete` or
 * `cw-autocomplete-group`.
 */
@Component({
  selector: 'cw-autocomplete-option',
  host: {
    role: 'option',
    '[id]': 'id',
    '[class]': 'classes()',
    '[style.animation-delay.ms]': 'delay()',
    '[attr.aria-selected]': 'highlighted()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-highlighted]': 'highlighted() ? "" : null',
    '(mousedown)': '$event.preventDefault()',
    '(click)': 'onClick()',
    '(pointermove)': 'onPointerMove()',
  },
  templateUrl: './autocomplete-option.component.html',
})
export class CwAutocompleteOption<T = unknown> {
  // #region Properties
  /**
   * Property value
   * @readonly
   *
   * @description
   * Value emitted when this suggestion is chosen.
   *
   * @type {InputSignal<T>}
   */
  public readonly value: InputSignal<T> = input.required<T>();

  /**
   * Property label
   * @readonly
   *
   * @description
   * Optional text written to the field.
   *
   * @type {InputSignal<string | undefined>}
   */
  public readonly label: InputSignal<string | undefined> = input<string>();

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the suggestion is disabled.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property host
   * @readonly
   *
   * @description
   * Parent suggestion panel context.
   *
   * @type {AutocompleteHost}
   */
  private readonly host: AutocompleteHost = inject(AUTOCOMPLETE_HOST);

  /**
   * Property document
   * @readonly
   *
   * @description
   * Document used to create highlighting nodes.
   *
   * @type {Document}
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property content
   * @readonly
   *
   * @description
   * Rendered suggestion content.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   */
  private readonly content: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('content');

  /**
   * Property painted
   *
   * @description
   * Current query highlighting state.
   *
   * @type {Painted | null}
   */
  private painted: Painted | null = null;

  /**
   * Property paintedQuery
   *
   * @description
   * Query used for the current highlight.
   *
   * @type {string}
   */
  private paintedQuery: string = '';

  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier used by aria-activedescendant.
   *
   * @internal
   *
   * @type {string}
   */
  public readonly id: string = inject(_IdGenerator).getId('cw-autocomplete-option-');

  /**
   * Property element
   * @readonly
   *
   * @description
   * Suggestion element used for scrolling.
   *
   * @internal
   *
   * @type {HTMLElement}
   */
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /**
   * Property highlighted
   * @readonly
   *
   * @description
   * Whether this suggestion is highlighted.
   *
   * @type {Signal<boolean>}
   */
  protected readonly highlighted: Signal<boolean> = computed(
    () => this.host.highlighted() === this,
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Suggestion classes and optional entrance animation.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    this.host.entering() ? `${OPTION} ${OPTION_ENTER}` : OPTION,
  );

  /**
   * Property delay
   * @readonly
   *
   * @description
   * Entrance animation delay in milliseconds.
   *
   * @type {Signal<number>}
   */
  protected readonly delay: Signal<number> = computed(() =>
    ɵenterDelay(this.host.options().indexOf(this as CwAutocompleteOption)),
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Synchronizes query highlighting with rendered content.
   */
  public constructor() {
    afterRenderEffect({
      write: () => {
        const query: string = this.host.mark();
        untracked(() => {
          this.paint(query);
        });
      },
    });
    // A binding of the content rewrote the painted text node: paint the new text again.
    afterEveryRender({
      write: () => {
        if (this.painted && this.painted.node.data !== this.painted.prefix) {
          this.paint(this.paintedQuery);
        }
      },
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method text
   *
   * @description
   * Returns the text written to the input when selected.
   *
   * @internal
   *
   * @returns {string} Explicit label, string value or visible content text used by the input.
   */
  public text(): string {
    const label: string | undefined = this.label();
    if (label !== undefined) return label;
    const value: T = this.value();
    if (typeof value === 'string') return value;
    const root: HTMLElement = this.content().nativeElement;
    const walker: TreeWalker = this.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let text: string = '';
    for (let node: Node | null = walker.nextNode(); node; node = walker.nextNode()) {
      if (isLabelText(node as Text, root)) text += (node as Text).data;
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Method onClick
   *
   * @description
   * Chooses the suggestion when enabled.
   */
  protected onClick(): void {
    if (!this.disabled()) this.host.choose(this as CwAutocompleteOption);
  }

  /**
   * Method onPointerMove
   *
   * @description
   * Highlights the suggestion when enabled.
   */
  protected onPointerMove(): void {
    if (!this.disabled() && !this.highlighted())
      this.host.highlightOption(this as CwAutocompleteOption);
  }

  /**
   * Method paint
   *
   * @description
   * Highlights the first matching query in the visible label.
   *
   * @param {string} query - Text to highlight in the visible suggestion label.
   */
  private paint(query: string): void {
    this.unpaint();
    this.paintedQuery = query;
    const folded: string = ɵfold(query.trim());
    if (folded === '') return;
    const root: HTMLElement = this.content().nativeElement;
    const walker: TreeWalker = this.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node: Node | null = walker.nextNode(); node; node = walker.nextNode()) {
      const text: Text = node as Text;
      if (!isLabelText(text, root)) continue;
      const start: number = indexOf(text.data, folded);
      if (start < 0) continue;
      const original: string = text.data;
      const end: number = start + query.trim().length;
      const mark: HTMLElement = this.document.createElement('b');
      mark.className = MARK;
      mark.textContent = original.slice(start, end);
      const rest: Text = this.document.createTextNode(original.slice(end));
      const prefix: string = original.slice(0, start);
      text.data = prefix;
      text.after(mark, rest);
      this.painted = { node: text, original, prefix, added: [mark, rest] };
      return;
    }
  }

  /**
   * Method unpaint
   *
   * @description
   * Removes the current query highlight.
   */
  private unpaint(): void {
    const painted: Painted | null = this.painted;
    if (!painted) return;
    for (const node of painted.added) node.parentNode?.removeChild(node);
    if (painted.node.data === painted.prefix) painted.node.data = painted.original;
    this.painted = null;
  }
  // #endregion
}
