/* Types shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix). */

/** Side of the trigger a floating panel opens on. */
export type ɵSide = 'top' | 'right' | 'bottom' | 'left';

/** Alignment of a floating panel along its side. */
export type ɵAlign = 'start' | 'center' | 'end';

/** Where a floating panel actually sits: the side of its trigger and its alignment along it. */
export interface ɵPlacement {
  readonly side: ɵSide;
  readonly align: ɵAlign;
}

/** Which arrow keys move through a list: left and right, up and down, or both. */
export type ɵListOrientation = 'horizontal' | 'vertical' | 'both';
