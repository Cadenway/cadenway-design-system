/*
 * Size formatting and file icons shared by the drop zone and its file rows. Internal to the entry
 * point. `@cadenway/ui/attachment` holds the same size rule: both belong in `@cadenway/ui/core` once
 * a shared helper can be added there.
 */

const UNITS = ['o', 'Ko', 'Mo', 'Go'] as const;
const WHOLE = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/**
 * A byte count in French binary units, as the mockup writes them: « 312 Ko », « 2,4 Mo », « 50 Mo »
 * (1 Mo = 1 048 576 octets, so the default 52 428 800 reads « 50 Mo »).
 */
export function formatFileSize(bytes: number): string {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const format = unit >= 2 ? DECIMAL : WHOLE;
  return `${format.format(value)} ${UNITS[unit]}`;
}

/** Lower-case extension of a file name, without the dot; empty when there is none. */
export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

const ICONS: Record<string, string> = {
  pdf: 'phosphorFilePdfBold',
  csv: 'phosphorFileCsvBold',
  zip: 'phosphorFileZipBold',
  png: 'phosphorFileImageBold',
  jpg: 'phosphorFileImageBold',
  jpeg: 'phosphorFileImageBold',
  gif: 'phosphorFileImageBold',
  webp: 'phosphorFileImageBold',
  svg: 'phosphorFileImageBold',
  avif: 'phosphorFileImageBold',
};

/** The neutral type icon of a file, chosen by extension (Dropzone sheet: no color per type). */
export function fileIcon(name: string): string {
  return ICONS[extensionOf(name)] ?? 'phosphorFileBold';
}
