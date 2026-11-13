/*
 * Size formatting and type detection of an attachment. Internal to the entry point.
 * `@cadenway/ui/dropzone` holds the same size rule: both belong in `@cadenway/ui/core` once a shared
 * helper can be added there.
 */

import type { CwAttachmentType } from './attachment.types';

const UNITS = ['o', 'Ko', 'Mo', 'Go'] as const;
const WHOLE = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** A byte count in French binary units, as the mockup writes them: « 312 Ko », « 2,4 Mo ». */
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
  const extension = extensionOf(name);
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
      return FILE_ICONS[extensionOf(name)] ?? 'phosphorFileBold';
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
