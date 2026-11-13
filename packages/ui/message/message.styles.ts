/*
 * Tone icons and words shared by the message and its note. Literal class strings (Message sheet and
 * preview of the Design System artifact), so Tailwind finds them in the compiled package. Icons are
 * always filled; yellow is never a text color.
 */

import type { CwMessageTone, CwMessageToneLabels } from './message.types';

/** Filled icon and its color, per tone (`default` has none of its own). */
export const TONE_ICONS: Record<
  Exclude<CwMessageTone, 'default'>,
  { name: string; color: string }
> = {
  info: { name: 'phosphorInfoFill', color: 'shrink-0 text-primary' },
  success: { name: 'phosphorCheckCircleFill', color: 'shrink-0 text-jade' },
  warning: { name: 'phosphorWarningFill', color: 'shrink-0 text-balise' },
  error: { name: 'phosphorWarningCircleFill', color: 'shrink-0 text-destructive' },
};

/** The tone word read before the text. */
export const TONE_LABELS: CwMessageToneLabels = {
  info: 'Information',
  success: 'Succès',
  warning: 'Avertissement',
  error: 'Erreur',
};

/** Live role per tone: an error interrupts, the other tones wait; `default` has none (the thread
 * is already a `log`). */
export function toneRole(tone: CwMessageTone): 'alert' | 'status' | null {
  if (tone === 'error') return 'alert';
  return tone === 'default' ? null : 'status';
}

/** `phosphor` + PascalCase + weight from a kebab-case Phosphor name (`lightning`). */
export function phosphorName(kebab: string, weight: 'Bold' | 'Fill'): string {
  const pascal = kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  // An icon name, not a class name: ng-icon looks it up in the registered icon sets.
  return `phosphor${pascal}${weight}`;
}
