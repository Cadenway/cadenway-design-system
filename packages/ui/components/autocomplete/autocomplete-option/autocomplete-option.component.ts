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
} from '@angular/core';
import { _IdGenerator } from '@angular/cdk/a11y';

import { ɵenterDelay, ɵfold } from '@cadenway/ui/core';

import { MARK, OPTION, OPTION_ENTER } from '../autocomplete.styles';
import { AUTOCOMPLETE_HOST } from '../autocomplete.token';

/** The text node split to set the typed part in bold, and what was inserted after it. */
interface Painted {
  readonly node: Text;
  readonly original: string;
  readonly prefix: string;
  readonly added: readonly Node[];
}

/* Text inside another component (an avatar's hidden name, an icon) or hidden from assistive
   technologies is not the label the user reads: the bold goes on the visible words only. */
function isLabelText(node: Text, root: HTMLElement): boolean {
  for (let parent = node.parentElement; parent && parent !== root; parent = parent.parentElement) {
    if (parent.tagName.includes('-') || parent.getAttribute('aria-hidden') === 'true') return false;
  }
  return true;
}

/* Where the typed text starts in `text`, compared without accents nor case; -1 when absent. The
   comparison is made character by character so that the index stays valid in the original. */
function indexOf(text: string, query: string): number {
  const chars = Array.from(text, (char) => ɵfold(char));
  if (chars.some((char) => char.length !== 1)) return ɵfold(text).indexOf(query);
  return chars.join('').indexOf(query);
}

/**
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
    // The focus stays in the field (aria-activedescendant): a press must not take it.
    '(mousedown)': '$event.preventDefault()',
    '(click)': 'onClick()',
    '(pointermove)': 'onPointerMove()',
  },
  templateUrl: './autocomplete-option.component.html',
})
export class CwAutocompleteOption<T = unknown> {
  /** The value `optionSelected` emits when this suggestion is chosen. */
  readonly value = input.required<T>();
  /** The text written into the field when chosen; the string value or the content's text otherwise. */
  readonly label = input<string>();
  /** Makes the suggestion inert; the arrows skip it. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject(AUTOCOMPLETE_HOST);
  private readonly document = inject(DOCUMENT);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private painted: Painted | null = null;
  private paintedQuery = '';

  /** @internal The id `aria-activedescendant` points at. */
  readonly id = inject(_IdGenerator).getId('cw-autocomplete-option-');
  /** @internal The suggestion element, for the scroll into view. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly highlighted = computed(() => this.host.highlighted() === this);
  protected readonly classes = computed(() =>
    this.host.entering() ? `${OPTION} ${OPTION_ENTER}` : OPTION,
  );
  protected readonly delay = computed(() =>
    ɵenterDelay(this.host.options().indexOf(this as CwAutocompleteOption)),
  );

  constructor() {
    afterRenderEffect({
      write: () => {
        const query = this.host.mark();
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

  /** @internal The text the field takes when this suggestion is chosen. */
  text(): string {
    const label = this.label();
    if (label !== undefined) return label;
    const value = this.value();
    if (typeof value === 'string') return value;
    const root = this.content().nativeElement;
    const walker = this.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let text = '';
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (isLabelText(node as Text, root)) text += (node as Text).data;
    }
    return text.replace(/\s+/g, ' ').trim();
  }

  protected onClick(): void {
    if (!this.disabled()) this.host.choose(this as CwAutocompleteOption);
  }

  protected onPointerMove(): void {
    if (!this.disabled() && !this.highlighted())
      this.host.highlightOption(this as CwAutocompleteOption);
  }

  /* The bold wraps the first match in a `<b>` next to the original text node, which stays in place
     with the text before the match: Angular keeps updating it if the content's binding changes. */
  private paint(query: string): void {
    this.unpaint();
    this.paintedQuery = query;
    const folded = ɵfold(query.trim());
    if (folded === '') return;
    const root = this.content().nativeElement;
    const walker = this.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node as Text;
      if (!isLabelText(text, root)) continue;
      const start = indexOf(text.data, folded);
      if (start < 0) continue;
      const original = text.data;
      const end = start + query.trim().length;
      const mark = this.document.createElement('b');
      mark.className = MARK;
      mark.textContent = original.slice(start, end);
      const rest = this.document.createTextNode(original.slice(end));
      const prefix = original.slice(0, start);
      text.data = prefix;
      text.after(mark, rest);
      this.painted = { node: text, original, prefix, added: [mark, rest] };
      return;
    }
  }

  private unpaint(): void {
    const painted = this.painted;
    if (!painted) return;
    for (const node of painted.added) node.parentNode?.removeChild(node);
    if (painted.node.data === painted.prefix) painted.node.data = painted.original;
    this.painted = null;
  }
}
