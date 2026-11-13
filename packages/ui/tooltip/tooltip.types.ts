import type { TemplateRef } from '@angular/core';

/** Side of the trigger the tooltip opens on; flipped to the opposite side when it lacks room. */
export type CwTooltipSide = 'top' | 'right' | 'bottom' | 'left';

/** Edge of the bubble aligned with the trigger along its side; shifted to stay on screen. */
export type CwTooltipAlign = 'start' | 'center' | 'end';

/** What the bubble shows: a few words, or a template for a formatted text (no interactive content). */
export type CwTooltipContent = string | TemplateRef<unknown>;

/** Application-wide delays of the tooltips, given to `provideCwTooltip`. */
export interface CwTooltipConfig {
  /** Milliseconds the pointer rests on a trigger before the first bubble opens (700). */
  readonly openDelay?: number;
  /**
   * Milliseconds after a bubble closes during which the next one opens at once and without
   * animation (300): sweeping a toolbar does not wait at every button.
   */
  readonly skipDelay?: number;
}
