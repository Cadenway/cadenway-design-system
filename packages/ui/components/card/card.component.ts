import {
  booleanAttribute,
  Component,
  computed,
  HostAttributeToken,
  inject,
  input,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';
import { ɵFOCUS } from '@cadenway/ui/core';

import type { CwCardSize } from './card.types';

/**
 * Constant BASE
 *
 * @description
 * Literal Card sheet classes; the card surface separates planes without a shadow at rest.
 *
 * @type {string}
 */
const BASE: string = 'flex flex-col rounded-xl border bg-card text-card-foreground';

/**
 * Constant SIZES
 *
 * @description
 * Spacing classes for standard and dense cards.
 *
 * @type {Record<CwCardSize, string>}
 */
const SIZES: Record<CwCardSize, string> = {
  default: 'gap-4 py-4',
  sm: 'gap-2 p-3',
};

/**
 * Constant INTERACTIVE
 *
 * @description
 * Hover veil and focus classes for interactive cards, using a gradient over the card surface.
 *
 * @type {string}
 */
const INTERACTIVE: string = `transition-colors hover:bg-linear-to-b hover:from-hover hover:to-hover ${ɵFOCUS}`;

/**
 * Constant SELECTED
 *
 * @description
 * Selected veil and foreground border classes from the Card preview.
 *
 * @type {string}
 */
const SELECTED: string = 'bg-linear-to-b from-selected to-selected border-foreground/40';

/**
 * Constant SELECTABLE_ROLES
 *
 * @description
 * Card host roles for which the component exposes selection through `aria-selected`.
 *
 * @type {Set<string>}
 */
const SELECTABLE_ROLES: Set<string> = new Set<string>(['option', 'gridcell', 'row', 'tab']);

/**
 * Class CwCard
 * @class CwCard
 *
 * @description
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
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Input selecting standard spacing or the small spacing used by dense cards.
   *
   * @type {InputSignal<CwCardSize>}
   * @default 'default'
   */
  public readonly size: InputSignal<CwCardSize> = input<CwCardSize>('default');

  /**
   * Property interactive
   * @readonly
   *
   * @description
   * Input adding a tab stop, hover veil and focus ring for a clickable card.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly interactive: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property selected
   * @readonly
   *
   * @description
   * Input displaying the selected veil and border.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @default false
   */
  public readonly selected: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property announcesSelection
   * @readonly
   *
   * @description
   * Whether the declared host role permits this card to expose `aria-selected`.
   *
   * @type {boolean}
   */
  protected readonly announcesSelection: boolean = SELECTABLE_ROLES.has(
    inject(new HostAttributeToken('role'), { optional: true }) ?? '',
  );

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Computed base, size, interaction and selection classes for the card host.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(() =>
    [
      BASE,
      SIZES[this.size()],
      this.interactive() ? INTERACTIVE : '',
      this.selected() ? SELECTED : '',
    ].join(' '),
  );
  // #endregion
}
