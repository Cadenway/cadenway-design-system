import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, input, TemplateRef } from '@angular/core';
import { CwKbd } from '@cadenway/ui/components/kbd';

import type { CwTooltipAlign, CwTooltipContent, CwTooltipSide } from '../tooltip.types';

/** `data-state` of the bubble (Tooltip sheet, "Attributs d'état"). */
export type TooltipState = 'closed' | 'delayed-open' | 'instant-open';

/* Literal class strings (Tooltip sheet and preview of the Design System artifact). Light: inverted
   ink (`bg-foreground text-background`); dark: the `popover` elevation and a `border` line, never a
   glaring white bubble. */
const BUBBLE =
  'relative block w-max max-w-64 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-balance text-background shadow-sm dark:border dark:bg-popover dark:text-popover-foreground';

// Opening: `pop-in`, except when the bubble replaces another one during `skipDelay` (sheet,
// "Mouvement"). Closing: a fade.
const MOTION = {
  enter: 'animate-pop-in motion-reduce:animate-none',
  still: '',
  leave: 'animate-fade-out motion-reduce:animate-none',
} as const;

const ARROW =
  'absolute size-2 rotate-45 rounded-[1px] bg-foreground dark:bg-popover pointer-events-none';

// The diamond sits on the edge facing the trigger; in dark, its two outer sides carry the border.
const ARROW_SIDES: Record<CwTooltipSide, string> = {
  top: '-bottom-1 dark:border-r dark:border-b',
  right: '-left-1 dark:border-b dark:border-l',
  bottom: '-top-1 dark:border-t dark:border-l',
  left: '-right-1 dark:border-t dark:border-r',
};

// Along the edge: centered, or under the middle of a 32 px trigger when the bubble is aligned on
// one of its edges.
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
  /** Id of the bubble, referenced by the trigger's `aria-describedby`. */
  readonly id = input.required<string>();
  /** Text or template shown. */
  readonly content = input.required<CwTooltipContent>();
  /** Keys shown after the text (`['Ctrl', 'K']`). */
  readonly shortcut = input<readonly string[] | null | undefined>(undefined);
  /** Draws the diamond pointing to the trigger. */
  readonly arrow = input(true, { transform: booleanAttribute });
  /** Side of the trigger the bubble actually sits on. */
  readonly side = input<CwTooltipSide>('top');
  /** Alignment the bubble actually took. */
  readonly align = input<CwTooltipAlign>('center');
  /** Open by hover, open at once, or closing. */
  readonly state = input<TooltipState>('delayed-open');
  /** Plays the opening animation; false when the bubble replaces another one. */
  readonly animated = input(true, { transform: booleanAttribute });

  protected readonly text = computed(() => {
    const content = this.content();
    return typeof content === 'string' ? content : null;
  });

  protected readonly template = computed(() => {
    const content = this.content();
    return content instanceof TemplateRef ? content : null;
  });

  protected readonly classes = computed(() => {
    const motion =
      this.state() === 'closed' ? MOTION.leave : this.animated() ? MOTION.enter : MOTION.still;
    return `${BUBBLE} ${motion}`;
  });

  protected readonly arrowClasses = computed(() => {
    const side = this.side();
    const axis = side === 'top' || side === 'bottom' ? 'horizontal' : 'vertical';
    return `${ARROW} ${ARROW_SIDES[side]} ${ARROW_ALONG[axis][this.align()]}`;
  });
}
