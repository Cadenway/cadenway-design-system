import type { CwFilterBarLabels } from './filter-bar.types';

/**
 * Constant CW_FILTER_BAR_LABELS
 *
 * @description
 * The default French texts of the filter bar: the mockup (`App.dc.html`, active filters: « Filtre »,
 * « Tout effacer », « Enregistrer la vue », « Retirer le filtre Statut », « Aucun filtre · … »)
 * and the Filter Bar sheet (« Ajouter un filtre », « Filtres actifs », « Opérateur : est », saved
 * filters, « Filtre Statut ajouté »). The bar counts no tasks: `total` reads « résultats » unless the
 * app names what it counts. One place for every string, ready for an `@angular/localize` pass.
 *
 * @type {CwFilterBarLabels}
 */
export const CW_FILTER_BAR_LABELS: CwFilterBarLabels = {
  region: 'Filtres actifs',
  addFirst: 'Ajouter un filtre',
  add: 'Filtre',
  fields: 'Champs',
  clear: 'Tout effacer',
  saveView: 'Enregistrer la vue',
  noFilter: 'Aucun filtre',
  total: (total) => `${String(total)} ${total > 1 ? 'résultats' : 'résultat'}`,
  savedFilters: 'Filtres enregistrés',
  savedGroup: 'Mes filtres',
  saveCurrent: 'Enregistrer les filtres actuels…',
  manageSaved: 'Gérer les filtres',
  chip: (field) => `Filtre ${field}`,
  operator: (operator) => `Opérateur : ${operator}`,
  values: (field) => `Valeurs du filtre ${field}`,
  emptyValue: 'Choisir…',
  remove: (field) => `Retirer le filtre ${field}`,
  added: (field) => `Filtre ${field} ajouté`,
  removed: (field) => `Filtre ${field} retiré`,
  cleared: 'Filtres effacés',
};
