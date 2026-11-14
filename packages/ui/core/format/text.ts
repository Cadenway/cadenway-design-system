/**
 * Function ɵfold
 *
 * @description
 * A text without accents nor case, to match a search or a typeahead against labels (Combobox sheet:
 * « sans accents ni casse »): « Élevée » and « elevee » fold to the same text.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {string} text - Text to normalize for case- and accent-insensitive matching.
 *
 * @returns {string} Lower-case text with combining diacritics removed.
 */
export function ɵfold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
