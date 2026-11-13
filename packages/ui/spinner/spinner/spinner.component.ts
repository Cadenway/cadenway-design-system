import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

import type { CwSpinnerSize } from '../spinner.types';

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
  templateUrl: './spinner.component.html',
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
