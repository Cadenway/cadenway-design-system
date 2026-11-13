import type { Signal } from '@angular/core';

/** Surface of a bubble: `muted` for the others (default), `secondary` for oneself. */
export type CwBubbleVariant = 'default' | 'secondary' | 'muted' | 'outline' | 'ghost';

/** Result a bubble reports (assistant, automation): icon and title; `error` also tints the surface. */
export type CwBubbleTone = 'default' | 'info' | 'success' | 'warning' | 'error';

/** Text size and padding: `default` for comments, `sm` for dense previews. */
export type CwBubbleSize = 'default' | 'sm';

/** Side of the bubble: its reactions and its tightened corners follow it. */
export type CwBubbleAlign = 'start' | 'end';

/** Place of a bubble in a stack of consecutive bubbles; the corner on the avatar side tightens. */
export type CwBubblePosition = 'first' | 'middle' | 'last';

/** The tone words read before the title (« Avertissement : … »), French by default. */
export interface CwBubbleToneLabels {
  readonly info: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
}

/**
 * What a container gives the bubbles it holds when they do not set their own inputs: a message
 * gives `secondary` and `end` to its outgoing bubbles, and the position in a run of grouped
 * messages. Provide it under `CW_BUBBLE_DEFAULTS`.
 */
export interface CwBubbleDefaults {
  /** Variant of a bubble without `variant`. */
  readonly variant: Signal<CwBubbleVariant>;
  /** Alignment of a bubble without `align`. */
  readonly align: Signal<CwBubbleAlign>;
  /** Position of a bubble outside a `cw-bubble-group`; `null` keeps every corner round. */
  readonly position: Signal<CwBubblePosition | null>;
}
