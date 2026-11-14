/* Types shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix). */

/**
 * Type ɵSide
 *
 * @description
 * Side of the trigger on which a floating panel opens.
 *
 * @type {'top' | 'right' | 'bottom' | 'left'}
 */
export type ɵSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Type ɵAlign
 *
 * @description
 * Alignment of a floating panel along its chosen side of the trigger.
 *
 * @type {'start' | 'center' | 'end'}
 */
export type ɵAlign = 'start' | 'center' | 'end';

/**
 * Interface ɵPlacement
 * @interface ɵPlacement
 *
 * @description
 * Actual placement of a floating panel relative to its trigger.
 */
export interface ɵPlacement {
  // #region Properties
  /**
   * Property side
   * @readonly
   *
   * @description
   * Trigger side on which the panel is positioned.
   *
   * @type {ɵSide}
   */
  readonly side: ɵSide;

  /**
   * Property align
   * @readonly
   *
   * @description
   * Alignment of the panel along the chosen side.
   *
   * @type {ɵAlign}
   */
  readonly align: ɵAlign;
  // #endregion
}

/**
 * Type ɵListOrientation
 *
 * @description
 * Arrow-key directions accepted when navigating a list: horizontal, vertical, or both.
 *
 * @type {'horizontal' | 'vertical' | 'both'}
 */
export type ɵListOrientation = 'horizontal' | 'vertical' | 'both';
