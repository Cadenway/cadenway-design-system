import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

import type { CwSeparatorOrientation } from './separator.types';

/* Literal class strings (Separator sheet and preview of the Design System artifact). The horizontal
   line is drawn by two flexible pseudo-elements, so projected text becomes a centered label between
   two lines, and an empty separator (`empty:gap-0`) is one continuous 1 px line. No fixed width:
   it fills a block or a column container, and negative margins (`-mx-1` in a menu) widen it. */
const ORIENTATIONS: Record<CwSeparatorOrientation, string> = {
  horizontal:
    'flex shrink-0 items-center gap-3 self-stretch text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border empty:gap-0',
  vertical: 'block w-px shrink-0 self-stretch bg-border',
};

/**
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'decorative() ? "none" : "separator"',
    '[attr.aria-orientation]': '!decorative() && orientation() === "vertical" ? "vertical" : null',
    '[attr.data-orientation]': 'orientation()',
  },
  templateUrl: './separator.component.html',
})
export class CwSeparator {
  /** Direction of the line. */
  readonly orientation = input<CwSeparatorOrientation>('horizontal');
  /** Purely visual (`role="none"`); false when the line really separates two groups. */
  readonly decorative = input(true, { transform: booleanAttribute });

  protected classes(): string {
    return ORIENTATIONS[this.orientation()];
  }
}
