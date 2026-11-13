import type { CwAvatarSize } from './avatar.types';

/* Literal class strings (Avatar sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. */
export const SIZES: Record<CwAvatarSize, string> = {
  xs: 'size-5',
  sm: 'size-6',
  default: 'size-8',
  lg: 'size-10',
};

/* The fallback icon and the « Non assigné » icon: `size-3` to `size-5` of the sheet. */
export const ICON_SIZES: Record<CwAvatarSize, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  default: '1rem',
  lg: '1.25rem',
};
