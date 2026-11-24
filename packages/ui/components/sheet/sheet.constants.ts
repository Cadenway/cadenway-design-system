import type { CwSheetLabels } from './sheet.types';

/**
 * Constant CW_SHEET_LABELS
 *
 * @description
 * The default texts of a sheet, word for word from the Sheet sheet of the Design System artifact.
 * `provideCwSheetLabels` replaces them for every sheet below its injector; the `closeLabel` input
 * still overrides one sheet.
 *
 * @type {CwSheetLabels}
 */
export const CW_SHEET_LABELS: CwSheetLabels = {
  close: 'Fermer',
};
