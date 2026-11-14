import { Directive, computed, input, type InputSignal, type Signal } from '@angular/core';

import type { CwSkeletonAnimation } from './skeleton.types';

/**
 * Constant ANIMATIONS
 *
 * @description
 * Literal classes from the Skeleton sheet for pulse, shimmer and still placeholders. Reduced
 * motion freezes both animations. The default radius uses `:where()` so consumer shape classes win.
 *
 * @type {Record<CwSkeletonAnimation, string>}
 */
const ANIMATIONS: Record<CwSkeletonAnimation, string> = {
  pulse: 'block bg-secondary [:where(&)]:rounded-md animate-skeleton motion-reduce:animate-none',
  shimmer:
    'relative isolate block overflow-hidden bg-secondary [:where(&)]:rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer-sweep before:bg-linear-to-r before:from-transparent before:via-background/70 before:to-transparent dark:before:via-foreground/[0.07] motion-reduce:before:hidden',
  none: 'block bg-secondary [:where(&)]:rounded-md',
};

/**
 * Class CwSkeleton
 * @class CwSkeleton
 *
 * @description
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
  // #region Properties
  /**
   * Property animation
   * @readonly
   *
   * @description
   * Input selecting the loading animation; reduced motion disables the animation.
   *
   * @type {InputSignal<CwSkeletonAnimation>}
   * @default 'pulse'
   */
  public readonly animation: InputSignal<CwSkeletonAnimation> = input<CwSkeletonAnimation>('pulse');

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed class string for the current animation and reduced-motion behavior.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() => ANIMATIONS[this.animation()]);
  // #endregion
}
