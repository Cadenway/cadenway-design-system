/* File wording shared by the drop zone and the attachment. */

const UNITS = ['o', 'Ko', 'Mo', 'Go'] as const;
const WHOLE = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/**
 * A byte count in French binary units, as the mockup writes them: « 312 Ko », « 2,4 Mo », « 50 Mo »
 * (1 Mo = 1 048 576 octets). Bytes and kilobytes are whole, larger units keep one decimal; a
 * negative count reads « 0 o ».
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵformatFileSize(bytes: number): string {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const format = unit >= 2 ? DECIMAL : WHOLE;
  return `${format.format(value)} ${UNITS[unit]}`;
}

/**
 * The lower-case extension of a file name, without the dot; empty when there is none (a dot in
 * first position starts a hidden name, not an extension).
 *
 * Shared across the entry points of `@cadenway/ui`; not public API (`ɵ` prefix).
 */
export function ɵextensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}
