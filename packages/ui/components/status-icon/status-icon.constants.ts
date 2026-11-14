import type { CwStatusKey } from './status-icon.types';

/**
 * Constant CW_STATUS_LABELS
 *
 * @description
 * The French word of each status, word for word from the mockup (`StatutTache.dc.html`). The icon
 * never stands alone: write this word next to it (or the consumer's own wording).
 *
 * @type {Readonly<Record<CwStatusKey, string>>}
 */
export const CW_STATUS_LABELS: Readonly<Record<CwStatusKey, string>> = {
  triage: 'À trier',
  backlog: 'À planifier',
  todo: 'À faire',
  progress: 'En cours',
  review: 'En revue',
  testing: 'En validation',
  waiting: 'En attente',
  blocked: 'Bloqué',
  done: 'Terminé',
  cancelled: 'Annulé',
};
