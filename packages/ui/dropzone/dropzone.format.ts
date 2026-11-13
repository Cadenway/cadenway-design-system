/*
 * File icons of the drop zone and its file rows. Internal to the entry point; the size wording and
 * the extension come from `@cadenway/ui/core`.
 */

import { ɵextensionOf } from '@cadenway/ui/core';

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
  return ICONS[ɵextensionOf(name)] ?? 'phosphorFileBold';
}
