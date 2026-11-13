import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { ɵFOCUS } from '@cadenway/ui/core';

import type { CwCardSize } from './card.types';

/* Literal class strings (Card sheet and preview of the Design System artifact). A card has no
   shadow at rest: the surface (`bg-card` on `bg-canvas`) separates the planes. */
const BASE = 'flex flex-col rounded-xl border bg-card text-card-foreground';

const SIZES: Record<CwCardSize, string> = {
  default: 'gap-4 py-4',
  sm: 'gap-2 p-3',
};

// The hover veil is a gradient over the filled surface, never a solid gray (cw-tokens-and-theme).
const INTERACTIVE = `transition-colors hover:bg-linear-to-b hover:from-hover hover:to-hover ${ɵFOCUS}`;

// The selected border is `foreground/40`, as on every selected card or choice (preview,
// cw-tokens-and-theme); never amethyst.
const SELECTED = 'bg-linear-to-b from-selected to-selected border-foreground/40';

// Roles on which `aria-selected` is allowed (WAI-ARIA 1.2).
const SELECTABLE_ROLES = new Set(['option', 'gridcell', 'row', 'tab']);

/**
 * A container laid on the page: a block of settings, a dashboard widget, the dense card of a board
 * column (Card sheet of the Design System artifact).
 *
 * Compose it with `cw-card-header` (title, description, action), `cw-card-content` and
 * `cw-card-footer`, or project free content. `interactive` makes it a tab stop with the hover veil
 * and the focus ring: listen to the native `(click)` and `(keydown.enter)`. `selected` lays the
 * selected veil; it is announced through `aria-selected` only when the consumer gives the card a
 * role that allows it (`option`, `gridcell`, `row`, `tab`), otherwise a checkbox or the container
 * pattern must carry the selection. Never put a card in a card. The task card of the board is built
 * by the web application on top of this card (repository boundary, cw-brick-recipes).
 */
@Component({
  selector: 'cw-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.tabindex]': 'interactive() ? 0 : null',
    '[attr.aria-selected]': 'announcesSelection ? selected() : null',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './card.component.html',
})
export class CwCard {
  /** Spacing; `sm` for the dense cards of a board column. */
  readonly size = input<CwCardSize>('default');
  /** Adds the tab stop, the hover veil and the focus ring of a clickable card. */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Lays the selected veil and border. */
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly announcesSelection = SELECTABLE_ROLES.has(
    inject(new HostAttributeToken('role'), { optional: true }) ?? '',
  );

  protected readonly classes = computed(() =>
    [
      BASE,
      SIZES[this.size()],
      this.interactive() ? INTERACTIVE : '',
      this.selected() ? SELECTED : '',
    ].join(' '),
  );
}
