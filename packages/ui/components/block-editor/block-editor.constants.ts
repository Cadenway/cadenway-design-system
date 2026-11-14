import type {
  CwBlockEditorLabels,
  CwBlockKind,
  CwBlockType,
  CwInlineMarkButton,
} from './block-editor.types';

/**
 * Constant CW_BLOCK_TYPES
 *
 * @description
 * The ten block types of the mockup (App.dc.html, `BLOCK_TYPES`), in its order, with its labels, icons and Markdown hints: the default entries of the « / » menu.
 *
 * @type {readonly CwBlockType[]}
 */
export const CW_BLOCK_TYPES: readonly CwBlockType[] = [
  { kind: 'p', label: 'Texte', icon: 'phosphorTextTBold', hint: '' },
  { kind: 'h1', label: 'Titre 1', icon: 'phosphorTextHOneBold', hint: '#' },
  { kind: 'h2', label: 'Titre 2', icon: 'phosphorTextHTwoBold', hint: '##' },
  { kind: 'h3', label: 'Titre 3', icon: 'phosphorTextHThreeBold', hint: '###' },
  { kind: 'li', label: 'Liste à puces', icon: 'phosphorListBulletsBold', hint: '-' },
  { kind: 'ol', label: 'Liste numérotée', icon: 'phosphorListNumbersBold', hint: '1.' },
  { kind: 'todo', label: 'Liste de tâches', icon: 'phosphorCheckSquareBold', hint: '[]' },
  { kind: 'quote', label: 'Citation', icon: 'phosphorQuotesBold', hint: '>' },
  { kind: 'code', label: 'Bloc de code', icon: 'phosphorCodeBlockBold', hint: '```' },
  { kind: 'hr', label: 'Séparateur', icon: 'phosphorMinusBold', hint: '---' },
];

/**
 * Constant CW_INLINE_MARKS
 *
 * @description
 * The five inline marks of the mockup, in its order: bold, italic, underline, strike, code.
 *
 * @type {readonly CwInlineMarkButton[]}
 */
export const CW_INLINE_MARKS: readonly CwInlineMarkButton[] = [
  { mark: 'bold', label: 'Gras', icon: 'phosphorTextBBold', shortcut: ['Ctrl', 'B'] },
  { mark: 'italic', label: 'Italique', icon: 'phosphorTextItalicBold', shortcut: ['Ctrl', 'I'] },
  {
    mark: 'underline',
    label: 'Souligné',
    icon: 'phosphorTextUnderlineBold',
    shortcut: ['Ctrl', 'U'],
  },
  {
    mark: 'strike',
    label: 'Barré',
    icon: 'phosphorTextStrikethroughBold',
    shortcut: ['Ctrl', 'Maj', 'X'],
  },
  { mark: 'code', label: 'Code', icon: 'phosphorCodeBold', shortcut: ['Ctrl', 'E'] },
];

/**
 * Constant CW_TOOLBAR_BLOCKS
 *
 * @description
 * The block buttons of the document toolbar (mockup App.dc.html, `blockBtns`).
 *
 * @type {readonly CwBlockKind[]}
 */
export const CW_TOOLBAR_BLOCKS: readonly CwBlockKind[] = [
  'li',
  'ol',
  'todo',
  'quote',
  'code',
  'hr',
];

/**
 * Constant CW_BLOCK_EDITOR_LABELS
 *
 * @description
 * Default French texts of `cw-block-editor` (mockup App.dc.html and CommentComposer sheet).
 *
 * @type {CwBlockEditorLabels}
 */
export const CW_BLOCK_EDITOR_LABELS: CwBlockEditorLabels = {
  toolbar: 'Mise en forme',
  blockType: 'Type de bloc',
  blockMenu: 'Blocs',
  mentionMenu: 'Personnes',
  noResults: 'Aucun résultat',
  oneResult: '1 résultat',
  manyResults: '{count} résultats',
  choose: 'choisir',
  insert: 'insérer',
  up: 'Haut',
  down: 'Bas',
  enter: 'Entrée',
  link: 'Lien',
  linkPanel: 'Insérer un lien',
  linkUrl: 'Adresse du lien',
  linkPlaceholder: 'https://…',
  linkApply: 'Insérer',
  emptyBlock: 'Tapez « / » pour insérer un bloc',
  check: 'Cocher « {text} »',
  uncheck: 'Décocher « {text} »',
  task: 'tâche',
};
