/*
 * Type detection and icons of an attachment. Internal to the entry point; the size wording and the
 * extension come from `@cadenway/ui/core`.
 */

import { ɵextensionOf } from '@cadenway/ui/core';

import type { CwAttachmentType } from './attachment.types';

const IMAGES = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif']);

/**
 * The attachment type when none is given: from the MIME type when known, else from the extension of
 * the name; a name without extension that points to a web address is a link.
 */
export function detectType(name: string, mimeType: string, href: string): CwAttachmentType {
  const mime = mimeType.toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime !== '') return 'file';
  const extension = ɵextensionOf(name);
  if (IMAGES.has(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (extension === '' && /^https?:\/\//i.test(href)) return 'link';
  return 'file';
}

const FILE_ICONS: Record<string, string> = {
  csv: 'phosphorFileCsvBold',
  zip: 'phosphorFileZipBold',
};

/** The neutral type icon (Attachment sheet: color is kept for errors). */
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

/** The host name of a link, shown on its second line (« github.com »); the address when unparsable. */
export function domainOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}
