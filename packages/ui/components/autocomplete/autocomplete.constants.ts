import type { CwAutocompleteLabels } from './autocomplete.types';

/**
 * Constant CW_AUTOCOMPLETE_LABELS
 *
 * @description
 * Default texts from the Autocomplete sheet of the Design System artifact.
 *
 * @type {CwAutocompleteLabels}
 */
export const CW_AUTOCOMPLETE_LABELS: CwAutocompleteLabels = {
  loading: 'Recherche…',
  empty: (query) => `Aucune suggestion : Entrée garde « ${query} ».`,
  aria: 'Suggestions',
  results: (count) => (count === 1 ? '1 suggestion' : `${String(count)} suggestions`),
};
