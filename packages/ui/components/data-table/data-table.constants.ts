import type { CwDataTableTexts, CwSortDirection } from './data-table.types';

/**
 * Constant CW_DATA_TABLE_TEXTS
 *
 * @description
 * The French texts of `cw-data-table`, word for word from the DataTable sheets and the mockup (`App.dc.html`, `Organisation.dc.html`). One place, so a later `@angular/localize` extraction is mechanical; the `texts` input overrides any of them (« membres » instead of « tâches »).
 *
 * @type {CwDataTableTexts}
 */
export const CW_DATA_TABLE_TEXTS: CwDataTableTexts = {
  selectAll: 'Tout sélectionner sur la page',
  selectRow: (label) => `Sélectionner ${label}`,
  selected: (count) =>
    count === 1 ? '1 tâche sélectionnée' : `${String(count)} tâches sélectionnées`,
  selectAllMatching: (total) => `Sélectionner les ${String(total)} tâches`,
  allSelected: (total) => `Les ${String(total)} tâches sont sélectionnées`,
  clearSelection: 'Annuler la sélection',
  sortState: (dir, rank) =>
    `, ${rank === 1 ? 'tri principal' : rank === 2 ? 'tri secondaire' : `tri ${String(rank)}`} ${
      dir === 'asc' ? 'croissant' : 'décroissant'
    }`,
  sorted: (criteria) =>
    criteria.length === 0
      ? 'Tri retiré'
      : `Trié par ${criteria
          .map(
            ({ header, dir }: { header: string; dir: CwSortDirection }) =>
              `${header}, ${dir === 'asc' ? 'croissant' : 'décroissant'}`,
          )
          .join(', puis par ')}`,
  groupToggled: (label, collapsed) => `Groupe ${label} ${collapsed ? 'replié' : 'déplié'}`,
  groupAdd: (label) => `Ajouter une tâche dans ${label}`,
  columnWidth: (header) => `Largeur de la colonne ${header}`,
  columnResized: (header, width) => `Colonne ${header} : ${String(width)} pixels`,
  columnMoved: (header, position) => `Colonne ${header} en position ${String(position)}`,
  loading: 'Chargement',
  retry: 'Réessayer',
  bulkBar: 'Actions sur la sélection',
  deselect: 'Désélectionner',
  pagination: 'Pagination',
  range: (first, last, total) =>
    total === 0 ? '0 tâche' : `${String(first)}–${String(last)} sur ${String(total)} tâches`,
};

/**
 * Constant CW_DATA_TABLE_PAGE_SIZES
 *
 * @description
 * « Lignes par page » choices of the DataTableComplete sheet.
 *
 * @type {readonly number[]}
 */
export const CW_DATA_TABLE_PAGE_SIZES: readonly number[] = [25, 50, 100];
