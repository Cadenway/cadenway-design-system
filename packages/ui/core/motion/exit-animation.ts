import { ɵprefersReducedMotion } from '../a11y/reduced-motion';

/**
 * Interface ɵExitAnimationOptions
 * @interface ɵExitAnimationOptions
 *
 * @description
 * Controls when `ɵafterExitAnimation` finishes waiting for an element's exit animation.
 */
export interface ɵExitAnimationOptions {
  // #region Properties
  /**
   * Property fallback
   * @readonly
   *
   * @description
   * Milliseconds after which `done` runs even when no `animationend` came (a tab in the background,
   * an element hidden by an ancestor): the longest exit keyframe of `@cadenway/tokens` plus a
   * margin. No safety net when omitted.
   *
   * @type {number | undefined}
   */
  readonly fallback?: number;

  /**
   * Property endOnCancel
   * @readonly
   *
   * @description
   * Whether an `animationcancel` on the element also ends the wait; false when omitted.
   *
   * @type {boolean | undefined}
   */
  readonly endOnCancel?: boolean;
  // #endregion
}

/**
 * Function ɵafterExitAnimation
 *
 * @description
 * Runs `done` once the exit animation of `element` (`animate-menu-out`, `animate-fade-out`,
 * `animate-pop-out`…) has played, so a panel is removed only after it has faded or folded away.
 *
 * Call it once the element shows its closing state (or will, with the next render): the animation
 * is read from its computed style at call time. `done` runs at once, synchronously, when there is
 * nothing to wait for: no element, no animation (`none`, no stylesheet, a test DOM) or reduced
 * motion. Otherwise it runs on the first `animationend` of the element itself (its children's
 * entrances do not count), on `animationcancel` with `endOnCancel`, or after `fallback`. It runs at
 * most once. Returns a function that stops waiting without calling `done` (the panel reopened
 * meanwhile); calling it after `done` does nothing.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {HTMLElement | null | undefined} element - Element whose exit animation is observed.
 * @param {() => void} done - Callback invoked once waiting completes.
 * @param {ɵExitAnimationOptions} options - Optional timeout and cancellation behavior.
 *
 * @returns {() => void} Cancels the wait without invoking `done`.
 */
export function ɵafterExitAnimation(
  element: HTMLElement | null | undefined,
  done: () => void,
  options: ɵExitAnimationOptions = {},
): () => void {
  const document: Document | undefined = element?.ownerDocument;
  const view: Window | null | undefined = document?.defaultView;
  const name: string = element && view ? view.getComputedStyle(element).animationName : '';
  if (!element || !document || !name || name === 'none' || ɵprefersReducedMotion(document)) {
    done();
    return () => undefined;
  }

  let waiting: boolean = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop: () => void = (): void => {
    waiting = false;
    element.removeEventListener('animationend', onEnd);
    element.removeEventListener('animationcancel', onEnd);
    clearTimeout(timer);
  };
  const finish: () => void = (): void => {
    if (!waiting) return;
    stop();
    done();
  };
  /**
   * Function onEnd
   *
   * @description
   * Completes the wait for events dispatched by the observed element, ignoring child animations.
   *
   * @param {Event} event - Animation end or cancellation event.
   */
  function onEnd(event: Event): void {
    if (event.target === element) finish();
  }

  element.addEventListener('animationend', onEnd);
  if (options.endOnCancel) element.addEventListener('animationcancel', onEnd);
  if (options.fallback !== undefined) timer = setTimeout(finish, options.fallback);
  return stop;
}
