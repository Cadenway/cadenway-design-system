/*
 * The Tiptap set-up of `cw-block-editor`: the one place of the design system that imports
 * `@tiptap/*` (cw-brick-recipes, `cw-block-editor`; .claude/rules/bricks.md). Internal to the entry
 * point.
 */

import { ɵcreateMarked, ɵwriteMention } from '@cadenway/ui/markdown';
import {
  type AnyExtension,
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

/** The callbacks of a suggestion menu, given by the component that draws it. */
export interface SuggestionRenderer<I> {
  start(props: SuggestionProps<I, I>): void;
  update(props: SuggestionProps<I, I>): void;
  keyDown(props: SuggestionKeyDownProps): boolean;
  exit(): void;
}

/** What the extensions ask of the component. */
export interface EditorHooks {
  /** Placeholder of an empty node; `alone` when it is the only block of the document. */
  placeholder(node: ProseMirrorNode, alone: boolean): string;
  /** Name of a task box from its text and state. */
  checkboxLabel(text: string, checked: boolean): string;
  /** Maximum number of characters, read when the editor starts. */
  maxLength: number | null;
  /** The « / » entries matching a query; empty disables the menu. */
  blockItems(query: string): CwBlockType[];
  blocksEnabled(): boolean;
  blockMenu: SuggestionRenderer<CwBlockType>;
  /** The people matching a query. */
  mentionItems(query: string, signal: AbortSignal): Promise<CwMentionPerson[]>;
  mentionsEnabled(): boolean;
  mentionMenu: SuggestionRenderer<CwMentionPerson>;
  /** Ctrl + Entrée (⌘ + Entrée). */
  submit(): void;
  /** Ctrl + K. */
  link(): void;
}

/* Bold is `**text**` only, `__text__` is underline (cw-brick-recipes, the shared `__underline__`
   rule). Tiptap's Bold also takes `__`: its input and paste rules are replaced by the star ones and
   Underline gets the underscore ones. Patterns of @tiptap/extension-bold. */
const STAR_INPUT = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))$/;
const STAR_PASTE = /(?:^|\s)(\*\*(?!\s+\*\*)((?:[^*]+))\*\*(?!\s+\*\*))/g;
const UNDERSCORE_INPUT = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))$/;
const UNDERSCORE_PASTE = /(?:^|\s)(__(?!\s+__)((?:[^_]+))__(?!\s+__))/g;

/* Mockup App.dc.html: links accept http(s), mailto and tel addresses, or a relative one. */
const SAFE_LINK = /^(?:https?:|mailto:|tel:|\/|#|\?)/i;

function isSafeLink(url: string): boolean {
  const compact = url.trim();
  return SAFE_LINK.test(compact) || !/^[a-z][a-z0-9+.-]*:/i.test(compact);
}

/* The mention chip of the CommentComposer sheet (anatomy 4): neutral, never colored. */
const MENTION_CLASSES =
  'rounded-sm bg-secondary px-1 py-px font-medium whitespace-nowrap text-secondary-foreground';
/* The token being typed while its menu is open (CommentComposer sheet, anatomy 5). */
const TOKEN_CLASSES = 'rounded-sm bg-selected px-0.5';

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
const Mention = Node.create({
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

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-mention': '', class: MENTION_CLASSES }),
      `@${String(node.attrs['label'])}`,
    ];
  },

  renderText({ node }) {
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

function renderer<I>(target: SuggestionRenderer<I>) {
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
          allow: ({ editor }) => hooks.blocksEnabled() && !editor.isActive('codeBlock'),
          items: ({ query }) => hooks.blockItems(query),
          command: ({ editor, range, props }) => {
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
          allow: ({ editor }) => hooks.mentionsEnabled() && !editor.isActive('codeBlock'),
          items: ({ query, signal }) => hooks.mentionItems(query, signal),
          command: ({ editor, range, props }) => {
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
 * The extensions of the editor: StarterKit (Link and Underline configured, Bold and Underline
 * following the Cadenway grammar), task lists, placeholder, character count, mentions, the « / »
 * and « @ » menus, and Markdown storage through the `marked` instance of `@cadenway/ui/markdown`.
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
      placeholder: ({ editor, node }) => hooks.placeholder(node, editor.isEmpty),
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

/** The block under the selection, as the toolbar and the « / » menu name it. */
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
 * Turns the current block into `kind` (mockup App.dc.html, `setType`): the block is first brought
 * back to a paragraph, out of any list or quote, then converted. `range` (the typed « / ») is
 * removed first. A separator is inserted after the block.
 */
export function applyBlock(editor: Editor, kind: CwBlockKind, range?: Range): void {
  const chain = editor.chain().focus();
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
