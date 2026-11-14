import type { CwAvatarSize } from './avatar.types';

/**
 * Constant SIZES
 *
 * @description
 * Literal avatar size classes, discoverable by Tailwind in the compiled package.
 *
 * @type {Record<CwAvatarSize, string>}
 */
export const SIZES: Record<CwAvatarSize, string> = {
  xs: 'size-5',
  sm: 'size-6',
  default: 'size-8',
  lg: 'size-10',
};

/**
 * Constant ICON_SIZES
 *
 * @description
 * Fallback and unassigned icon sizes for each avatar size.
 *
 * @type {Record<CwAvatarSize, string>}
 */
export const ICON_SIZES: Record<CwAvatarSize, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  default: '1rem',
  lg: '1.25rem',
};
