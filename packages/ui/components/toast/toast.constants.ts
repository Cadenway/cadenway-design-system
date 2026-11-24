import type { CwToastLabels, CwToastTone } from './toast.types';

/**
 * Constant CW_TOAST_DURATIONS
 *
 * @description
 * Default duration of each tone, in milliseconds: 6 s as in the mockup (`App.dc.html`, every toast
 * closes after 6000 ms); an error and a running operation stay until closed or updated.
 * `cw-toaster`'s `duration` overrides any of them.
 *
 * @type {Readonly<Record<CwToastTone, number>>}
 */
export const CW_TOAST_DURATIONS: Readonly<Record<CwToastTone, number>> = {
  default: 6000,
  success: 6000,
  info: 6000,
  warning: 6000,
  error: Infinity,
  loading: Infinity,
};

/**
 * Constant CW_TOAST_LABELS
 *
 * @description
 * Default texts from the Toast sheet of the Design System artifact.
 *
 * @type {CwToastLabels}
 */
export const CW_TOAST_LABELS: CwToastLabels = {
  undo: 'Annuler',
  close: 'Fermer la notification',
  ariaLabel: 'Notifications (F8)',
  older: (count) => `+${String(count)} plus anciennes`,
};
