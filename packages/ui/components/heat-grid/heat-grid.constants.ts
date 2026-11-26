import type { CwHeatGridCellLabelContext, CwHeatGridLabels } from './heat-grid.types';

/**
 * Constant CW_HEAT_GRID_LABELS
 *
 * @description
 * The French texts of `cw-heat-grid`, word for word from the mockup (`App.dc.html`, workload view), in one place so that a later `@angular/localize` extraction is mechanical. `totalHeader` is « Total » without the mockup's capacity (« Total · 60 h »), which the consumer adds.
 *
 * @type {CwHeatGridLabels}
 */
export const CW_HEAT_GRID_LABELS: CwHeatGridLabels = {
  rowHeader: 'Personne',
  totalHeader: 'Total',
  available: 'Disponible',
  high: 'Charge élevée',
  over: 'Surchargé',
  placeholderNote: 'À répartir',
  emptyCell: 'Aucune tâche ce jour-là.',
  emptyText: 'Aucune tâche ne correspond à la recherche ou aux filtres.',
  loading: 'Chargement de la charge de travail',
  more: (hidden: number): string => `+${String(hidden)}`,
  moreLabel: (count: number): string => `Voir les ${String(count)} tâches`,
  cell: ({ row, column, value, capacity, level, count }: CwHeatGridCellLabelContext): string => {
    if (count === 0 && level === 'none') return `${row}, ${column} : aucune tâche`;
    const load: string = capacity === null ? value : `${value} sur ${capacity}`;
    const zone: string =
      level === 'over' ? ', surcharge' : level === 'high' ? ', charge élevée' : '';
    return `${row}, ${column} : ${load}${zone}, ${String(count)} ${count > 1 ? 'tâches' : 'tâche'}`;
  },
  popoverTitle: (row: string, column: string): string => `${row} · ${column}`,
  popoverSum: (value: string, capacity: string | null): string =>
    capacity === null ? value : `${value} sur ${capacity}`,
  meter: (row: string, total: string, capacity: string): string =>
    `Charge de ${row} : ${total} sur ${capacity}`,
};

/**
 * Constant CW_HEAT_GRID_HIGH
 *
 * @description
 * Default share of the capacity above which a load is high: 85 % (mockup `App.dc.html`, workload legend « Plus de 85 % »).
 *
 * @type {number}
 */
export const CW_HEAT_GRID_HIGH: number = 0.85;
