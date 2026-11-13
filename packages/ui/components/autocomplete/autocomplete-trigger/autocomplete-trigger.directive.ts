import {
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

import type { CwAutocompleteOption } from '../autocomplete-option/autocomplete-option.component';
import type { CwAutocomplete } from '../autocomplete.component';

/** The search the field holds: where it starts in the text, where it ends, and its text. */
interface Search {
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

/**
 * Turns a text field into the trigger of a `cw-autocomplete` panel: the field keeps its free text,
 * the panel suggests while the user types (Autocomplete sheet of the Design System artifact).
 *
 * Put it on a native `<input>`, usually with `cwInput` for its look: `[cwAutocomplete]` names the
 * panel. The field carries `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`,
 * `aria-controls` and `aria-activedescendant`; the focus never leaves it. The panel opens once
 * `minLength` characters are typed (never on focus alone); with `trigger` (`'@'` for mentions)
 * it opens as soon as the character is typed at the start of a word, and the search is what
 * follows it up to the caret.
 *
 * Keyboard: ↓ ↑ highlight a suggestion; Enter or Tab choose the highlighted one, and without one
 * Enter keeps the text; Escape closes and keeps the text. Choosing writes the suggestion's text
 * into the field (in place of the mention after `trigger`, followed by a space) and dispatches an
 * `input` event, so the native value accessor of the field (`formControlName`, `[formControl]`,
 * `ngModel`, Signal Forms `[formField]`) takes the new text; not choosing leaves the text as typed.
 */
@Directive({
  selector: 'input[cwAutocomplete]',
  exportAs: 'cwAutocompleteTrigger',
  host: {
    role: 'combobox',
    'aria-autocomplete': 'list',
    '[attr.autocomplete]': 'nativeAutocomplete',
    '[attr.aria-expanded]': 'panel().isOpen()',
    '[attr.aria-controls]': 'panel().isOpen() ? panel().listboxId : null',
    '[attr.aria-activedescendant]': 'panel().isOpen() ? panel().activeId() : null',
    '(input)': 'onInput()',
    '(keydown)': 'onKeydown($event)',
    '(blur)': 'panel().hide()',
  },
})
export class CwAutocompleteTrigger {
  /** The panel of suggestions this field opens. */
  readonly cwAutocomplete = input.required<CwAutocomplete>();
  /** The character that opens the panel at the start of a word (`'@'` for mentions). */
  readonly trigger = input<string>();
  /** The number of characters to type before the panel opens, without `trigger`. */
  readonly minLength = input(1, { transform: numberAttribute });

  private readonly field = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  // The browser's own suggestions would cover the panel; a declared `autocomplete` is kept.
  protected readonly nativeAutocomplete =
    inject(new HostAttributeToken('autocomplete'), { optional: true }) ?? 'off';
  private current: Search | null = null;
  private writing = false;

  protected readonly panel = this.cwAutocomplete;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.panel().hide();
    });
  }

  protected onInput(): void {
    // The `input` event this directive dispatches after a choice is for the forms, not a search.
    if (this.writing) return;
    const search = this.readSearch();
    this.current = search;
    const panel = this.panel();
    if (!search) {
      panel.hide();
      return;
    }
    panel.search(search.text);
    panel.show(this.field, (option) => {
      this.write(option);
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const panel = this.panel();
    if (!panel.isOpen()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const search = this.readSearch();
        if (!search) return;
        event.preventDefault();
        this.current = search;
        panel.search(search.text);
        panel.show(this.field, (option) => {
          this.write(option);
        });
      }
      return;
    }
    switch (event.key) {
      case 'Enter':
        // Without a highlighted suggestion, Enter keeps the text and does what it does natively.
        if (panel.chooseActive()) event.preventDefault();
        return;
      case 'Tab':
        panel.chooseActive();
        panel.hide();
        return;
      case 'Escape':
        event.preventDefault();
        // The Escape closed this panel: it must not also close the dialog around the field.
        event.stopPropagation();
        panel.hide();
        return;
      default:
        if (panel.navigate(event)) event.preventDefault();
    }
  }

  /* The search: the whole text without `trigger`; with it, the word that starts with the trigger
     character and ends at the caret. Null when the panel should stay closed. */
  private readSearch(): Search | null {
    const value = this.field.value;
    const trigger = this.trigger();
    if (!trigger) {
      return value.length >= this.minLength() ? { start: 0, end: value.length, text: value } : null;
    }
    const caret = this.field.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const index = before.lastIndexOf(trigger);
    if (index < 0) return null;
    const atWordStart = index === 0 || /\s/.test(before.charAt(index - 1));
    const text = before.slice(index + trigger.length);
    if (!atWordStart || /\s/.test(text)) return null;
    return { start: index, end: caret, text };
  }

  private write(option: CwAutocompleteOption): void {
    const text = option.text();
    const value = this.field.value;
    const trigger = this.trigger();
    const search = this.current;
    let next: string;
    let caret: number;
    if (trigger && search) {
      const inserted = `${trigger}${text} `;
      next = value.slice(0, search.start) + inserted + value.slice(search.end);
      caret = search.start + inserted.length;
    } else {
      next = text;
      caret = text.length;
    }
    this.field.value = next;
    this.field.setSelectionRange(caret, caret);
    this.writing = true;
    try {
      this.field.dispatchEvent(new Event('input', { bubbles: true }));
    } finally {
      this.writing = false;
    }
    this.current = null;
  }
}
