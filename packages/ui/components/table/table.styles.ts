import type { CwTableAlign } from './table.types';

/* Literal class strings (Table sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. Shared by the header and the data cell. */
export const ALIGNS: Record<CwTableAlign, string> = {
  start: 'text-left',
  end: 'text-right tabular-nums',
  center: 'text-center',
};
