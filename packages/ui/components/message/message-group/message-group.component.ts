import { Component, computed, contentChildren, type Signal } from '@angular/core';
import type { CwBubblePosition } from '@cadenway/ui/components/bubble';

import {
  MESSAGE,
  MESSAGE_GROUP,
  type MessageGroupRef,
  type MessagePlace,
  type MessageRef,
} from '../message.token';

/**
 * Type MessageList
 *
 * @description
 * Messages projected into a group in display order.
 *
 * @type {readonly MessageRef[]}
 */
type MessageList = readonly MessageRef[];

// Message sheet, « Groupé »: consecutive messages of one person less than 5 minutes apart.
/**
 * Constant GROUP_WINDOW
 *
 * @description
 * Maximum interval in milliseconds for consecutive messages to share a group.
 *
 * @type {number}
 */
const GROUP_WINDOW: number = 5 * 60_000;

/**
 * Constant ALONE
 *
 * @description
 * Fallback position for a message not found in the group.
 *
 * @type {MessagePlace}
 */
const ALONE: MessagePlace = { grouped: false, position: null, first: false };

/**
 * Component CwMessageGroup
 *
 * @description
 * Wraps the messages of a thread and groups the consecutive ones of the same person (Message sheet
 * of the Design System artifact, « Groupé »).
 *
 * A message whose author and side match the previous one, sent less than 5 minutes after it,
 * shares its avatar and header (`grouped`); the bubbles of a run stack 2 px apart and tighten
 * their inner corners. Runs are 16 px apart. Messages enter one after the other
 * (`animate-item-in`, 60 ms then +30 ms, twelve at most).
 */
@Component({
  selector: 'cw-message-group',
  providers: [{ provide: MESSAGE_GROUP, useExisting: CwMessageGroup }],
  host: {
    class:
      'flex flex-col *:animate-item-in *:motion-reduce:animate-none [&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] [&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] [&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] [&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]',
  },
  templateUrl: './message-group.component.html',
})
export class CwMessageGroup implements MessageGroupRef {
  // #region Properties
  /**
   * Property messages
   * @readonly
   *
   * @description
   * Messages projected into the group, in display order.
   *
   * @type {Signal<MessageList>}
   */
  private readonly messages: Signal<MessageList> = contentChildren(MESSAGE, { descendants: true });

  /**
   * Property places
   * @readonly
   *
   * @description
   * Position and grouping state computed for each projected message.
   *
   * @type {Signal<Map<MessageRef, MessagePlace>>}
   */
  private readonly places: Signal<Map<MessageRef, MessagePlace>> = computed(() => {
    const messages: readonly MessageRef[] = this.messages();
    const continues: boolean[] = messages.map((message, index) =>
      index > 0 ? this.follows(messages[index - 1], message) : false,
    );
    const places: Map<MessageRef, MessagePlace> = new Map<MessageRef, MessagePlace>();
    messages.forEach((message, index) => {
      const starts: boolean = !continues[index];
      const goesOn: boolean = index + 1 < messages.length && continues[index + 1];
      let position: CwBubblePosition | null = null;
      if (starts && goesOn) position = 'first';
      else if (!starts && goesOn) position = 'middle';
      else if (!starts) position = 'last';
      places.set(message, { grouped: !starts, position, first: index === 0 });
    });
    return places;
  });
  // #endregion

  // #region Methods
  /**
   * Method placeOf
   *
   * @description
   * Returns the grouping state and bubble position of a projected message.
   *
   * @param {MessageRef} message - Message whose position is requested.
   *
   * @returns {MessagePlace} Computed position, or the ungrouped fallback when absent.
   */
  public placeOf(message: MessageRef): MessagePlace {
    return this.places().get(message) ?? ALONE;
  }

  /**
   * Method follows
   *
   * @description
   * Checks whether adjacent messages have the same author and side and are less than five minutes apart.
   * System messages and timestamps out of order do not join a run.
   *
   * @param {MessageRef} previous - Message immediately preceding the candidate.
   * @param {MessageRef} message - Candidate message to add to the run.
   *
   * @returns {boolean} Whether the candidate continues the previous message's run.
   */
  private follows(previous: MessageRef, message: MessageRef): boolean {
    const before: Date | null = previous.time();
    const time: Date | null = message.time();
    return (
      message.variant() !== 'system' &&
      message.variant() === previous.variant() &&
      // Your own messages often carry no author: they still group among themselves.
      (message.author() !== '' || message.variant() === 'outgoing') &&
      message.author() === previous.author() &&
      before !== null &&
      time !== null &&
      time.getTime() - before.getTime() >= 0 &&
      time.getTime() - before.getTime() < GROUP_WINDOW
    );
  }
  // #endregion
}
