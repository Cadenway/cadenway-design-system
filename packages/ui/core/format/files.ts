/* File wording shared by the drop zone and the attachment. */

import { ɵperLocale } from '../locale/locale';

/**
 * Constant FRENCH_UNITS
 *
 * @description
 * French byte-unit labels in increasing binary magnitude, capped at gigabytes: « octet » gives
 * « o », « Ko », « Mo », « Go » (mockup). `Intl` unit formatting writes « ko » instead, so the units
 * stay explicit.
 *
 * @type {readonly ['o', 'Ko', 'Mo', 'Go']}
 */
const FRENCH_UNITS: readonly ['o', 'Ko', 'Mo', 'Go'] = ['o', 'Ko', 'Mo', 'Go'];

/**
 * Constant BYTE_UNITS
 *
 * @description
 * Byte-unit labels of every language other than French, in the same magnitudes. `Intl` unit
 * formatting is not used: it writes « 512 byte » and « 312 kB » in English, where file managers
 * write « 512 B » and « 312 KB ».
 *
 * @type {readonly ['B', 'KB', 'MB', 'GB']}
 */
const BYTE_UNITS: readonly ['B', 'KB', 'MB', 'GB'] = ['B', 'KB', 'MB', 'GB'];

/**
 * Interface FileSizeFormats
 *
 * @description
 * Number formatters and unit labels of a file size in one locale.
 */
interface FileSizeFormats {
  // #region Properties
  /**
   * Property whole
   *
   * @description
   * Formatter of bytes and kilobytes, without decimal places.
   *
   * @type {Intl.NumberFormat}
   * @readonly
   */
  readonly whole: Intl.NumberFormat;

  /**
   * Property decimal
   *
   * @description
   * Formatter of megabytes and gigabytes, with at most one decimal place.
   *
   * @type {Intl.NumberFormat}
   * @readonly
   */
  readonly decimal: Intl.NumberFormat;

  /**
   * Property units
   *
   * @description
   * Unit labels from bytes to gigabytes.
   *
   * @type {readonly string[]}
   * @readonly
   */
  readonly units: readonly string[];
  // #endregion
}

/**
 * Constant FILE_SIZE
 *
 * @description
 * File size formats of a locale, built once per locale.
 *
 * @type {(locale: string) => FileSizeFormats}
 */
const FILE_SIZE: (locale: string) => FileSizeFormats = ɵperLocale((locale: string) => ({
  whole: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
  decimal: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
  units: new Intl.Locale(locale).language === 'fr' ? FRENCH_UNITS : BYTE_UNITS,
}));

/**
 * Function ɵformatFileSizeIn
 *
 * @description
 * A byte count in binary units, written in `locale`: « 312 Ko », « 2,4 Mo », « 50 Mo » in French
 * (1 Mo = 1 048 576 octets, mockup), « 312 KB », « 2.4 MB » in English. Bytes and kilobytes are
 * whole, larger units keep one decimal; a negative count reads as zero.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {number} bytes - File size in bytes; negative values are displayed as zero.
 * @param {string} locale - BCP 47 language tag, usually `inject(ɵLOCALE)`.
 *
 * @returns {string} Formatted count and unit, capped at gigabytes.
 */
export function ɵformatFileSizeIn(bytes: number, locale: string): string {
  const formats: FileSizeFormats = FILE_SIZE(locale);
  let value: number = Math.max(0, bytes);
  let unit: number = 0;
  while (value >= 1024 && unit < formats.units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const format: Intl.NumberFormat = unit >= 2 ? formats.decimal : formats.whole;
  return `${format.format(value)} ${formats.units[unit]}`;
}

/**
 * Function ɵformatFileSize
 *
 * @description
 * A byte count in French binary units: `ɵformatFileSizeIn(bytes, 'fr-FR')`. The bricks call
 * `ɵformatFileSizeIn` with the provided locale; this keeps its released signature, which the
 * packaging contract check pins.
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 *
 * @param {number} bytes - File size in bytes; negative values are displayed as zero.
 *
 * @returns {string} Formatted count and French unit, capped at Go.
 */
export function ɵformatFileSize(bytes: number): string {
  return ɵformatFileSizeIn(bytes, 'fr-FR');
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
