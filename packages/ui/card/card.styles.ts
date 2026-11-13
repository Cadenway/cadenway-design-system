import type { CwCardSize } from './card.types';

// The parts carry the horizontal padding of a `default` card; a `sm` card pads itself (`p-3`).
// Shared by the header, the content and the footer; not part of the public API.
export const PART_PADDING: Record<CwCardSize, string> = { default: 'px-4', sm: '' };
