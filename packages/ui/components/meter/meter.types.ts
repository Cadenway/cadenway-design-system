/**
 * Type CwMeterVariant
 *
 * @description
 * Gauge rendered as a continuous bar, blocks or stacked series.
 *
 * @type {'bar' | 'segmented' | 'stacked'}
 */
export type CwMeterVariant = 'bar' | 'segmented' | 'stacked';

/**
 * Type CwMeterSize
 *
 * @description
 * Track height from 4 px to 10 px.
 *
 * @type {'sm' | 'default' | 'lg'}
 */
export type CwMeterSize = 'sm' | 'default' | 'lg';

/**
 * Type CwMeterZone
 *
 * @description
 * Value level determining the fill color and note icon.
 *
 * @type {'normal' | 'high' | 'critical' | 'optimum'}
 */
export type CwMeterZone = 'normal' | 'high' | 'critical' | 'optimum';

/**
 * Interface CwMeterSeries
 *
 * @description
 * A labeled amount within a stacked gauge.
 */
export interface CwMeterSeries {
  // #region Properties
  /**
   * Property label
   * @readonly
   *
   * @description
   * Legend label for the series.
   *
   * @type {string}
   */
  readonly label: string;

  /**
   * Property value
   * @readonly
   *
   * @description
   * Amount in the gauge range's unit.
   *
   * @type {number}
   */
  readonly value: number;
  // #endregion
}

/**
 * Type CwMeterFormat
 *
 * @description
 * Formats a measured value and maximum for the header and accessible value text.
 *
 * @type {(value: number, max: number) => string}
 */
export type CwMeterFormat = (value: number, max: number) => string;
