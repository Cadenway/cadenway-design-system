/** Shape of the gauge: one continuous fill, whole blocks, or up to three series in one track. */
export type CwMeterVariant = 'bar' | 'segmented' | 'stacked';

/** Height of the track: 4 px (`sm`), 6 px (`default`), 10 px (`lg`). */
export type CwMeterSize = 'sm' | 'default' | 'lg';

/** Level of the value, as for the HTML `<meter>`: it gives the fill color and the note icon. */
export type CwMeterZone = 'normal' | 'high' | 'critical' | 'optimum';

/** One part of a `stacked` gauge: its legend label and its amount, in the unit of the range. */
export interface CwMeterSeries {
  /** Legend label (« Pièces jointes »). */
  readonly label: string;
  /** Amount, in the unit of `min` and `max`. */
  readonly value: number;
}

/** Writes a measured value for the header and `aria-valuetext` (« 6,4 Go sur 10 Go »). */
export type CwMeterFormat = (value: number, max: number) => string;
