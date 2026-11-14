/**
 * Type CwProgressVariant
 *
 * @description
 * Fill color: ink by default, jade for completion and grenat for an overrun.
 *
 * @type {'default' | 'success' | 'destructive'}
 */
export type CwProgressVariant = 'default' | 'success' | 'destructive';

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
