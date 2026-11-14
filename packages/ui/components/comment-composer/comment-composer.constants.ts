import type { CwCommentComposerLabels, CwComposerCommand } from './comment-composer.types';

/**
 * Constant CW_COMPOSER_COMMANDS
 *
 * @description
 * The blocks offered after « / » by default (CommentComposer sheet, `commands`: title, lists, box,
 * code, quote), with the labels and Markdown hints of its preview.
 *
 * @type {readonly CwComposerCommand[]}
 */
export const CW_COMPOSER_COMMANDS: readonly CwComposerCommand[] = [
  { kind: 'h2', label: 'Titre', hint: '##' },
  { kind: 'li', label: 'Liste à puces', hint: '-' },
  { kind: 'ol', label: 'Liste numérotée', hint: '1.' },
  { kind: 'todo', label: 'Case à cocher', hint: '[ ]' },
  { kind: 'code', label: 'Bloc de code', hint: '```' },
  { kind: 'quote', label: 'Citation', hint: '>' },
];

/**
 * Constant CW_COMMENT_COMPOSER_LABELS
 *
 * @description
 * Default French texts of `cw-comment-composer` from the design system sheet and preview.
 *
 * @type {CwCommentComposerLabels}
 */
export const CW_COMMENT_COMPOSER_LABELS: CwCommentComposerLabels = {
  editor: 'Commentaire',
  toolbar: 'Mise en forme',
  formatting: 'Mise en forme',
  bold: 'Gras',
  italic: 'Italique',
  link: 'Lien',
  bulletList: 'Liste à puces',
  code: 'Code',
  mention: 'Mentionner une personne',
  attach: 'Joindre un fichier',
  send: 'Envoyer',
  save: 'Enregistrer',
  cancel: 'Annuler',
  retry: 'Réessayer',
  sendKeys: ['Ctrl', 'Entrée'],
};
