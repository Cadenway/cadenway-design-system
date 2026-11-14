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
