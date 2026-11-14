import type { CwCardSize } from './card.types';

/**
 * Constant PART_PADDING
 *
 * @description
 * Horizontal padding for header, content and footer: standard cards pad their parts, while small
 * cards apply their own padding. This map is internal to the card entry point.
 *
 * @type {Record<CwCardSize, string>}
 */
export const PART_PADDING: Record<CwCardSize, string> = { default: 'px-4', sm: '' };
