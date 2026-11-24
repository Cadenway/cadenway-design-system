import { Component, computed, inject, type Signal } from '@angular/core';

import { CwAppRail } from '../app-rail.component';

/**
 * Component CwAppRailFooter
 *
 * @description
 * The bottom of a `nav[cwAppRail]`: its items are pushed to the bottom of the column (mockup
 * `App.dc.html`: search, theme and the account button, 4 px apart). Below 768 px they join the tab
 * bar row after the groups' items; mark an item `desktopOnly` to keep it out of the bar (the theme
 * button of the mockup). In a rail whose `phoneLayout` is `column`, it stays at the bottom of the
 * column.
 */
@Component({
  selector: 'cw-app-rail-footer',
  host: { '[class]': 'classes()' },
  templateUrl: './app-rail-footer.component.html',
})
export class CwAppRailFooter {
  // #region Properties
  /**
   * Property rail
   *
   * @description
   * The rail holding the footer, whose `phoneLayout` decides the layout below 768 px.
   *
   * @type {CwAppRail | null}
   * @readonly
   */
  private readonly rail: CwAppRail | null = inject(CwAppRail, { optional: true });

  /**
   * Property classes
   *
   * @description
   * Bottom of the column, dissolved into the tab bar row below 768 px.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `mt-auto flex flex-col items-center gap-1${this.rail?.phoneLayout() === 'column' ? '' : ' max-md:contents'}`,
  );
  // #endregion
}
