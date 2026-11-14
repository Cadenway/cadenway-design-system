/**
 * Type CwSelectSize
 *
 * @description
 * Height, padding and radius of the trigger, aligned on Input; the panel keeps one size.
 *
 * @type {'sm' | 'default' | 'lg'}
 */
export type CwSelectSize = 'sm' | 'default' | 'lg';

/**
 * Type CwSelectCompareWith
 *
 * @description
 * Tells whether two option values are the same choice (object values compared by id, say).
 *
 * @type {(a: T, b: T) => boolean}
 */
export type CwSelectCompareWith<T> = (a: T, b: T) => boolean;
