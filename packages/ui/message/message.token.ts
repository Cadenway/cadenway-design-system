import { InjectionToken, type Signal } from '@angular/core';
import type { CwBubblePosition } from '@cadenway/ui/bubble';

import type { CwMessageVariant } from './message.types';

/** A message as its group and its parts see it. Not exported from the entry point. */
export interface MessageRef {
  readonly author: Signal<string>;
  readonly time: Signal<Date | null>;
  readonly variant: Signal<CwMessageVariant>;
  /** Whether avatar and header are hidden (set by the group or the `grouped` input). */
  readonly isGrouped: Signal<boolean>;
}

/** Each message provides itself under this token: its group and its avatar find it without
 * importing its class. Not exported from the entry point. */
export const MESSAGE = new InjectionToken<MessageRef>('MESSAGE');

/** Where a message sits in its group. */
export interface MessagePlace {
  /** Not the first message of a run: avatar and header hidden. */
  readonly grouped: boolean;
  /** Position of its bubble in the run, `null` alone. */
  readonly position: CwBubblePosition | null;
  /** First message of the group. */
  readonly first: boolean;
}

/** A message group, as its messages see it. Not exported from the entry point. */
export interface MessageGroupRef {
  placeOf(message: MessageRef): MessagePlace;
}

/** The group provides itself under this token. Not exported from the entry point. */
export const MESSAGE_GROUP = new InjectionToken<MessageGroupRef>('MESSAGE_GROUP');
