import {
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  inject,
  input,
  numberAttribute,
  type InputSignal,
  type InputSignalWithTransform,
} from '@angular/core';

import type { CwAutocompleteOption } from '../autocomplete-option/autocomplete-option.component';
import type { CwAutocomplete } from '../autocomplete.component';

/**
 * Interface Search
 *
 * @description
 * Search range and query in the input field.
 */
interface Search {
  // #region Properties
  /**
   * Property start
   * @readonly
   *
   * @description
   * Start offset of the search.
   *
   * @type {number}
   */
  readonly start: number;

  /**
   * Property end
   * @readonly
   *
   * @description
   * End offset of the search.
   *
   * @type {number}
   */
  readonly end: number;

  /**
   * Property text
   * @readonly
   *
   * @description
   * Text of the query.
   *
   * @type {string}
   */
  readonly text: string;
  // #endregion
}

/**
 * Directive CwAutocompleteTrigger
 *
 * @description
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
  // #region Properties
  /**
   * Property cwAutocomplete
   * @readonly
   *
   * @description
   * Suggestion panel opened by the field.
   *
   * @type {InputSignal<CwAutocomplete>}
   */
  public readonly cwAutocomplete: InputSignal<CwAutocomplete> = input.required<CwAutocomplete>();

  /**
   * Property trigger
   * @readonly
   *
   * @description
   * Optional character opening a word search.
   *
   * @type {InputSignal<string | undefined>}
   */
  public readonly trigger: InputSignal<string | undefined> = input<string>();

  /**
   * Property minLength
   * @readonly
   *
   * @description
   * Minimum query length without a trigger character.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly minLength: InputSignalWithTransform<number, unknown> = input(1, {
    transform: numberAttribute,
  });

  /**
   * Property field
   * @readonly
   *
   * @description
   * Input element containing the query.
   *
   * @type {HTMLInputElement}
   */
  private readonly field: HTMLInputElement =
    inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  /**
   * Property nativeAutocomplete
   * @readonly
   *
   * @description
   * Native autocomplete attribute retained on the input.
   *
   * @type {string}
   */
  protected readonly nativeAutocomplete: string =
    inject(new HostAttributeToken('autocomplete'), { optional: true }) ?? 'off';

  /**
   * Property current
   *
   * @description
   * Current query range.
   *
   * @type {Search | null}
   */
  private current: Search | null = null;

  /**
   * Property writing
   *
   * @description
   * Whether the directive is writing a selected value.
   *
   * @type {boolean}
   */
  private writing: boolean = false;

  /**
   * Property panel
   * @readonly
   *
   * @description
   * Suggestion panel bound to the input.
   *
   * @type {InputSignal<CwAutocomplete>}
   */
  protected readonly panel: InputSignal<CwAutocomplete> = this.cwAutocomplete;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Closes the panel when the trigger is destroyed.
   */
  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.panel().hide();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method onInput
   *
   * @description
   * Updates the query and opens or closes the panel.
   */
  protected onInput(): void {
    // The `input` event this directive dispatches after a choice is for the forms, not a search.
    if (this.writing) return;
    const search: Search | null = this.readSearch();
    this.current = search;
    const panel: CwAutocomplete = this.panel();
    if (!search) {
      panel.hide();
      return;
    }
    panel.search(search.text);
    panel.show(this.field, (option) => {
      this.write(option);
    });
  }

  /**
   * Method onKeydown
   *
   * @description
   * Handles navigation, selection and dismissal keys.
   *
   * @param {KeyboardEvent} event - Keyboard event received by the input.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const panel: CwAutocomplete = this.panel();
    if (!panel.isOpen()) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const search: Search | null = this.readSearch();
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

  /**
   * Method readSearch
   *
   * @description
   * Reads the query and its range from the input.
   *
   * @returns {Search | null} Current query range and text, or null when the panel should remain closed.
   */
  private readSearch(): Search | null {
    const value: string = this.field.value;
    const trigger: string | undefined = this.trigger();
    if (!trigger) {
      return value.length >= this.minLength() ? { start: 0, end: value.length, text: value } : null;
    }
    const caret: number = this.field.selectionStart ?? value.length;
    const before: string = value.slice(0, caret);
    const index: number = before.lastIndexOf(trigger);
    if (index < 0) return null;
    const atWordStart: boolean = index === 0 || /\s/.test(before.charAt(index - 1));
    const text: string = before.slice(index + trigger.length);
    if (!atWordStart || /\s/.test(text)) return null;
    return { start: index, end: caret, text };
  }

  /**
   * Method write
   *
   * @description
   * Writes a selected suggestion into the input.
   *
   * @param {CwAutocompleteOption} option - Selected suggestion whose text is written to the field.
   */
  private write(option: CwAutocompleteOption): void {
    const text: string = option.text();
    const value: string = this.field.value;
    const trigger: string | undefined = this.trigger();
    const search: Search | null = this.current;
    let next: string;
    let caret: number;
    if (trigger && search) {
      const inserted: string = `${trigger}${text} `;
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
  // #endregion
}
