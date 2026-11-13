/**
 * A text without accents nor case, to match a search or a typeahead against labels (Combobox sheet:
 * « sans accents ni casse »): « Élevée » and « elevee » fold to the same text.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵfold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
