import type { CwTableAlign } from './table.types';

/**
 * Constant ALIGNS
 *
 * @description
 * Literal alignment classes shared by table headers and data cells, kept visible to Tailwind.
 *
 * @type {Record<CwTableAlign, string>}
 */
export const ALIGNS: Record<CwTableAlign, string> = {
  start: 'text-left',
  end: 'text-right tabular-nums',
  center: 'text-center',
};
