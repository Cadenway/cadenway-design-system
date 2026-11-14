/*
 * Type detection and icons of an attachment. Internal to the entry point; the size wording and the
 * extension come from `@cadenway/ui/core`.
 */

import { ɵextensionOf } from '@cadenway/ui/core';

import type { CwAttachmentType } from './attachment.types';

/**
 * Constant IMAGES
 *
 * @description
 * Filename extensions recognized as images.
 *
 * @type {Set<string>}
 */
const IMAGES: Set<string> = new Set<string>(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif']);

/**
 * Function detectType
 *
 * @description
 * The attachment type when none is given: from the MIME type when known, else from the extension of
 * the name; a name without extension that points to a web address is a link.
 *
 * @param {string} name - File name used to infer the extension.
 * @param {string} mimeType - MIME type, or an empty string when unknown.
 * @param {string} href - Address used to recognize links without an extension.
 * @returns {CwAttachmentType} Detected media type, falling back to a file.
 */
export function detectType(name: string, mimeType: string, href: string): CwAttachmentType {
  const mime: string = mimeType.toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime !== '') return 'file';
  const extension: string = ɵextensionOf(name);
  if (IMAGES.has(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (extension === '' && /^https?:\/\//i.test(href)) return 'link';
  return 'file';
}

/**
 * Constant FILE_ICONS
 *
 * @description
 * Neutral icon names for recognized non-image file extensions.
 *
 * @type {Record<string, string>}
 */
const FILE_ICONS: Record<string, string> = {
  csv: 'phosphorFileCsvBold',
  zip: 'phosphorFileZipBold',
};

/**
 * Function typeIcon
 *
 * @description
 * Chooses a neutral icon for an attachment type and filename.
 *
 * @param {CwAttachmentType} type - Detected or explicitly supplied media type.
 * @param {string} name - File name used to distinguish supported file extensions.
 * @returns {string} Registered icon name for the type and extension.
 */
export function typeIcon(type: CwAttachmentType, name: string): string {
  switch (type) {
    case 'image':
      return 'phosphorFileImageBold';
    case 'pdf':
      return 'phosphorFilePdfBold';
    case 'link':
      return 'phosphorLinkSimpleBold';
    default:
      return FILE_ICONS[ɵextensionOf(name)] ?? 'phosphorFileBold';
  }
}

/**
 * Function domainOf
 *
 * @description
 * Returns a link hostname without www, or the original address when it cannot be parsed.
 *
 * @param {string} href - Address to parse.
 * @returns {string} Hostname without the www prefix, or the original address if invalid.
 */
export function domainOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}
