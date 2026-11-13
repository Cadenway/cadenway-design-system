/** Look of a tab set: pills in a track (`segmented`) or underlined tabs (`bar`). */
export type CwTabsVariant = 'segmented' | 'bar';

/** Height of a tab set: `default` (32 px track, 36 px bar) or `sm` (28 px). */
export type CwTabsSize = 'default' | 'sm';

/** Direction of the list and of its arrow keys; `vertical` applies to the `bar` variant only. */
export type CwTabsOrientation = 'horizontal' | 'vertical';

/** Whether the arrow keys activate the tab they reach (`automatic`) or only focus it (`manual`). */
export type CwTabsActivation = 'automatic' | 'manual';

/** Defaults of the `cw-tabs` below an injector, given to `provideCwTabs`. */
export interface CwTabsConfig {
  /** Variant used when a `cw-tabs` sets none. */
  readonly variant?: CwTabsVariant;
  /** Size used when a `cw-tabs` sets none. */
  readonly size?: CwTabsSize;
}

/**
 * The layout the list, the tabs and the indicator follow (`vertical` exists with `bar` only).
 * Internal to the entry point: not exported from it.
 */
export type CwTabsLayout = 'segmented' | 'bar' | 'vertical';
