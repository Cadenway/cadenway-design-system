/**
 * Type CwProgressVariant
 *
 * @description
 * Fill color: ink by default, jade for completion, grenat for an overrun, and `primary` violet
 * where the mockup draws the bar in the brand color (`App.dc.html`, the getting-started bar).
 *
 * @type {'default' | 'success' | 'destructive' | 'primary'}
 */
export type CwProgressVariant = 'default' | 'success' | 'destructive' | 'primary';

/**
 * Type CwProgressSize
 *
 * @description
 * Track height: four, six or eight pixels for small, default or large respectively.
 *
 * @type {'sm' | 'default' | 'lg'}
 */
export type CwProgressSize = 'sm' | 'default' | 'lg';

/**
 * Type CwProgressState
 *
 * @description
 * Progress state represented by a partial fill, a complete track or an unknown amount.
 *
 * @type {'loading' | 'complete' | 'indeterminate'}
 */
export type CwProgressState = 'loading' | 'complete' | 'indeterminate';
