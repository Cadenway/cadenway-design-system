import type { Signal } from '@angular/core';

/**
 * Type CwBubbleVariant
 *
 * @description
 * Surface of a bubble, including muted and secondary message variants.
 *
 * @type {'default' | 'secondary' | 'muted' | 'outline' | 'ghost'}
 */
export type CwBubbleVariant = 'default' | 'secondary' | 'muted' | 'outline' | 'ghost';

/**
 * Type CwBubbleTone
 *
 * @description
 * Result indicated by the bubble's icon and title; error also tints its surface.
 *
 * @type {'default' | 'info' | 'success' | 'warning' | 'error'}
 */
export type CwBubbleTone = 'default' | 'info' | 'success' | 'warning' | 'error';

/**
 * Type CwBubbleSize
 *
 * @description
 * Text size and padding for comments or dense previews.
 *
 * @type {'default' | 'sm'}
 */
export type CwBubbleSize = 'default' | 'sm';

/**
 * Type CwBubbleAlign
 *
 * @description
 * Bubble side used to align reactions and tightened corners.
 *
 * @type {'start' | 'end'}
 */
export type CwBubbleAlign = 'start' | 'end';

/**
 * Type CwBubblePosition
 *
 * @description
 * Position in a stack of consecutive bubbles.
 *
 * @type {'first' | 'middle' | 'last'}
 */
export type CwBubblePosition = 'first' | 'middle' | 'last';

/**
 * Interface CwBubbleToneLabels
 *
 * @description
 * Tone words read before the title, French by default.
 */
export interface CwBubbleToneLabels {
  // #region Properties
  /**
   * Property info
   * @readonly
   *
   * @description
   * Label for informational messages.
   *
   * @type {string}
   */
  readonly info: string;

  /**
   * Property success
   * @readonly
   *
   * @description
   * Label for successful outcomes.
   *
   * @type {string}
   */
  readonly success: string;

  /**
   * Property warning
   * @readonly
   *
   * @description
   * Label for warnings.
   *
   * @type {string}
   */
  readonly warning: string;

  /**
   * Property error
   * @readonly
   *
   * @description
   * Label for errors.
   *
   * @type {string}
   */
  readonly error: string;
  // #endregion
}

/**
 * Interface CwBubbleDefaults
 *
 * @description
 * What a container gives the bubbles it holds when they do not set their own inputs: a message
 * gives `secondary` and `end` to its outgoing bubbles, and the position in a run of grouped
 * messages. Provide it under `CW_BUBBLE_DEFAULTS`.
 */
export interface CwBubbleDefaults {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Variant used when a bubble has no explicit variant.
   *
   * @type {Signal<CwBubbleVariant>}
   */
  readonly variant: Signal<CwBubbleVariant>;

  /**
   * Property align
   * @readonly
   *
   * @description
   * Alignment used when a bubble has no explicit alignment.
   *
   * @type {Signal<CwBubbleAlign>}
   */
  readonly align: Signal<CwBubbleAlign>;

  /**
   * Property position
   * @readonly
   *
   * @description
   * Position outside a bubble group; null keeps every corner round.
   *
   * @type {Signal<CwBubblePosition | null>}
   */
  readonly position: Signal<CwBubblePosition | null>;
  // #endregion
}
