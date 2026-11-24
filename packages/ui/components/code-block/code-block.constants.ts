import type { CwCodeBlockLabels } from './code-block.types';

/**
 * Constant CW_CODE_BLOCK_LABELS
 *
 * @description
 * Default texts from the CodeBlock sheet of the Design System artifact.
 *
 * @type {CwCodeBlockLabels}
 */
export const CW_CODE_BLOCK_LABELS: CwCodeBlockLabels = {
  code: 'Code',
  lines: (count) => `${String(count)} ${count > 1 ? 'lignes' : 'ligne'}`,
  copyLabel: 'Copier le code',
  copiedLabel: 'Copié',
  addedLabel: 'ajouté',
  removedLabel: 'retiré',
};
