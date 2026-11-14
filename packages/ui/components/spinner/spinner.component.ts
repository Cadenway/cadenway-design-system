import {
  booleanAttribute,
  Component,
  input,
  type InputSignal,
  type InputSignalWithTransform,
} from '@angular/core';

import type { CwSpinnerSize } from './spinner.types';

/**
 * Constant SIZES
 *
 * @description
 * Literal diameter classes for the supported spinner sizes.
 *
 * @type {Record<CwSpinnerSize, string>}
 */
const SIZES: Record<CwSpinnerSize, string> = {
  xs: 'size-3',
  sm: 'size-3.5',
  default: 'size-4',
  lg: 'size-5',
  xl: 'size-6',
  page: 'size-8',
};

/**
 * Class CwSpinner
 * @class CwSpinner
 *
 * @description
 * The spinning ring of an indeterminate wait: a faint track and an arc that grows and shrinks while
 * the ring turns (Spinner sheet of the Design System artifact).
 *
 * Draws into the host `<svg>`, colored by `currentColor` (muted by default; inherit the button text
 * inside a button). With `label`, it is a `role="status"` image named by the label; without, it is
 * hidden from assistive technologies, a visible text next to it carries the meaning. Under reduced
 * motion the ring turns slowly (2.8 s) and the arc stays still.
 */
@Component({
  selector: 'svg[cwSpinner]',
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
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting the diameter; the default is 16 pixels and fits beside `text-sm`.
   *
   * @type {InputSignal<CwSpinnerSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwSpinnerSize> = input<CwSpinnerSize>('default');

  /**
   * Property label
   * @readonly
   *
   * @description
   * Accessible name; leave empty when nearby visible text already describes the wait.
   *
   * @type {InputSignal<string>}
   * @default ''
   */
  public readonly label: InputSignal<string> = input<string>('');

  /**
   * Property solid
   * @readonly
   *
   * @description
   * Input selecting a stronger track for use on a solid button fill.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly solid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  // #endregion

  // #region Methods
  /**
   * Method classes
   * @method classes
   *
   * @description
   * Combines the selected diameter with ring animation and reduced-motion classes.
   *
   * @returns {string} Classes applied to the SVG host.
   */
  protected classes(): string {
    return `${SIZES[this.size()]} shrink-0 animate-spinner motion-reduce:[animation-duration:2.8s]! motion-reduce:[animation-iteration-count:infinite]!`;
  }
  // #endregion
}
