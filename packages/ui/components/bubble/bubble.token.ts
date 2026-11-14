import { InjectionToken, type Signal } from '@angular/core';

import type { CwBubbleAlign, CwBubbleDefaults, CwBubblePosition } from './bubble.types';

/**
 * Constant CW_BUBBLE_DEFAULTS
 *
 * @description
 * Lets a container give its bubbles a default variant, alignment and position (`CwBubbleDefaults`);
 * `cw-message` provides it. A bubble's own inputs win over it.
 *
 * @type {InjectionToken<CwBubbleDefaults>}
 */
export const CW_BUBBLE_DEFAULTS: InjectionToken<CwBubbleDefaults> =
  new InjectionToken<CwBubbleDefaults>('CW_BUBBLE_DEFAULTS');

/**
 * Interface BubbleRef
 *
 * @description
 * Internal bubble contract used by groups and reactions.
 */
export interface BubbleRef {
  // #region Properties
  /**
   * Property side
   * @readonly
   *
   * @description
   * Effective alignment of the bubble.
   *
   * @type {Signal<CwBubbleAlign>}
   */
  readonly side: Signal<CwBubbleAlign>;
  // #endregion

  // #region Methods
  /**
   * Method addReaction
   *
   * @description
   * Requests opening the reaction picker.
   */
  addReaction(): void;
  // #endregion
}

/**
 * Constant BUBBLE
 *
 * @description
 * Internal token through which groups and reactions find their bubble.
 *
 * @type {InjectionToken<BubbleRef>}
 */
export const BUBBLE: InjectionToken<BubbleRef> = new InjectionToken<BubbleRef>('BUBBLE');

/**
 * Interface BubbleGroupRef
 *
 * @description
 * Internal group contract used by its bubbles.
 */
export interface BubbleGroupRef {
  // #region Methods
  /**
   * Method positionOf
   *
   * @description
   * Returns the bubble's position in the group, or null for an ungrouped bubble.
   *
   * @param {BubbleRef} bubble - Bubble whose group position is requested.
   *
   * @returns {CwBubblePosition | null} Position in the group, or null when ungrouped.
   */
  positionOf(bubble: BubbleRef): CwBubblePosition | null;
  // #endregion
}

/**
 * Constant BUBBLE_GROUP
 *
 * @description
 * Internal token through which bubbles find their group.
 *
 * @type {InjectionToken<BubbleGroupRef>}
 */
export const BUBBLE_GROUP: InjectionToken<BubbleGroupRef> = new InjectionToken<BubbleGroupRef>(
  'BUBBLE_GROUP',
);
