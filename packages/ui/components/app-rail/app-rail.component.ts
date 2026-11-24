import { Component, input, type InputSignal } from '@angular/core';

/**
 * Constant RAIL
 *
 * @description
 * Mockup `App.dc.html` (the applications `nav`): a 56 px column of 36 px icon buttons; below
 * 768 px it becomes a 56 px tab bar fixed at the bottom of the screen, above the page.
 *
 * @type {string}
 */
const RAIL: string =
  'relative z-30 flex w-14 shrink-0 flex-col items-center gap-1 py-2 ' +
  'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:h-14 max-md:w-full max-md:flex-row max-md:justify-around ' +
  'max-md:gap-0 max-md:border-t max-md:border-border max-md:bg-background max-md:px-1 max-md:py-0';

/**
 * Component CwAppRail
 *
 * @description
 * The applications rail of the app shell (mockup `App.dc.html`), on a `nav` named by `ariaLabel`
 * (« Applications » in the mockup). From 768 px it is a 56 px vertical column at the left of the
 * screen: `cw-app-rail-group` stacks its `[cwAppRailItem]` icon buttons, `cw-app-rail-separator`
 * draws the short rule between groups, and `cw-app-rail-footer` holds the items pushed to the bottom
 * (search, theme, account). Below 768 px it becomes a 56 px tab bar fixed at the bottom of the
 * screen: the items of the groups and of the footer share one row, while separators, groups and
 * items marked `desktopOnly` are hidden. The page then keeps 56 px free at its bottom (`pb-14`), which
 * the consumer's layout owns. Items keep their natural tab order; the current page is the item with
 * `current`.
 */
@Component({
  selector: 'nav[cwAppRail]',
  host: {
    class: RAIL,
    '[attr.aria-label]': 'ariaLabel()',
  },
  templateUrl: './app-rail.component.html',
})
export class CwAppRail {
  // #region Properties
  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the navigation landmark, required because a page has several (« Applications »
   * in the mockup, next to the sidebar's own navigation).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input.required<string>();
  // #endregion
}
