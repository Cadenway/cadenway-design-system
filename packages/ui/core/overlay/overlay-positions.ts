import type { ConnectedPosition } from '@angular/cdk/overlay';

import type { ɵAlign, ɵPlacement, ɵSide } from '../core.types';

/**
 * Constant GAP
 *
 * @description
 * Default distance in pixels between a floating panel and its trigger.
 *
 * @type {number}
 */
const GAP: number = 4;

/**
 * Function position
 *
 * @description
 * Builds a CDK connected position for one trigger side and alignment.
 *
 * @param {ɵSide} side - Trigger side on which the panel opens.
 * @param {ɵAlign} align - Alignment along that side.
 * @param {number} offset - Gap between panel and trigger in pixels.
 *
 * @returns {ConnectedPosition} Origin and overlay anchors with the appropriate offset.
 */
function position(side: ɵSide, align: ɵAlign, offset: number): ConnectedPosition {
  const along: Record<ɵAlign, 'start' | 'center' | 'end'> = {
    start: 'start',
    center: 'center',
    end: 'end',
  };
  const vertical: Record<ɵAlign, 'top' | 'center' | 'bottom'> = {
    start: 'top',
    center: 'center',
    end: 'bottom',
  };
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

/**
 * Constant OPPOSITE
 *
 * @description
 * Maps each trigger side to its fallback side when a panel cannot fit.
 *
 * @type {Record<ɵSide, ɵSide>}
 */
const OPPOSITE: Record<ɵSide, ɵSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/**
 * Function ɵpanelPositions
 *
 * @description
 * The connected positions of a menu, popover or listbox: the requested side first, then the
 * opposite side, then the other alignments of both (integration guide, "Placement des menus": it
 * opens where there is room, shifts sideways to stay visible).
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {ɵSide} side - Preferred trigger side; defaults to bottom.
 * @param {ɵAlign} align - Preferred alignment; defaults to start.
 * @param {number} offset - Gap in pixels between trigger and panel; defaults to four.
 *
 * @returns {ConnectedPosition[]} Preferred and fallback positions in priority order.
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
 * Function ɵmenuFrom
 *
 * @description
 * The `--menu-from` clip inset that reveals a panel from the corner nearest its trigger, for the
 * `animate-menu-in` and `animate-menu-out` keyframes of `@cadenway/tokens` (mockup `menu-from-tl`,
 * `-tr`, `-bl`, `-br`, `-t`). Give it the position the overlay actually took.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {ConnectedPosition} applied - Position selected by the overlay.
 *
 * @returns {string} CSS clip-path inset for the panel's animation origin.
 */
export function ɵmenuFrom(applied: ConnectedPosition): string {
  const edge: string = 'calc(100% - 16px)';
  const fromBelow: boolean = applied.overlayY === 'top';
  const fromAbove: boolean = applied.overlayY === 'bottom';
  if (fromBelow || fromAbove) {
    if (applied.overlayX === 'center') {
      const middle: string = 'calc(50% - 8px)';
      return fromBelow
        ? `inset(0 ${middle} ${edge} ${middle} round 10px)`
        : `inset(${edge} ${middle} 0 ${middle} round 10px)`;
    }
    const fromEnd: boolean = applied.overlayX === 'end';
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
 * Function ɵplacementOf
 *
 * @description
 * The side and alignment of a connected position, as an arrow and the `data-side` / `data-align`
 * hooks need them: give it the position the overlay actually took (`positionChanges`), which may be
 * a fallback of `ɵpanelPositions`.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {ConnectedPosition} position - Position selected by the overlay.
 *
 * @returns {ɵPlacement} Trigger side and panel alignment represented by the position.
 */
export function ɵplacementOf(position: ConnectedPosition): ɵPlacement {
  if (position.originY === 'bottom' && position.overlayY === 'top') {
    return { side: 'bottom', align: position.overlayX };
  }
  if (position.originY === 'top' && position.overlayY === 'bottom') {
    return { side: 'top', align: position.overlayX };
  }
  const along: Record<'top' | 'center' | 'bottom', ɵAlign> = {
    top: 'start',
    center: 'center',
    bottom: 'end',
  };
  return {
    side: position.overlayX === 'start' ? 'right' : 'left',
    align: along[position.overlayY],
  };
}
