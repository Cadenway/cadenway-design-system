import type { CwChartLabels } from './chart.types';

/**
 * Constant CW_CHART_LABELS
 *
 * @description
 * French default texts from the Chart sheet of the Design System artifact; the mockup has no wording for `othersLabel` and `marker`, written in the same style.
 *
 * @type {Required<CwChartLabels>}
 */
export const CW_CHART_LABELS: Required<CwChartLabels> = {
  emptyText: 'Aucune donnée sur la période',
  categoryHeader: 'Catégorie',
  capacityLabel: 'Capacité',
  othersLabel: 'Autres',
  marker: (label: string, category: string): string => `${label} : ${category}`,
};

/**
 * Constant CW_CHART_OTHERS_KEY
 *
 * @description
 * Series key of the « Others » series a chart builds when `series` holds more than `maxSeries` entries: the key `categorySelect` reports its value under.
 *
 * @type {string}
 */
export const CW_CHART_OTHERS_KEY: string = '__others';
