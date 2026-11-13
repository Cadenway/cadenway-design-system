import type { CwPriorityKey } from './priority-icon.types';

/**
 * The French word of each priority, word for word from the mockup (`PrioriteTache.dc.html`). The
 * icon never stands alone: write this word next to it (or the consumer's own wording).
 */
export const CW_PRIORITY_LABELS: Readonly<Record<CwPriorityKey, string>> = {
  urgente: 'Urgente',
  haute: 'Haute',
  moyenne: 'Moyenne',
  basse: 'Basse',
};
