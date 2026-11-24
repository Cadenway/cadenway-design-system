import {
  booleanAttribute,
  Component,
  computed,
  input,
  type InputSignalWithTransform,
  type Signal,
} from '@angular/core';

/**
 * Component CwAppRailGroup
 *
 * @description
 * A group of `[cwAppRailItem]` in a `nav[cwAppRail]`, stacked with 4 px between items (mockup
 * `App.dc.html`: the applications, then the favorite spaces). Below 768 px the group dissolves into
 * the tab bar row (`display: contents`), or disappears with `desktopOnly`, as the favorite spaces
 * and the organization switcher of the mockup do.
 */
@Component({
  selector: 'cw-app-rail-group',
  host: { '[class]': 'classes()', '[attr.data-desktop-only]': 'desktopOnly() ? "true" : null' },
  templateUrl: './app-rail-group.component.html',
})
export class CwAppRailGroup {
  // #region Properties
  /**
   * Property desktopOnly
   *
   * @description
   * Hides the whole group in the tab bar below 768 px.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly desktopOnly: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property classes
   *
   * @description
   * Column layout of the group, and its tab bar behavior below 768 px.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly classes: Signal<string> = computed(
    () =>
      `flex flex-col items-center gap-1 ${this.desktopOnly() ? 'max-md:hidden' : 'max-md:contents'}`,
  );
  // #endregion
}
