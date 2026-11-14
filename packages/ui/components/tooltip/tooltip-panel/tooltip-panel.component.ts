import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  input,
  TemplateRef,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { CwKbd } from '@cadenway/ui/components/kbd';

import type { CwTooltipAlign, CwTooltipContent, CwTooltipSide } from '../tooltip.types';

/**
 * Type TooltipState
 *
 * @description
 * Opening or closing state of the tooltip bubble.
 *
 * @type {'closed' | 'delayed-open' | 'instant-open'}
 */
export type TooltipState = 'closed' | 'delayed-open' | 'instant-open';

/* Literal class strings (Tooltip sheet and preview of the Design System artifact). Light: inverted
   ink (`bg-foreground text-background`); dark: the `popover` elevation and a `border` line, never a
   glaring white bubble. */
/**
 * Constant BUBBLE
 *
 * @description
 * Base classes for the tooltip bubble.
 *
 * @type {string}
 */
const BUBBLE: string =
  'relative block w-max max-w-64 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-balance text-background shadow-sm dark:border dark:bg-popover dark:text-popover-foreground';

// Opening: `pop-in`, except when the bubble replaces another one during `skipDelay` (sheet,
// "Mouvement"). Closing: a fade.
/**
 * Constant MOTION
 *
 * @description
 * Animation classes for tooltip transitions.
 *
 * @type {Readonly<Record<'enter' | 'still' | 'leave', string>>}
 */
const MOTION: Readonly<Record<'enter' | 'still' | 'leave', string>> = {
  enter: 'animate-pop-in motion-reduce:animate-none',
  still: '',
  leave: 'animate-fade-out motion-reduce:animate-none',
} as const;

/**
 * Constant ARROW
 *
 * @description
 * Base classes for the tooltip arrow.
 *
 * @type {string}
 */
const ARROW: string =
  'absolute size-2 rotate-45 rounded-[1px] bg-foreground dark:bg-popover pointer-events-none';

// The diamond sits on the edge facing the trigger; in dark, its two outer sides carry the border.
/**
 * Constant ARROW_SIDES
 *
 * @description
 * Arrow positioning classes for each side.
 *
 * @type {Record<CwTooltipSide, string>}
 */
const ARROW_SIDES: Record<CwTooltipSide, string> = {
  top: '-bottom-1 dark:border-r dark:border-b',
  right: '-left-1 dark:border-b dark:border-l',
  bottom: '-top-1 dark:border-t dark:border-l',
  left: '-right-1 dark:border-t dark:border-r',
};

// Along the edge: centered, or under the middle of a 32 px trigger when the bubble is aligned on
// one of its edges.
/**
 * Constant ARROW_ALONG
 *
 * @description
 * Arrow alignment classes along each axis.
 *
 * @type {Record<'horizontal' | 'vertical', Record<CwTooltipAlign, string>>}
 */
const ARROW_ALONG: Record<'horizontal' | 'vertical', Record<CwTooltipAlign, string>> = {
  horizontal: {
    start: 'start-4 -translate-x-1/2 rtl:translate-x-1/2',
    center: 'left-1/2 -translate-x-1/2',
    end: 'end-4 translate-x-1/2 rtl:-translate-x-1/2',
  },
  vertical: {
    start: 'top-4 -translate-y-1/2',
    center: 'top-1/2 -translate-y-1/2',
    end: 'bottom-4 translate-y-1/2',
  },
};

/**
 * Component CwTooltipPanel
 *
 * @description
 * The bubble of a `[cwTooltip]`, rendered in its overlay: the text or template, the optional
 * shortcut keys and the arrow. Internal to `@cadenway/ui/components/tooltip`: the directive creates it and
 * sets its inputs; its `id` is what the trigger's `aria-describedby` points to.
 */
@Component({
  selector: 'cw-tooltip-panel',
  imports: [CwKbd, NgTemplateOutlet],
  host: {
    role: 'tooltip',
    '[attr.id]': 'id()',
    '[class]': 'classes()',
    '[attr.data-state]': 'state()',
    '[attr.data-side]': 'side()',
    '[attr.data-align]': 'align()',
  },
  templateUrl: './tooltip-panel.component.html',
})
export class CwTooltipPanel {
  // #region Properties
  /**
   * Property id
   * @readonly
   *
   * @description
   * Identifier referenced by the trigger.
   *
   * @type {InputSignal<string>}
   */
  public readonly id: InputSignal<string> = input.required<string>();

  /**
   * Property content
   * @readonly
   *
   * @description
   * Text or template shown in the bubble.
   *
   * @type {InputSignal<CwTooltipContent>}
   */
  public readonly content: InputSignal<CwTooltipContent> = input.required<CwTooltipContent>();

  /**
   * Property shortcut
   * @readonly
   *
   * @description
   * Keyboard shortcut keys displayed after the content.
   *
   * @type {InputSignal<readonly string[] | null | undefined>}
   */
  public readonly shortcut: InputSignal<readonly string[] | null | undefined> = input<
    readonly string[] | null | undefined
  >(undefined);

  /**
   * Property arrow
   * @readonly
   *
   * @description
   * Whether to draw the arrow.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly arrow: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property side
   * @readonly
   *
   * @description
   * Side of the trigger where the bubble appears.
   *
   * @type {InputSignal<CwTooltipSide>}
   */
  public readonly side: InputSignal<CwTooltipSide> = input<CwTooltipSide>('top');

  /**
   * Property align
   * @readonly
   *
   * @description
   * Alignment of the bubble along its side.
   *
   * @type {InputSignal<CwTooltipAlign>}
   */
  public readonly align: InputSignal<CwTooltipAlign> = input<CwTooltipAlign>('center');

  /**
   * Property state
   * @readonly
   *
   * @description
   * Current tooltip animation state.
   *
   * @type {InputSignal<TooltipState>}
   */
  public readonly state: InputSignal<TooltipState> = input<TooltipState>('delayed-open');

  /**
   * Property animated
   * @readonly
   *
   * @description
   * Whether to play the opening animation.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly animated: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property text
   * @readonly
   *
   * @description
   * Text content when the content is a string.
   *
   * @type {Signal<string | null>}
   */
  protected readonly text: Signal<string | null> = computed(() => {
    const content: CwTooltipContent = this.content();
    return typeof content === 'string' ? content : null;
  });

  /**
   * Property template
   * @readonly
   *
   * @description
   * Template content when supplied.
   *
   * @type {Signal<TemplateRef<unknown> | null>}
   */
  protected readonly template: Signal<TemplateRef<unknown> | null> = computed(() => {
    const content: CwTooltipContent = this.content();
    return content instanceof TemplateRef ? content : null;
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Bubble classes for the current animation state.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => {
    const motion: string =
      this.state() === 'closed' ? MOTION.leave : this.animated() ? MOTION.enter : MOTION.still;
    return `${BUBBLE} ${motion}`;
  });

  /**
   * Property arrowClasses
   * @readonly
   *
   * @description
   * Arrow classes for the current side and alignment.
   *
   * @type {Signal<string>}
   */
  protected readonly arrowClasses: Signal<string> = computed(() => {
    const side: CwTooltipSide = this.side();
    const axis: 'horizontal' | 'vertical' =
      side === 'top' || side === 'bottom' ? 'horizontal' : 'vertical';
    return `${ARROW} ${ARROW_SIDES[side]} ${ARROW_ALONG[axis][this.align()]}`;
  });
  // #endregion
}
