/*
 * The Tiptap set-up of `cw-block-editor`: the one place of the design system that imports
 * `@tiptap/*` (cw-brick-recipes, `cw-block-editor`; .claude/rules/bricks.md). Internal to the entry
 * point.
 */

import { ɵcreateMarked, ɵwriteMention } from '@cadenway/ui/components/markdown';
import {
  type AnyExtension,
  type ChainedCommands,
  type Editor,
  Extension,
  type Mark,
  type MarkdownToken,
  Node,
  type Range,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { Markdown, type MarkdownExtensionOptions } from '@tiptap/markdown';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { PluginKey } from '@tiptap/pm/state';
import { StarterKit } from '@tiptap/starter-kit';
import { Suggestion, type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';

import type { CwBlockKind, CwBlockType, CwMentionPerson } from './block-editor.types';

/**
 * Interface SuggestionRenderer
 *
 * @description
 * The callbacks of a suggestion menu, given by the component that draws it.
 */
export interface SuggestionRenderer<I> {
  // #region Methods
  /**
   * Method start
   *
   * @description
   * Opens the suggestion menu.
   *
   * @param {SuggestionProps<I, I>} props - Suggestion state or keyboard event.
   */
  start(props: SuggestionProps<I, I>): void;

  /**
   * Method update
   *
   * @description
   * Updates the suggestion menu.
   *
   * @param {SuggestionProps<I, I>} props - Suggestion state or keyboard event.
   */
  update(props: SuggestionProps<I, I>): void;

  /**
   * Method keyDown
   *
   * @description
   * Handles a key event in the suggestion menu.
   *
   * @param {SuggestionKeyDownProps} props - Suggestion state or keyboard event.
   * @returns {boolean} Whether the key event was handled.
   */
  keyDown(props: SuggestionKeyDownProps): boolean;

  /**
   * Method exit
   *
   * @description
   * Closes the suggestion menu.
   */
  exit(): void;
  // #endregion
}

/**
 * Interface EditorHooks
 *
 * @description
 * What the extensions ask of the component.
 */
export interface EditorHooks {
  // #region Methods
  /**
   * Method placeholder
   *
   * @description
   * Placeholder of an empty node; `alone` when it is the only block of the document.
   *
   * @param {ProseMirrorNode} node - Document node to inspect.
   * @param {boolean} alone - Whether the node is the only document block.
   * @returns {string} Placeholder for the node.
   */
  placeholder(node: ProseMirrorNode, alone: boolean): string;

  /**
   * Method checkboxLabel
   *
   * @description
   * Name of a task box from its text and state.
   *
   * @param {string} text - Task text.
   * @param {boolean} checked - Whether the task is checked.
   * @returns {string} Accessible task checkbox label.
   */
  checkboxLabel(text: string, checked: boolean): string;
  // #endregion
  // #region Properties
  /**
   * Property maxLength
   *
   * @description
   * Maximum number of characters, read when the editor starts.
   *
   * @type {number | null}
   */
  maxLength: number | null;
  // #endregion
  // #region Methods
  /**
   * Method blockItems
   *
   * @description
   * The « / » entries matching a query; empty disables the menu.
   *
   * @param {string} query - Query used to filter suggestions.
   * @returns {CwBlockType[]} Block types matching the query.
   */
  blockItems(query: string): CwBlockType[];

  /**
   * Method blocksEnabled
   *
   * @description
   * Checks whether block suggestions are enabled.
   * @returns {boolean} Whether block suggestions are enabled.
   */
  blocksEnabled(): boolean;
  // #endregion
  // #region Properties
  /**
   * Property blockMenu
   *
   * @description
   * Renderer for block suggestions.
   *
   * @type {SuggestionRenderer<CwBlockType>}
   */
  blockMenu: SuggestionRenderer<CwBlockType>;
  // #endregion
  // #region Methods
  /**
   * Method mentionItems
   *
   * @description
   * The people matching a query.
   *
   * @param {string} query - Query used to filter suggestions.
   * @param {AbortSignal} signal - Signal used to cancel the search.
   * @returns {Promise<CwMentionPerson[]>} Promise resolving to matching people.
   */
  mentionItems(query: string, signal: AbortSignal): Promise<CwMentionPerson[]>;

  /**
   * Method mentionsEnabled
   *
   * @description
   * Checks whether mention suggestions are enabled.
   * @returns {boolean} Whether mention suggestions are enabled.
   */
  mentionsEnabled(): boolean;
  // #endregion
  // #region Properties
  /**
   * Property mentionMenu
   *
   * @description
   * Renderer for mention suggestions.
   *
   * @type {SuggestionRenderer<CwMentionPerson>}
   */
  mentionMenu: SuggestionRenderer<CwMentionPerson>;
  // #endregion
  // #region Methods
  /**
   * Method submit
   *
   * @description
   * Ctrl + Entrée (⌘ + Entrée).
   */
  submit(): void;

  /**
   * Method link
   *
   * @description
   * Ctrl + K.
   */
  link(): void;
  // #endregion
}

/* Bold is `**text**` only, `__text__` is underline (cw-brick-recipes, the shared `__underline__`
   rule). Tiptap's Bold also takes `__`: its input and paste rules are replaced by the star ones and
   Underline gets the underscore ones. Patterns of @tiptap/extension-bold. */
/**
 * Constant STAR_INPUT
 *
 * @description
 * Input pattern for bold text.
 *
 * @type {RegExp}
 */
const STAR_INPUT: RegExp = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/;
/**
 * Constant STAR_PASTE
 *
 * @description
 * Paste pattern for bold text.
 *
 * @type {RegExp}
 */
const STAR_PASTE: RegExp = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g;
/**
 * Constant UNDERSCORE_INPUT
 *
 * @description
 * Input pattern for underlined text.
 *
 * @type {RegExp}
 */
const UNDERSCORE_INPUT: RegExp = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/;
/**
 * Constant UNDERSCORE_PASTE
 *
 * @description
 * Paste pattern for underlined text.
 *
 * @type {RegExp}
 */
const UNDERSCORE_PASTE: RegExp = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g;

/* Mockup App.dc.html: links accept http(s), mailto and tel addresses, or a relative one. */
/**
 * Constant SAFE_LINK
 *
 * @description
 * Allowed explicit link schemes and relative prefixes.
 *
 * @type {RegExp}
 */
const SAFE_LINK: RegExp = /^(?:https?:|mailto:|tel:|\/|#|\?)/i;

/**
 * Function isSafeLink
 *
 * @description
 * Checks whether a link uses an allowed scheme or relative address.
 *
 * @param {string} url - Link address to validate.
 * @returns {boolean} Whether the link is allowed.
 */
function isSafeLink(url: string): boolean {
  const compact: string = url.trim();
  return SAFE_LINK.test(compact) || !/^[a-z][a-z0-9+.-]*:/i.test(compact);
}

/* The mention chip of the CommentComposer sheet (anatomy 4): neutral, never colored. */
/**
 * Constant MENTION_CLASSES
 *
 * @description
 * Classes applied to an inserted mention.
 *
 * @type {string}
 */
const MENTION_CLASSES: string =
  'rounded-sm bg-secondary px-1 py-px font-medium whitespace-nowrap text-secondary-foreground';
/* The token being typed while its menu is open (CommentComposer sheet, anatomy 5). */
/**
 * Constant TOKEN_CLASSES
 *
 * @description
 * Classes applied to a suggestion token.
 *
 * @type {string}
 */
const TOKEN_CLASSES: string = 'rounded-sm bg-selected px-0.5';

/**
 * Function cadenwayKit
 *
 * @description
 * Configures the base editor kit and Markdown mark rules.
 * @returns {AnyExtension} Configured base editor extension.
 */
function cadenwayKit(): AnyExtension {
  return StarterKit.configure({
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      defaultProtocol: 'https',
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer', class: null },
      isAllowedUri: (url, context) => context.defaultValidate(url) && isSafeLink(url),
    },
    underline: {},
    trailingNode: {},
  }).extend({
    // StarterKit registers Bold and Underline; they are adjusted here rather than registered a
    // second time (cw-brick-recipes, `cw-block-editor`).
    addExtensions() {
      return (this.parent?.() ?? []).map((extension) => {
        if (extension.name === 'bold') {
          return (extension as Mark).extend({
            parseMarkdown: (token: MarkdownToken, helpers) =>
              helpers.applyMark(
                token.raw?.startsWith('__') ? 'underline' : 'bold',
                helpers.parseInline(token.tokens ?? []),
              ),
            addInputRules() {
              return [markInputRule({ find: STAR_INPUT, type: this.type })];
            },
            addPasteRules() {
              return [markPasteRule({ find: STAR_PASTE, type: this.type })];
            },
          });
        }
        if (extension.name === 'underline') {
          return (extension as Mark).extend({
            // Tiptap writes `<u>…</u>`; Cadenway writes `__…__`, read back by cw-markdown.
            renderMarkdown: (node, helpers) => `__${helpers.renderChildren(node)}__`,
            addInputRules() {
              return [markInputRule({ find: UNDERSCORE_INPUT, type: this.type })];
            },
            addPasteRules() {
              return [markPasteRule({ find: UNDERSCORE_PASTE, type: this.type })];
            },
          });
        }
        return extension;
      });
    },
  });
}

/* A mention: an atom inline node, stored as `@[label](id)` (the shared grammar of cw-markdown). */
/**
 * Constant Mention
 *
 * @description
 * Tiptap node for an inline Markdown mention.
 *
 * @type {Node<any, any>}
 */
const Mention: Node = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      id: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-id') ?? '',
        renderHTML: (attributes: { id: string }) => ({ 'data-id': attributes.id }),
      },
      label: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-label') ?? '',
        renderHTML: (attributes: { label: string }) => ({ 'data-label': attributes.label }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-mention]' }];
  },

  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: ProseMirrorNode;
    HTMLAttributes: Record<string, unknown>;
  }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-mention': '', class: MENTION_CLASSES }),
      `@${String(node.attrs['label'])}`,
    ];
  },

  renderText({ node }: { node: ProseMirrorNode }) {
    return `@${String(node.attrs['label'])}`;
  },

  markdownTokenName: 'mention',
  parseMarkdown: (token, helpers) =>
    helpers.createNode('mention', {
      id: String(token['id'] ?? ''),
      label: String(token['label'] ?? ''),
    }),
  renderMarkdown: (node) =>
    ɵwriteMention(String(node.attrs?.['id'] ?? ''), String(node.attrs?.['label'] ?? '')),
});

/**
 * Type SuggestionRenderFactory
 *
 * @description
 * Factory for Tiptap suggestion lifecycle callbacks.
 *
 * @type {() => { onStart: (props: SuggestionProps<I, I>) => void; onUpdate: (props: SuggestionProps<I, I>) => void; onKeyDown: (props: SuggestionKeyDownProps) => boolean; onExit: () => void }}
 */
type SuggestionRenderFactory<I> = () => {
  onStart: (props: SuggestionProps<I, I>) => void;
  onUpdate: (props: SuggestionProps<I, I>) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  onExit: () => void;
};

/**
 * Function renderer
 *
 * @description
 * Adapts suggestion callbacks to the Tiptap renderer.
 *
 * @param {SuggestionRenderer<I>} target - Suggestion menu callbacks to adapt.
 * @returns {SuggestionRenderFactory<I>} Factory for the suggestion renderer callbacks.
 */
function renderer<I>(target: SuggestionRenderer<I>): SuggestionRenderFactory<I> {
  return () => ({
    onStart: (props: SuggestionProps<I, I>) => {
      target.start(props);
    },
    onUpdate: (props: SuggestionProps<I, I>) => {
      target.update(props);
    },
    onKeyDown: (props: SuggestionKeyDownProps) => target.keyDown(props),
    onExit: () => {
      target.exit();
    },
  });
}
/* The « / » and « @ » menus, and the shortcuts of the mockup that Tiptap does not bind. A high
   priority puts their key handling before the block keymaps (Enter splits a block otherwise). */
/**
 * Function cadenwayBehavior
 *
 * @description
 * Configures suggestion menus and editor keyboard shortcuts.
 *
 * @param {EditorHooks} hooks - Callbacks and settings supplied by the editor.
 * @returns {AnyExtension} Configured behavior extension.
 */
function cadenwayBehavior(hooks: EditorHooks): AnyExtension {
  return Extension.create({
    name: 'cadenwayBehavior',
    priority: 1000,

    addKeyboardShortcuts() {
      return {
        // Mockup App.dc.html: Ctrl + Entrée sends; HardBreak would take it otherwise.
        'Mod-Enter': () => {
          hooks.submit();
          return true;
        },
        'Mod-k': () => {
          hooks.link();
          return true;
        },
        // Mockup App.dc.html, `MARK_BTNS`: strike is Ctrl Maj X.
        'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion<CwBlockType, CwBlockType>({
          pluginKey: new PluginKey('cwBlockMenu'),
          editor: this.editor,
          char: '/',
          startOfLine: true,
          decorationClass: TOKEN_CLASSES,
          floatingUi: { strategy: 'fixed' },
          allow: ({ editor }: { editor: Editor }) =>
            hooks.blocksEnabled() && !editor.isActive('codeBlock'),
          items: ({ query }: { query: string }) => hooks.blockItems(query),
          command: ({
            editor,
            range,
            props,
          }: {
            editor: Editor;
            range: Range;
            props: CwBlockType;
          }) => {
            applyBlock(editor, props.kind, range);
          },
          render: renderer(hooks.blockMenu),
        }),
        Suggestion<CwMentionPerson, CwMentionPerson>({
          pluginKey: new PluginKey('cwMentionMenu'),
          editor: this.editor,
          char: '@',
          decorationClass: TOKEN_CLASSES,
          floatingUi: { strategy: 'fixed' },
          debounce: 120,
          allow: ({ editor }: { editor: Editor }) =>
            hooks.mentionsEnabled() && !editor.isActive('codeBlock'),
          items: ({ query, signal }: { query: string; signal: AbortSignal }) =>
            hooks.mentionItems(query, signal),
          command: ({
            editor,
            range,
            props,
          }: {
            editor: Editor;
            range: Range;
            props: CwMentionPerson;
          }) => {
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                { type: 'mention', attrs: { id: props.id, label: props.name } },
                { type: 'text', text: ' ' },
              ])
              .run();
          },
          render: renderer(hooks.mentionMenu),
        }),
      ];
    },
  });
}

/**
 * Function createExtensions
 *
 * @description
 * The extensions of the editor: StarterKit (Link and Underline configured, Bold and Underline following the Cadenway grammar), task lists, placeholder, character count, mentions, the « / » and « @ » menus, and Markdown storage through the `marked` instance of `@cadenway/ui/components/markdown`.
 *
 * @param {EditorHooks} hooks - Callbacks and settings supplied by the editor.
 * @returns {AnyExtension[]} Extensions used by the editor.
 */
export function createExtensions(hooks: EditorHooks): AnyExtension[] {
  return [
    cadenwayKit(),
    TaskList,
    TaskItem.configure({
      nested: true,
      a11y: { checkboxLabel: (node, checked) => hooks.checkboxLabel(node.textContent, checked) },
    }),
    Placeholder.configure({
      showOnlyCurrent: true,
      placeholder: ({ editor, node }: { editor: Editor; node: ProseMirrorNode }) =>
        hooks.placeholder(node, editor.isEmpty),
    }),
    CharacterCount.configure({ limit: hooks.maxLength }),
    Mention,
    cadenwayBehavior(hooks),
    Markdown.configure({
      // One grammar for the reader and the editor (cw-brick-recipes, `cw-markdown`).
      // TS2322: @tiptap/markdown types this option against its own, older major of `marked`; our
      // instance works at run time. Remove this cast when the two majors meet (pnpm-workspace.yaml,
      // `marked` in the catalog).
      marked: ɵcreateMarked() as unknown as MarkdownExtensionOptions['marked'],
    }),
  ];
}

/**
 * Function activeBlock
 *
 * @description
 * The block under the selection, as the toolbar and the « / » menu name it.
 *
 * @param {Editor} editor - Editor whose selection is inspected or changed.
 * @returns {CwBlockKind} Kind of the block under the selection.
 */
export function activeBlock(editor: Editor): CwBlockKind {
  if (editor.isActive('codeBlock')) return 'code';
  if (editor.isActive('heading', { level: 1 })) return 'h1';
  if (editor.isActive('heading', { level: 2 })) return 'h2';
  if (editor.isActive('heading', { level: 3 })) return 'h3';
  if (editor.isActive('taskList')) return 'todo';
  if (editor.isActive('bulletList')) return 'li';
  if (editor.isActive('orderedList')) return 'ol';
  if (editor.isActive('blockquote')) return 'quote';
  return 'p';
}

/**
 * Function applyBlock
 *
 * @description
 * Turns the current block into `kind` (mockup App.dc.html, `setType`): the block is first brought back to a paragraph, out of any list or quote, then converted. `range` (the typed « / ») is removed first. A separator is inserted after the block.
 *
 * @param {Editor} editor - Editor whose selection is inspected or changed.
 * @param {CwBlockKind} kind - Block kind to apply.
 * @param {Range} range - Typed suggestion range to remove before applying the block.
 */
export function applyBlock(editor: Editor, kind: CwBlockKind, range?: Range): void {
  const chain: ChainedCommands = editor.chain().focus();
  if (range) chain.deleteRange(range);
  if (kind === 'hr') {
    chain.setHorizontalRule().run();
    return;
  }
  chain.clearNodes();
  switch (kind) {
    case 'p':
      break;
    case 'h1':
      chain.setHeading({ level: 1 });
      break;
    case 'h2':
      chain.setHeading({ level: 2 });
      break;
    case 'h3':
      chain.setHeading({ level: 3 });
      break;
    case 'li':
      chain.toggleBulletList();
      break;
    case 'ol':
      chain.toggleOrderedList();
      break;
    case 'todo':
      chain.toggleTaskList();
      break;
    case 'quote':
      chain.setBlockquote();
      break;
    case 'code':
      chain.setCodeBlock();
      break;
  }
  chain.run();
}
