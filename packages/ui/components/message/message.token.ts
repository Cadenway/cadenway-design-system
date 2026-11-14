import { InjectionToken, type Signal } from '@angular/core';
import type { CwBubblePosition } from '@cadenway/ui/components/bubble';

import type { CwMessageVariant } from './message.types';

/**
 * Interface MessageRef
 *
 * @description
 * Message state used internally by its group and projected parts.
 */
export interface MessageRef {
  // #region Properties
  /**
   * Property author
   * @readonly
   *
   * @description
   * Display name of the message author.
   *
   * @type {Signal<string>}
   */
  readonly author: Signal<string>;

  /**
   * Property time
   * @readonly
   *
   * @description
   * Message timestamp, or null when it is unavailable.
   *
   * @type {Signal<Date | null>}
   */
  readonly time: Signal<Date | null>;

  /**
   * Property variant
   * @readonly
   *
   * @description
   * Incoming, outgoing or system message layout.
   *
   * @type {Signal<CwMessageVariant>}
   */
  readonly variant: Signal<CwMessageVariant>;

  /**
   * Property isGrouped
   * @readonly
   *
   * @description
   * Whether the group or the grouped input hides the avatar and header.
   *
   * @type {Signal<boolean>}
   */
  readonly isGrouped: Signal<boolean>;
  // #endregion
}

/**
 * Constant MESSAGE
 *
 * @description
 * Internal token by which a message exposes its state to its group and avatar.
 *
 * @type {InjectionToken<MessageRef>}
 */
export const MESSAGE: InjectionToken<MessageRef> = new InjectionToken<MessageRef>('MESSAGE');

/**
 * Interface MessagePlace
 *
 * @description
 * Position of a message within its group.
 */
export interface MessagePlace {
  // #region Properties
  /**
   * Property grouped
   * @readonly
   *
   * @description
   * Whether the message follows another in a run and hides its avatar and header.
   *
   * @type {boolean}
   */
  readonly grouped: boolean;

  /**
   * Property position
   * @readonly
   *
   * @description
   * Bubble position in the run, or null for a single message.
   *
   * @type {CwBubblePosition | null}
   */
  readonly position: CwBubblePosition | null;

  /**
   * Property first
   * @readonly
   *
   * @description
   * Whether this is the first message in the group.
   *
   * @type {boolean}
   */
  readonly first: boolean;
  // #endregion
}

/**
 * Interface MessageGroupRef
 *
 * @description
 * Internal group contract used by its messages to determine their position.
 */
export interface MessageGroupRef {
  // #region Methods
  /**
   * Method placeOf
   *
   * @description
   * Finds the position and grouping state of a message.
   *
   * @param {MessageRef} message - Message whose position is requested.
   *
   * @returns {MessagePlace} Position and grouping state within the group.
   */
  placeOf(message: MessageRef): MessagePlace;
  // #endregion
}

/**
 * Constant MESSAGE_GROUP
 *
 * @description
 * Internal token by which a group exposes positioning to its messages.
 *
 * @type {InjectionToken<MessageGroupRef>}
 */
export const MESSAGE_GROUP: InjectionToken<MessageGroupRef> = new InjectionToken<MessageGroupRef>(
  'MESSAGE_GROUP',
);
