import type { CwComboboxLabels } from './combobox.types';

/**
 * Constant CW_COMBOBOX_LABELS
 *
 * @description
 * Default texts from the Combobox sheet of the Design System artifact.
 *
 * @type {CwComboboxLabels}
 */
export const CW_COMBOBOX_LABELS: CwComboboxLabels = {
  placeholder: 'Choisir…',
  searchPlaceholder: 'Rechercher…',
  emptyText: 'Aucun résultat',
  createLabel: (query: string) => `Créer « ${query} »`,
  loadingText: 'Recherche…',
  summary: (count: number) => `${String(count)} sélectionnés`,
  resultsLabel: (count: number) => (count === 1 ? '1 résultat' : `${String(count)} résultats`),
  disabledLabel: 'Désactivé',
};
