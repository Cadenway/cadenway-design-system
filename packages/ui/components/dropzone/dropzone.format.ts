/*
 * File icons of the drop zone and its file rows. Internal to the entry point; the size wording and
 * the extension come from `@cadenway/ui/core`.
 */

import { ɵextensionOf } from '@cadenway/ui/core';

/**
 * Constant ICONS
 *
 * @description
 * Neutral file icon names indexed by known filename extensions.
 *
 * @type {Record<string, string>}
 */
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

/**
 * Function fileIcon
 *
 * @description
 * Returns a neutral file icon selected from the filename extension.
 *
 * @param {string} name - File name whose extension selects the icon.
 *
 * @returns {string} Neutral icon name for the extension.
 */
export function fileIcon(name: string): string {
  return ICONS[ɵextensionOf(name)] ?? 'phosphorFileBold';
}
