import type { CwToastTone } from './toast.types';

/**
 * Default duration of each tone, in milliseconds: 6 s as in the mockup (`App.dc.html`, every toast
 * closes after 6000 ms); an error and a running operation stay until closed or updated.
 * `cw-toaster`'s `duration` overrides any of them.
 */
export const CW_TOAST_DURATIONS: Readonly<Record<CwToastTone, number>> = {
  default: 6000,
  success: 6000,
  info: 6000,
  warning: 6000,
  error: Infinity,
  loading: Infinity,
};
