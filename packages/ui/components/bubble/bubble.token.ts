import { InjectionToken, type Signal } from '@angular/core';

import type { CwBubbleAlign, CwBubbleDefaults, CwBubblePosition } from './bubble.types';

/**
 * Lets a container give its bubbles a default variant, alignment and position (`CwBubbleDefaults`);
 * `cw-message` provides it. A bubble's own inputs win over it.
 */
export const CW_BUBBLE_DEFAULTS = new InjectionToken<CwBubbleDefaults>('CW_BUBBLE_DEFAULTS');

/** A bubble as its group and its reactions see it. Not exported from the entry point. */
export interface BubbleRef {
  readonly side: Signal<CwBubbleAlign>;
  addReaction(): void;
}

/** Each bubble provides itself under this token: its group and its reactions find it without
 * importing its class (it imports theirs). Not exported from the entry point. */
export const BUBBLE = new InjectionToken<BubbleRef>('BUBBLE');

/** A bubble group, as its bubbles see it. Not exported from the entry point. */
export interface BubbleGroupRef {
  positionOf(bubble: BubbleRef): CwBubblePosition | null;
}

/** The group provides itself under this token. Not exported from the entry point. */
export const BUBBLE_GROUP = new InjectionToken<BubbleGroupRef>('BUBBLE_GROUP');
