/* File wording shared by the drop zone and the attachment. */

/**
 * Constant UNITS
 *
 * @description
 * French byte-unit labels in increasing binary magnitude, capped at gigabytes.
 *
 * @type {readonly ['o', 'Ko', 'Mo', 'Go']}
 */
const UNITS: readonly ['o', 'Ko', 'Mo', 'Go'] = ['o', 'Ko', 'Mo', 'Go'];

/**
 * Constant WHOLE
 *
 * @description
 * French number formatter for byte and kilobyte counts without decimal places.
 *
 * @type {Intl.NumberFormat}
 */
const WHOLE: Intl.NumberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/**
 * Constant DECIMAL
 *
 * @description
 * French number formatter for larger units with at most one decimal place.
 *
 * @type {Intl.NumberFormat}
 */
const DECIMAL: Intl.NumberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/**
 * Function ɵformatFileSize
 *
 * @description
 * A byte count in French binary units, as the mockup writes them: « 312 Ko », « 2,4 Mo », « 50 Mo »
 * (1 Mo = 1 048 576 octets). Bytes and kilobytes are whole, larger units keep one decimal; a
 * negative count reads « 0 o ».
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {number} bytes - File size in bytes; negative values are displayed as zero.
 *
 * @returns {string} Formatted count and French unit, capped at Go.
 */
export function ɵformatFileSize(bytes: number): string {
  let value: number = Math.max(0, bytes);
  let unit: number = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const format: Intl.NumberFormat = unit >= 2 ? DECIMAL : WHOLE;
  return `${format.format(value)} ${UNITS[unit]}`;
}

/**
 * Function ɵextensionOf
 *
 * @description
 * The lower-case extension of a file name, without the dot; empty when there is none (a dot in
 * first position starts a hidden name, not an extension).
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {string} name - File name to inspect.
 *
 * @returns {string} Lower-case extension, or an empty string when no extension is present.
 */
export function ɵextensionOf(name: string): string {
  const dot: number = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}
