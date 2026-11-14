/**
 * Type CwTabsVariant
 *
 * @description
 * Look of a tab set: pills in a track (`segmented`) or underlined tabs (`bar`).
 *
 * @type {'segmented' | 'bar'}
 */
export type CwTabsVariant = 'segmented' | 'bar';

/**
 * Type CwTabsSize
 *
 * @description
 * Height of a tab set: `default` (32 px track, 36 px bar) or `sm` (28 px).
 *
 * @type {'default' | 'sm'}
 */
export type CwTabsSize = 'default' | 'sm';

/**
 * Type CwTabsOrientation
 *
 * @description
 * Direction of the list and of its arrow keys; `vertical` applies to the `bar` variant only.
 *
 * @type {'horizontal' | 'vertical'}
 */
export type CwTabsOrientation = 'horizontal' | 'vertical';

/**
 * Type CwTabsActivation
 *
 * @description
 * Whether the arrow keys activate the tab they reach (`automatic`) or only focus it (`manual`).
 *
 * @type {'automatic' | 'manual'}
 */
export type CwTabsActivation = 'automatic' | 'manual';

/**
 * Interface CwTabsConfig
 *
 * @description
 * Defaults of the `cw-tabs` below an injector, given to `provideCwTabs`.
 */
export interface CwTabsConfig {
  // #region Properties
  /**
   * Property variant
   * @readonly
   *
   * @description
   * Variant used when a `cw-tabs` sets none.
   *
   * @type {CwTabsVariant | undefined}
   */
  readonly variant?: CwTabsVariant;

  /**
   * Property size
   * @readonly
   *
   * @description
   * Size used when a `cw-tabs` sets none.
   *
   * @type {CwTabsSize | undefined}
   */
  readonly size?: CwTabsSize;
  // #endregion
}

/**
 * Type CwTabsLayout
 *
 * @description
 * The layout the list, the tabs and the indicator follow (`vertical` exists with `bar` only).
 * Internal to the entry point: not exported from it.
 *
 * @type {'segmented' | 'bar' | 'vertical'}
 */
export type CwTabsLayout = 'segmented' | 'bar' | 'vertical';
