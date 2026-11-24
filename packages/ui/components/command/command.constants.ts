import { matchScore } from './command.match';
import type { CwCommandFilter, CwCommandLabels } from './command.types';

/**
 * Function cwCommandFuzzyFilter
 *
 * @description
 * The default filter of `cw-command`: a fuzzy match that ignores case and accents. The label
 * scores 1 when it starts with the search, 0.9 when a word does, 0.8 when it contains it, less when
 * only its letters appear in order; a keyword match counts 90 %. 0 hides the item.
 *
 * @param {string} value - Item text to score.
 * @param {string} search - Search query.
 * @param {readonly string[]} keywords - Alternative terms associated with the item.
 * @returns {number} Highest match score, with keyword matches weighted at 90 percent.
 */
export const cwCommandFuzzyFilter: CwCommandFilter = (
  value: string,
  search: string,
  keywords: readonly string[],
): number =>
  Math.max(
    matchScore(value, search),
    ...keywords.map((keyword) => matchScore(keyword, search) * 0.9),
  );

/**
 * Constant CW_COMMAND_LABELS
 *
 * @description
 * Default texts from the Command sheet of the Design System artifact.
 *
 * @type {CwCommandLabels}
 */
export const CW_COMMAND_LABELS: CwCommandLabels = {
  dialogLabel: 'Palette de commandes',
  emptyText: 'Aucun résultat pour « {search} »',
  navigateLabel: 'naviguer',
  runLabel: 'ouvrir',
  closeLabel: 'fermer',
  enterKey: 'Entrée',
  escapeKey: 'Échap',
  listLabel: 'Résultats',
  loadingLabel: 'Recherche…',
  resultsNone: 'Aucun résultat',
  resultsOne: '1 résultat',
  resultsMany: (count: number) => `${String(count)} résultats`,
};
