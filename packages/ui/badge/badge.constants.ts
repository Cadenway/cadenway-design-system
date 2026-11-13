import type { CwBadgeSize, CwBadgeVariant } from './badge.types';

/* Literal class strings (Badge sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. The hover veil applies to a clickable badge (`a`, `button`) only;
   icons are `ng-icon` (size through `--ng-icon__size`) or an inline `svg`. */
export const BADGE_BASE =
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border font-medium transition-colors ' +
  '[&>svg]:pointer-events-none [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 ' +
  '[a&]:hover:bg-linear-to-b [a&]:hover:from-hover [a&]:hover:to-hover ' +
  '[button&]:hover:bg-linear-to-b [button&]:hover:from-hover [button&]:hover:to-hover ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

export const BADGE_VARIANTS: Record<CwBadgeVariant, string> = {
  default: 'text-primary',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive:
    'border-transparent bg-destructive text-destructive-foreground dark:bg-grenat-soft dark:text-grenat-text',
  outline: 'text-foreground',
  ghost: 'border-transparent text-foreground',
  link: 'border-transparent text-foreground underline underline-offset-4',
};

/* `sm` carries no radius in the sheet's preview: its one use, the counter, adds `rounded-full`. */
export const BADGE_SIZES: Record<CwBadgeSize, string> = {
  default: 'rounded-md px-2 py-0.5 text-xs [&>svg]:size-3 [&_ng-icon]:[--ng-icon__size:0.75rem]',
  sm: 'h-[18px] px-1.5 text-[11px] leading-none [&>svg]:size-2.5 [&_ng-icon]:[--ng-icon__size:0.625rem]',
};
