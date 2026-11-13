import type { ConnectedPosition } from '@angular/cdk/overlay';

import type { ɵAlign, ɵPlacement, ɵSide } from '../core.types';

const GAP = 4;

function position(side: ɵSide, align: ɵAlign, offset: number): ConnectedPosition {
  const along = { start: 'start', center: 'center', end: 'end' } as const;
  const vertical = { start: 'top', center: 'center', end: 'bottom' } as const;
  switch (side) {
    case 'bottom':
      return {
        originX: along[align],
        originY: 'bottom',
        overlayX: along[align],
        overlayY: 'top',
        offsetY: offset,
      };
    case 'top':
      return {
        originX: along[align],
        originY: 'top',
        overlayX: along[align],
        overlayY: 'bottom',
        offsetY: -offset,
      };
    case 'right':
      return {
        originX: 'end',
        originY: vertical[align],
        overlayX: 'start',
        overlayY: vertical[align],
        offsetX: offset,
      };
    case 'left':
      return {
        originX: 'start',
        originY: vertical[align],
        overlayX: 'end',
        overlayY: vertical[align],
        offsetX: -offset,
      };
  }
}

const OPPOSITE: Record<ɵSide, ɵSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/**
 * The connected positions of a menu, popover or listbox: the requested side first, then the
 * opposite side, then the other alignments of both (integration guide, "Placement des menus": it
 * opens where there is room, shifts sideways to stay visible).
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵpanelPositions(
  side: ɵSide = 'bottom',
  align: ɵAlign = 'start',
  offset: number = GAP,
): ConnectedPosition[] {
  const aligns: ɵAlign[] = [
    align,
    ...(['start', 'end', 'center'] as const).filter((a) => a !== align),
  ];
  return [side, OPPOSITE[side]].flatMap((s) => aligns.map((a) => position(s, a, offset)));
}

/**
 * The `--menu-from` clip inset that reveals a panel from the corner nearest its trigger, for the
 * `animate-menu-in` and `animate-menu-out` keyframes of `@cadenway/tokens` (mockup `menu-from-tl`,
 * `-tr`, `-bl`, `-br`, `-t`). Give it the position the overlay actually took.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵmenuFrom(applied: ConnectedPosition): string {
  const edge = 'calc(100% - 16px)';
  const fromBelow = applied.overlayY === 'top';
  const fromAbove = applied.overlayY === 'bottom';
  if (fromBelow || fromAbove) {
    if (applied.overlayX === 'center') {
      const middle = 'calc(50% - 8px)';
      return fromBelow
        ? `inset(0 ${middle} ${edge} ${middle} round 10px)`
        : `inset(${edge} ${middle} 0 ${middle} round 10px)`;
    }
    const fromEnd = applied.overlayX === 'end';
    if (fromBelow) {
      return fromEnd
        ? `inset(0 0 ${edge} ${edge} round 10px)`
        : `inset(0 ${edge} ${edge} 0 round 10px)`;
    }
    return fromEnd
      ? `inset(${edge} 0 0 ${edge} round 10px)`
      : `inset(${edge} ${edge} 0 0 round 10px)`;
  }
  // Side panels (submenus) open from their top corner next to the trigger.
  return applied.overlayX === 'start'
    ? `inset(0 ${edge} ${edge} 0 round 10px)`
    : `inset(0 0 ${edge} ${edge} round 10px)`;
}

/**
 * The side and alignment of a connected position, as an arrow and the `data-side` / `data-align`
 * hooks need them: give it the position the overlay actually took (`positionChanges`), which may be
 * a fallback of `ɵpanelPositions`.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵplacementOf(position: ConnectedPosition): ɵPlacement {
  if (position.originY === 'bottom' && position.overlayY === 'top') {
    return { side: 'bottom', align: position.overlayX };
  }
  if (position.originY === 'top' && position.overlayY === 'bottom') {
    return { side: 'top', align: position.overlayX };
  }
  const along = { top: 'start', center: 'center', bottom: 'end' } as const;
  return {
    side: position.overlayX === 'start' ? 'right' : 'left',
    align: along[position.overlayY],
  };
}
