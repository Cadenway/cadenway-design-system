import { Component, computed, inject, type Signal } from '@angular/core';

import { CwAppRail } from '../app-rail.component';

/**
 * Component CwAppRailSeparator
 *
 * @description
 * The short decorative rule between two parts of a `nav[cwAppRail]` (mockup `App.dc.html`: 24 px
 * wide, 4 px above and below). Hidden from assistive technologies, and from the tab bar below
 * 768 px; kept in a rail whose `phoneLayout` is `column`.
 */
@Component({
  selector: 'cw-app-rail-separator',
  host: { '[class]': 'classes()', 'aria-hidden': 'true' },
  templateUrl: './app-rail-separator.component.html',
})
export class CwAppRailSeparator {
  // #region Properties
  /**
   * Property rail
   *
   * @description
   * The rail holding the separator, whose `phoneLayout` decides the layout below 768 px.
   *
   * @type {CwAppRail | null}
   * @readonly
   */
  private readonly rail: CwAppRail | null = inject(CwAppRail, { optional: true });

  /**
   * Property classes
   *
   * @description
   * The 24 px rule, hidden in the tab bar below 768 px.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `my-1 h-px w-6 shrink-0 bg-border${this.rail?.phoneLayout() === 'column' ? '' : ' max-md:hidden'}`,
  );
  // #endregion
}
