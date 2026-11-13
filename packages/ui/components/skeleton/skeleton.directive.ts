import { Directive, computed, input } from '@angular/core';

import type { CwSkeletonAnimation } from './skeleton.types';

/* Literal class strings (Skeleton sheet and preview of the Design System artifact). The pulse is the
   mockup's `cw-sk` (`animate-skeleton`, 1.6 s, cw-motion-tokens); the shimmer is a reflection that
   sweeps the `before` pseudo-element. Reduced motion freezes both.
   The default radius sits in `:where()` (zero specificity): the native `class` of the consumer gives
   the shape (`rounded-full`, `rounded-[4px]`, `rounded-lg`) and always wins over it. */
const ANIMATIONS: Record<CwSkeletonAnimation, string> = {
  pulse: 'block bg-secondary [:where(&)]:rounded-md animate-skeleton motion-reduce:animate-none',
  shimmer:
    'relative isolate block overflow-hidden bg-secondary [:where(&)]:rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer-sweep before:bg-linear-to-r before:from-transparent before:via-background/70 before:to-transparent dark:before:via-foreground/[0.07] motion-reduce:before:hidden',
  none: 'block bg-secondary [:where(&)]:rounded-md',
};

/**
 * A loading placeholder that takes the exact shape of the content to come: a text line, an
 * avatar, a checkbox, a badge, a chart (Skeleton sheet of the Design System artifact).
 *
 * Put it on a `<div>` and give its size and shape with the native `class` (`h-3.5 w-[62%]`,
 * `size-6 rounded-full`; `rounded-md` by default). Each shape is `aria-hidden`: the container says
 * what loads (`aria-busy="true"` and a label such as « Chargement des tâches »). Show it only for
 * waits over 300 ms and replace it by the content without a fade. One animation per screen:
 * `pulse` mostly, `shimmer` for large blocks, `none` inside an area that already animates.
 */
@Directive({
  selector: 'div[cwSkeleton]',
  host: {
    '[class]': 'classes()',
    'aria-hidden': 'true',
    '[attr.data-animation]': 'animation()',
  },
})
export class CwSkeleton {
  /** Loading animation; reduced motion turns it off. */
  readonly animation = input<CwSkeletonAnimation>('pulse');

  protected readonly classes = computed(() => ANIMATIONS[this.animation()]);
}
