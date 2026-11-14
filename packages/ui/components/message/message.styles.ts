/*
 * Tone icons and words shared by the message and its note. Literal class strings (Message sheet and
 * preview of the Design System artifact), so Tailwind finds them in the compiled package. Icons are
 * always filled; yellow is never a text color.
 */

import type { CwMessageTone, CwMessageToneLabels } from './message.types';

/**
 * Constant TONE_ICONS
 *
 * @description
 * Filled icon and color for each non-default message tone.
 *
 * @type {typeof TONE_ICONS}
 */
export const TONE_ICONS: Record<
  Exclude<CwMessageTone, 'default'>,
  { name: string; color: string }
> = {
  info: { name: 'phosphorInfoFill', color: 'shrink-0 text-primary' },
  success: { name: 'phosphorCheckCircleFill', color: 'shrink-0 text-jade' },
  warning: { name: 'phosphorWarningFill', color: 'shrink-0 text-balise' },
  error: { name: 'phosphorWarningCircleFill', color: 'shrink-0 text-destructive' },
};

/**
 * Constant TONE_LABELS
 *
 * @description
 * Default French tone words read before a notice or note.
 *
 * @type {CwMessageToneLabels}
 */
export const TONE_LABELS: CwMessageToneLabels = {
  info: 'Information',
  success: 'Succès',
  warning: 'Avertissement',
  error: 'Erreur',
};

/**
 * Function toneRole
 *
 * @description
 * Selects an interrupting role for errors and a polite role for other non-default tones.
 * The default tone needs no live role because its thread is already a log.
 *
 * @param {CwMessageTone} tone - Tone of the message or note.
 *
 * @returns {'alert' | 'status' | null} Live role, or null for the default tone.
 */
export function toneRole(tone: CwMessageTone): 'alert' | 'status' | null {
  if (tone === 'error') return 'alert';
  return tone === 'default' ? null : 'status';
}

/**
 * Function phosphorName
 *
 * @description
 * Builds a registered Phosphor icon name from its kebab-case name and weight.
 *
 * @param {string} kebab - Kebab-case icon name, such as `lightning`.
 * @param {'Bold' | 'Fill'} weight - Icon weight suffix.
 *
 * @returns {string} Phosphor icon name with a PascalCase body.
 */
export function phosphorName(kebab: string, weight: 'Bold' | 'Fill'): string {
  const pascal: string = kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  // An icon name, not a class name: ng-icon looks it up in the registered icon sets.
  return `phosphor${pascal}${weight}`;
}
