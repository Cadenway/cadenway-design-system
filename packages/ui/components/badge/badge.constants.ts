import type { CwBadgeSize, CwBadgeVariant } from './badge.types';

/**
 * Constant BADGE_BASE
 *
 * @description
 * Literal shared classes from the Badge sheet, so Tailwind finds them in the package. The hover
 * veil applies only to links and buttons; icons use `ng-icon` or an inline SVG.
 *
 * @type {string}
 */
export const BADGE_BASE: string =
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border font-medium transition-colors ' +
  '[&>svg]:pointer-events-none [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 ' +
  '[a&]:hover:bg-linear-to-b [a&]:hover:from-hover [a&]:hover:to-hover ' +
  '[button&]:hover:bg-linear-to-b [button&]:hover:from-hover [button&]:hover:to-hover ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

/**
 * Constant BADGE_VARIANTS
 *
 * @description
 * Literal classes for each supported badge appearance.
 *
 * @type {Record<CwBadgeVariant, string>}
 */
export const BADGE_VARIANTS: Record<CwBadgeVariant, string> = {
  default: 'text-primary',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive:
    'border-transparent bg-destructive text-destructive-foreground dark:bg-grenat-soft dark:text-grenat-text',
  outline: 'text-foreground',
  ghost: 'border-transparent text-foreground',
  link: 'border-transparent text-foreground underline underline-offset-4',
};

/**
 * Constant BADGE_SIZES
 *
 * @description
 * Literal classes for badge dimensions and icon sizes. The `sm` counter supplies its own radius,
 * as in the Badge sheet preview.
 *
 * @type {Record<CwBadgeSize, string>}
 */
export const BADGE_SIZES: Record<CwBadgeSize, string> = {
  default: 'rounded-md px-2 py-0.5 text-xs [&>svg]:size-3 [&_ng-icon]:[--ng-icon__size:0.75rem]',
  sm: 'h-[18px] px-1.5 text-[11px] leading-none [&>svg]:size-2.5 [&_ng-icon]:[--ng-icon__size:0.625rem]',
};
