import type { TemplateRef } from '@angular/core';

/**
 * Type CwTooltipSide
 *
 * @description
 * Side of the trigger the tooltip opens on; flipped to the opposite side when it lacks room.
 *
 * @type {'top' | 'right' | 'bottom' | 'left'}
 */
export type CwTooltipSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Type CwTooltipAlign
 *
 * @description
 * Edge of the bubble aligned with the trigger along its side; shifted to stay on screen.
 *
 * @type {'start' | 'center' | 'end'}
 */
export type CwTooltipAlign = 'start' | 'center' | 'end';

/**
 * Type CwTooltipContent
 *
 * @description
 * What the bubble shows: a few words, or a template for a formatted text (no interactive content).
 *
 * @type {string | TemplateRef<unknown>}
 */
export type CwTooltipContent = string | TemplateRef<unknown>;

/**
 * Interface CwTooltipConfig
 *
 * @description
 * Application-wide tooltip delays supplied to provideCwTooltip.
 */
export interface CwTooltipConfig {
  // #region Properties
  /**
   * Property openDelay
   * @readonly
   *
   * @description
   * Milliseconds before the first bubble opens on hover.
   *
   * @type {number | undefined}
   * @default 700
   */
  readonly openDelay?: number;

  /**
   * Property skipDelay
   * @readonly
   *
   * @description
   * Milliseconds after a bubble closes during which the next one opens at once and without
   * animation (300): sweeping a toolbar does not wait at every button.
   *
   * @type {number | undefined}
   * @default 300
   */
  readonly skipDelay?: number;
  // #endregion
}
