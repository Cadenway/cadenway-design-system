import {
  booleanAttribute,
  Component,
  input,
  type InputSignal,
  type InputSignalWithTransform,
} from '@angular/core';

import type { CwSeparatorOrientation } from './separator.types';

/**
 * Constant ORIENTATIONS
 *
 * @description
 * Literal classes from the Separator sheet. Horizontal pseudo-elements surround projected text;
 * an empty separator becomes one continuous line. Both orientations stretch to their container.
 *
 * @type {Record<CwSeparatorOrientation, string>}
 */
const ORIENTATIONS: Record<CwSeparatorOrientation, string> = {
  horizontal:
    'flex shrink-0 items-center gap-3 self-stretch text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border empty:gap-0',
  vertical: 'block w-px shrink-0 self-stretch bg-border',
};

/**
 * Class CwSeparator
 * @class CwSeparator
 *
 * @description
 * A 1 px line between groups of content, horizontal or vertical, in `bg-border` (Separator sheet of
 * the Design System artifact).
 *
 * Decorative by default (`role="none"`): most lines separate content that headings or lists already
 * separate. With `decorative` false it is a `role="separator"` (and `aria-orientation` when
 * vertical). Text projected into a horizontal separator becomes its centered label (« Aujourd'hui »,
 * « ou »). The vertical line stretches to its flex container; give it a fixed height with the
 * native `class` (`h-4` in a toolbar). Spacing is layout: `my-3` in a panel, `-mx-1 my-1` in a menu.
 */
@Component({
  selector: 'cw-separator',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'decorative() ? "none" : "separator"',
    '[attr.aria-orientation]': '!decorative() && orientation() === "vertical" ? "vertical" : null',
    '[attr.data-orientation]': 'orientation()',
  },
  templateUrl: './separator.component.html',
})
export class CwSeparator {
  // #region Properties
  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Input selecting the line direction and the corresponding layout.
   *
   * @type {InputSignal<CwSeparatorOrientation>}
   * @default 'horizontal'
   */
  public readonly orientation: InputSignal<CwSeparatorOrientation> =
    input<CwSeparatorOrientation>('horizontal');

  /**
   * Property decorative
   * @readonly
   *
   * @description
   * Input selecting a purely visual line; false exposes the separator role to assistive technology.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default true
   */
  public readonly decorative: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });
  // #endregion

  // #region Methods
  /**
   * Method classes
   * @method classes
   *
   * @description
   * Selects the literal class string for the current orientation.
   *
   * @returns {string} Classes applied to the separator host.
   */
  protected classes(): string {
    return ORIENTATIONS[this.orientation()];
  }
  // #endregion
}
