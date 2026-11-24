/**
 * Type CwSidebarState
 *
 * @description
 * Whether the sidebar displays labels or is collapsed.
 *
 * @type {'expanded' | 'collapsed'}
 */
export type CwSidebarState = 'expanded' | 'collapsed';

/**
 * Type CwSidebarCollapsible
 *
 * @description
 * How a sidebar reduces: to the 48 px icon rail (`icon`), out of the screen (`offcanvas`), or never
 * (`none`). Under 768 px every collapsible sidebar is an off-canvas drawer.
 *
 * @type {'icon' | 'offcanvas' | 'none'}
 */
export type CwSidebarCollapsible = 'icon' | 'offcanvas' | 'none';

/**
 * Type CwSidebarOverlayBelow
 *
 * @description
 * Breakpoint under which an expanded collapsible sidebar floats over the content instead of
 * pushing it: `md` (768 px), the phone drawer only; `lg` (1024 px), also over the content of a
 * tablet, as the mockup's application shell does (`App.dc.html`).
 *
 * @type {'md' | 'lg'}
 */
export type CwSidebarOverlayBelow = 'md' | 'lg';

/**
 * Type CwSidebarBackdrop
 *
 * @description
 * Where the backdrop of a floating sidebar spreads: the whole `viewport` (`fixed`), or the nearest
 * positioned `container` (`absolute`), so that it leaves out what sits outside it, such as the
 * application rail's bottom tab bar (`App.dc.html`).
 *
 * @type {'viewport' | 'container'}
 */
export type CwSidebarBackdrop = 'viewport' | 'container';

/**
 * Type CwSidebarSpaceColor
 *
 * @description
 * The hue of a space's icon or initial, given by the consumer: the space and label colors of the
 * mockup palette (`LOOK_COLORS` of `App.dc.html`), named after their tokens; `neutral` is the muted
 * ink (« Gris »).
 *
 * @type {CwSidebarSpaceColor}
 */
export type CwSidebarSpaceColor =
  | 'neutral'
  | 'amethyste'
  | 'indigo'
  | 'azur'
  | 'lagon'
  | 'jade'
  | 'olive'
  | 'balise'
  | 'cornaline'
  | 'grenat'
  | 'rose'
  | 'fuchsia'
  | 'ardoise';

/**
 * Interface CwSidebarLabels
 *
 * @description
 * Default texts replaced for an application or subtree with `provideCwSidebarLabels`.
 */
export interface CwSidebarLabels {
  // #region Properties
  /**
   * Property ariaLabel
   *
   * @description
   * Default text for the `ariaLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly ariaLabel: string;

  /**
   * Property closeLabel
   *
   * @description
   * Default text for the `closeLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly closeLabel: string;

  /**
   * Property collapseLabel
   *
   * @description
   * Default text for the `collapseLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly collapseLabel: string;

  /**
   * Property expandLabel
   *
   * @description
   * Default text for the `expandLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly expandLabel: string;
  // #endregion
}
