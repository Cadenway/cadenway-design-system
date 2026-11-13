import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

/** Diameter of a spinner, from 12 px (`xs`) to 32 px (`page`). */
export type CwSpinnerSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'page';

const SIZES: Record<CwSpinnerSize, string> = {
  xs: 'size-3',
  sm: 'size-3.5',
  default: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
  page: 'size-8',
};

/**
 * The spinning ring of an indeterminate wait: a faint track and an arc that grows and shrinks while
 * the ring turns (Spinner sheet of the Design System artifact).
 *
 * Draws into the host `<svg>`, colored by `currentColor` (muted by default; inherit the button text
 * inside a button). With `label`, it is a `role="status"` image named by the label; without, it is
 * hidden from assistive technologies, a visible text next to it carries the meaning. Under reduced
 * motion the ring turns slowly (2.8 s) and the arc stays still.
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'svg[cwSpinner]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    viewBox: '0 0 24 24',
    fill: 'none',
    '[attr.role]': 'label() ? "status" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.data-size]': 'size()',
    '[class]': 'classes()',
  },
  template: `
    <svg:circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="currentColor"
      [attr.stroke-width]="size() === 'page' ? 2 : 2.5"
      [class]="solid() ? 'opacity-25' : 'opacity-20'"
    />
    <svg:circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="currentColor"
      [attr.stroke-width]="size() === 'page' ? 2 : 2.5"
      stroke-linecap="round"
      pathLength="100"
      stroke-dasharray="30 200"
      transform="rotate(-90 12 12)"
      class="animate-spinner-arc motion-reduce:animate-none"
    />
  `,
})
export class CwSpinner {
  /** Diameter; `default` is 16 px, next to `text-sm`. */
  readonly size = input<CwSpinnerSize>('default');
  /** Accessible name; leave it empty when a visible label sits next to the spinner. */
  readonly label = input<string>('');
  /** On a solid fill (a `default` button): a slightly stronger track. */
  readonly solid = input(false, { transform: booleanAttribute });

  protected classes(): string {
    return `${SIZES[this.size()]} shrink-0 animate-spinner motion-reduce:[animation-duration:2.8s]! motion-reduce:[animation-iteration-count:infinite]!`;
  }
}

/**
 * A spinner with its optional visible label, shown only when a wait lasts: it appears after `delay`
 * (300 ms) to avoid a flicker, then stays at least `minDuration` (500 ms) once shown.
 *
 * Bind `active` to the wait. The label (« Chargement » by default) is the accessible name; with
 * `showLabel` it is also written next to the ring, in `text-muted-foreground`.
 */
@Component({
  selector: 'cw-spinner',
  imports: [CwSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center gap-2 text-muted-foreground',
    '[attr.role]': 'visible() ? "status" : null',
    '[attr.aria-live]': '"polite"',
  },
  template: `
    @if (visible()) {
      <svg cwSpinner [size]="size()" [label]="showLabel() ? '' : label()"></svg>
      @if (showLabel()) {
        <span class="text-sm">{{ label() }}</span>
      }
    }
  `,
})
export class CwSpinnerIndicator {
  /** Whether the wait is in progress. */
  readonly active = input(true, { transform: booleanAttribute });
  /** Diameter of the ring. */
  readonly size = input<CwSpinnerSize>('default');
  /** What is awaited; the accessible name, and the visible text with `showLabel`. */
  readonly label = input('Chargement');
  /** Writes the label next to the ring. */
  readonly showLabel = input(false, { transform: booleanAttribute });
  /** Time before the spinner appears, in ms. */
  readonly delay = input(300, { transform: numberAttribute });
  /** Minimum time the spinner stays once shown, in ms. */
  readonly minDuration = input(500, { transform: numberAttribute });

  protected readonly visible = signal(false);
  private shownAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
    });
    effect(() => {
      const active = this.active();
      const delay = this.delay();
      const minDuration = this.minDuration();
      clearTimeout(this.timer);
      if (active && !this.visible()) {
        this.timer = setTimeout(() => {
          this.shownAt = Date.now();
          this.visible.set(true);
        }, delay);
      } else if (!active && this.visible()) {
        const left = Math.max(0, minDuration - (Date.now() - this.shownAt));
        this.timer = setTimeout(() => {
          this.visible.set(false);
        }, left);
      }
    });
  }
}
