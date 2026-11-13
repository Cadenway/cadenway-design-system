import { LiveAnnouncer, _IdGenerator } from '@angular/cdk/a11y';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwButton } from '@cadenway/ui/components/button';
import { ɵmenuFrom } from '@cadenway/ui/core';
import { CwInput } from '@cadenway/ui/components/input';
import { CwKbd } from '@cadenway/ui/components/kbd';
import {
  CwMenu,
  CwMenuItemRadio,
  CwMenuRadioGroup,
  CwMenuTriggerFor,
} from '@cadenway/ui/components/menu';
import { CwToolbar, CwToolbarItem, CwToolbarSeparator } from '@cadenway/ui/components/toolbar';
import { CwTooltip } from '@cadenway/ui/components/tooltip';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { take } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorCaretDownBold,
  phosphorCheckSquareBold,
  phosphorCodeBlockBold,
  phosphorCodeBold,
  phosphorLinkSimpleBold,
  phosphorListBulletsBold,
  phosphorListNumbersBold,
  phosphorMinusBold,
  phosphorQuotesBold,
  phosphorTextBBold,
  phosphorTextHOneBold,
  phosphorTextHThreeBold,
  phosphorTextHTwoBold,
  phosphorTextItalicBold,
  phosphorTextStrikethroughBold,
  phosphorTextTBold,
  phosphorTextUnderlineBold,
} from '@ng-icons/phosphor-icons/bold';
import { Editor } from '@tiptap/core';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';

import {
  CW_BLOCK_EDITOR_LABELS,
  CW_BLOCK_TYPES,
  CW_INLINE_MARKS,
  CW_TOOLBAR_BLOCKS,
} from './block-editor.constants';
import {
  type SuggestionRenderer,
  activeBlock,
  applyBlock,
  createExtensions,
} from './block-editor.extensions';
import type {
  CwBlockEditorLabels,
  CwBlockEditorVariant,
  CwBlockKind,
  CwBlockType,
  CwInlineMark,
  CwMentionPerson,
  CwMentionSearch,
} from './block-editor.types';

/* Styles of the editable surface: Tiptap ships none, every rule is Tailwind over the tokens
   (cw-brick-recipes, `cw-block-editor`). Block styles from the mockup (App.dc.html, `BLOCK_CLS`,
   `RUN_CLS`); placeholder on the empty node Tiptap marks (`is-empty`, `data-placeholder`). */
const SURFACE =
  'min-w-0 break-words text-sm text-foreground outline-none whitespace-pre-wrap ' +
  '[&_.is-empty]:before:pointer-events-none [&_.is-empty]:before:float-left [&_.is-empty]:before:h-0 [&_.is-empty]:before:text-muted-foreground [&_.is-empty]:before:content-[attr(data-placeholder)] ' +
  '[&_h1]:pt-4 [&_h1]:text-2xl [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1:first-child]:pt-0 ' +
  '[&_h2]:pt-3 [&_h2]:text-xl [&_h2]:leading-snug [&_h2]:font-semibold [&_h2:first-child]:pt-0 ' +
  '[&_h3]:pt-2 [&_h3]:text-lg [&_h3]:leading-7 [&_h3]:font-semibold [&_h3:first-child]:pt-0 ' +
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:marker:text-muted-foreground ' +
  '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 ' +
  '[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-start [&_li[data-type=taskItem]]:gap-2 ' +
  '[&_li[data-type=taskItem]>label]:mt-[3px] [&_li[data-type=taskItem]>label]:flex [&_li[data-type=taskItem]>label]:select-none ' +
  '[&_li[data-type=taskItem]>div]:min-w-0 [&_li[data-type=taskItem]>div]:flex-1 ' +
  '[&_li[data-checked=true]>div]:text-muted-foreground [&_li[data-checked=true]>div]:line-through ' +
  '[&_input[type=checkbox]]:size-4 [&_input[type=checkbox]]:accent-foreground ' +
  '[&_blockquote]:border-l-2 [&_blockquote]:border-line-control [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground ' +
  '[&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:px-3 [&_pre]:py-2.5 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-relaxed ' +
  '[&_:not(pre)>code]:rounded-[4px] [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-px [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em] ' +
  '[&_hr]:my-3 [&_hr]:h-px [&_hr]:border-0 [&_hr]:bg-border [&_hr.ProseMirror-selectednode]:ring-2 [&_hr.ProseMirror-selectednode]:ring-ring ' +
  '[&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-2 ' +
  '[&_strong]:font-semibold [&_u]:underline-offset-2 [&_s]:line-through';

const VARIANTS: Record<CwBlockEditorVariant, string> = {
  document: 'min-h-24 py-1 leading-relaxed [&>*+*]:mt-1.5',
  field: 'max-h-60 min-h-14 overflow-y-auto px-3 pt-2 pb-1 leading-6 [&>*+*]:mt-1',
  line: 'max-h-60 overflow-y-auto px-3 py-[7px] leading-5 [&>*+*]:mt-1',
};

/* Toolbar of the document editor (mockup App.dc.html, document editing): a sticky bar above the
   text. Pressed buttons read `bg-selected` (CommentComposer preview). */
const TOOLBAR_FRAME =
  'sticky top-0 z-30 mb-2 rounded-lg border border-border bg-background/95 px-1.5 py-1 backdrop-blur';
const TOOL =
  'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected aria-expanded:bg-selected aria-expanded:text-foreground';

/* The panel of the « / » and « @ » menus (CommentComposer preview, anatomy 8 and 9): opened from
   the token corner, items entering one after the other, 60 ms then +30 ms, twelve at most. */
const LISTBOX =
  'flex max-h-72 flex-col overflow-y-auto *:animate-item-in *:motion-reduce:animate-none ' +
  '[&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] ' +
  '[&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] ' +
  '[&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] ' +
  '[&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

type MenuState =
  | { readonly kind: 'block'; readonly items: readonly CwBlockType[]; readonly active: number }
  | {
      readonly kind: 'mention';
      readonly items: readonly CwMentionPerson[];
      readonly active: number;
      readonly query: string;
      readonly loading: boolean;
    };

interface PanelPosition {
  readonly x: number;
  readonly y: number;
  readonly above: boolean;
}

/** A name split around the typed query, for the bold match of the « @ » menu. */
interface NameParts {
  readonly before: string;
  readonly match: string;
  readonly after: string;
}

function fold(text: string): string[] {
  return Array.from(text).map((char) => char.normalize('NFD').charAt(0).toLocaleLowerCase('fr'));
}

function splitName(name: string, query: string): NameParts {
  const chars = Array.from(name);
  const haystack = fold(name).join('');
  const needle = fold(query).join('');
  const index = needle === '' ? -1 : haystack.indexOf(needle);
  if (index < 0) return { before: name, match: '', after: '' };
  const length = Array.from(needle).length;
  return {
    before: chars.slice(0, index).join(''),
    match: chars.slice(index, index + length).join(''),
    after: chars.slice(index + length).join(''),
  };
}

function connected(above: boolean): ConnectedPosition {
  return {
    originX: 'start',
    originY: above ? 'top' : 'bottom',
    overlayX: 'start',
    overlayY: above ? 'bottom' : 'top',
  };
}

/**
 * Rich text editing stored as Markdown: a document, a task description, the field of a comment
 * (mockup App.dc.html, document editor and description; the CommentComposer sheet builds on it).
 *
 * `[(value)]` is the Markdown (the grammar `cw-markdown` reads: `**gras**`, `*italique*`,
 * `__souligné__`, `~~barré~~`, `` `code` ``, links, headings, lists, tasks, quotes, code blocks,
 * separators, `@[Nom](id)` mentions). The editor works with Signal Forms (`[formField]`, it is a
 * `FormValueControl<string>`) and with Reactive or template-driven forms (it is the control's value
 * accessor); `aria-invalid` is set when the control is invalid and touched.
 *
 * The surface is `role="textbox" aria-multiline="true"`, named by `ariaLabel`. Typing Markdown
 * shorthands converts the block (`# `, `- `, `1. `, `[ ] `, `> `, ` ``` `, `---`). « / » at the start
 * of a line opens the block menu (`blockTypes`, the ten types of the mockup by default); « @ » opens
 * the people menu when `mentionSearch` is given. Both are listboxes the surface points to with
 * `aria-activedescendant`: ↑ ↓ choose, Entrée or Tab insert, Échap closes and keeps the text; the
 * number of results is announced. Ctrl + B, I, U, E and Ctrl + Maj + X toggle the marks; Ctrl + K
 * opens the link panel; Ctrl + Entrée emits `ctrlEnter` (no line break).
 *
 * With `toolbar`, a formatting toolbar sits above the text (`role="toolbar"`, one Tab stop, ← →):
 * block type menu, the five marks with `aria-pressed`, link, lists, task, quote, code, separator.
 * Without it, a host drives the editor through `toggleMark`, `setBlock`, `openLink`,
 * `startMention` and reads `activeMarks`, `activeBlock`, `linkActive`, `mentions`.
 *
 * The engine (Tiptap) is created after the first render in the browser and destroyed with the
 * component; nothing outside this entry point loads it.
 */
@Component({
  selector: 'cw-block-editor',
  imports: [
    CwAvatar,
    CwButton,
    CwInput,
    CwKbd,
    CwMenu,
    CwMenuItemRadio,
    CwMenuRadioGroup,
    CwMenuTriggerFor,
    CwToolbar,
    CwToolbarItem,
    CwToolbarSeparator,
    CwTooltip,
    NgIcon,
  ],
  providers: [
    provideIcons({
      phosphorCaretDownBold,
      phosphorCheckSquareBold,
      phosphorCodeBlockBold,
      phosphorCodeBold,
      phosphorLinkSimpleBold,
      phosphorListBulletsBold,
      phosphorListNumbersBold,
      phosphorMinusBold,
      phosphorQuotesBold,
      phosphorTextBBold,
      phosphorTextHOneBold,
      phosphorTextHThreeBold,
      phosphorTextHTwoBold,
      phosphorTextItalicBold,
      phosphorTextStrikethroughBold,
      phosphorTextTBold,
      phosphorTextUnderlineBold,
    }),
  ],
  host: {
    class: 'flex min-w-0 flex-col',
    '[attr.id]': 'null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
  },
  templateUrl: './block-editor.component.html',
})
export class CwBlockEditor implements FormValueControl<string>, ControlValueAccessor {
  /** The text, in Markdown; `[(value)]`. */
  readonly value = model('');
  /** Layout of the editable surface. */
  readonly variant = input<CwBlockEditorVariant>('document');
  /** Shown when the document is empty. */
  readonly placeholder = input('Écrivez, ou tapez « / » pour insérer un bloc');
  /** Accessible name of the editable surface. */
  readonly ariaLabel = input('Contenu du document');
  /** Id of the element that describes the surface (an error message), `aria-describedby`. */
  readonly describedBy = input<string | null>(null);
  /** Shows the formatting toolbar above the text. */
  readonly toolbar = input(true, { transform: booleanAttribute });
  /** Entries of the « / » menu; empty turns the menu off. */
  readonly blockTypes = input<readonly CwBlockType[]>(CW_BLOCK_TYPES);
  /** Looks people up after « @ »; without it, « @ » is plain text. */
  readonly mentionSearch = input<CwMentionSearch | null>(null);
  /** Maximum number of characters (Signal Forms binds it from `maxLength`); read when the editor
   *  starts. */
  readonly maxLength = input<number | undefined>(undefined);
  /** French texts, overridable one by one. */
  readonly labels = input<Partial<CwBlockEditorLabels>>({});
  /** Read-only, dimmed text (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state given by Signal Forms; shown once touched. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Touched state given by Signal Forms. */
  readonly touched = input(false, { transform: booleanAttribute });
  /** Required state given by Signal Forms; `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Emitted when the focus leaves the text: Signal Forms marks the field touched. */
  readonly touch = output();
  /** Emitted on Ctrl + Entrée (⌘ + Entrée): send or save. */
  readonly ctrlEnter = output();

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');
  private readonly menuPanel = viewChild.required<ElementRef<HTMLElement>>('menuPanel');
  private readonly linkPanel = viewChild.required<ElementRef<HTMLElement>>('linkPanel');
  private readonly linkInput = viewChild.required<ElementRef<HTMLInputElement>>('linkInput');

  private editor: Editor | null = null;
  private lastMarkdown = '';
  private readonly ready = signal(false);
  /* Bumped on every transaction: the toolbar state reads the engine through it. */
  private readonly revision = signal(0);
  private readonly formDisabled = signal(false);
  private readonly accessorTouched = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  private menuCommand: ((item: never) => void) | null = null;
  private unmountMenu: (() => void) | null = null;
  private removeOutsideListener: (() => void) | null = null;

  private readonly id = inject(_IdGenerator).getId('cw-block-editor-');
  protected readonly ids = {
    menuTitle: `${this.id}-menu-title`,
    listbox: `${this.id}-listbox`,
    option: `${this.id}-option-`,
  };

  protected readonly text = computed(() => ({ ...CW_BLOCK_EDITOR_LABELS, ...this.labels() }));
  protected readonly marks = CW_INLINE_MARKS;
  protected readonly toolbarBlocks = computed(() =>
    CW_TOOLBAR_BLOCKS.map((kind) => CW_BLOCK_TYPES.find((type) => type.kind === kind)).filter(
      (type): type is CwBlockType => type !== undefined,
    ),
  );
  /* Mockup App.dc.html: the type menu of the toolbar lists every type but the separator. */
  protected readonly typeEntries = CW_BLOCK_TYPES.filter((type) => type.kind !== 'hr');
  protected readonly surfaceClasses = computed(() => `${SURFACE} ${VARIANTS[this.variant()]}`);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly toolStyle = TOOL;
  protected readonly toolbarFrame = TOOLBAR_FRAME;
  protected readonly listboxClasses = LISTBOX;

  protected readonly menu = signal<MenuState | null>(null);
  protected readonly menuPosition = signal<PanelPosition | null>(null);
  protected readonly menuFrom = computed(() =>
    ɵmenuFrom(connected(this.menuPosition()?.above ?? false)),
  );
  protected readonly link = signal<PanelPosition | null>(null);
  protected readonly linkUrl = signal('');
  protected readonly linkFrom = computed(() => ɵmenuFrom(connected(this.link()?.above ?? false)));

  /** The inline marks under the selection. */
  readonly activeMarks = computed<ReadonlySet<CwInlineMark>>(() => {
    this.revision();
    const editor = this.ready() ? this.editor : null;
    if (!editor) return new Set();
    return new Set(this.marks.map((button) => button.mark).filter((mark) => editor.isActive(mark)));
  });

  /** The block under the selection. */
  readonly activeBlock = computed<CwBlockKind>(() => {
    this.revision();
    const editor = this.ready() ? this.editor : null;
    return editor ? activeBlock(editor) : 'p';
  });

  /** Whether the selection is inside a link. */
  readonly linkActive = computed(() => {
    this.revision();
    const editor = this.ready() ? this.editor : null;
    return editor ? editor.isActive('link') : false;
  });

  /** The ids of the people mentioned in the text, each once, in reading order. */
  readonly mentions = computed<readonly string[]>(() => {
    this.revision();
    const editor = this.ready() ? this.editor : null;
    if (!editor) return [];
    const ids: string[] = [];
    editor.state.doc.descendants((node) => {
      const id: unknown = node.attrs['id'];
      if (node.type.name === 'mention' && typeof id === 'string' && !ids.includes(id)) ids.push(id);
    });
    return ids;
  });

  protected readonly typeLabel = computed(
    () =>
      this.typeEntries.find((type) => type.kind === this.activeBlock())?.label ??
      this.typeEntries[0].label,
  );

  constructor() {
    // Reactive and template-driven forms: this editor is the control's value accessor, set here
    // rather than through NG_VALUE_ACCESSOR so it can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    afterNextRender(() => {
      this.createEditor();
    });

    effect(() => {
      const value = this.value();
      if (!this.ready()) return;
      untracked(() => {
        this.syncValue(value);
      });
    });

    effect(() => {
      const editable = !this.isDisabled();
      if (!this.ready()) return;
      untracked(() => this.editor?.setEditable(editable, false));
    });

    // ARIA state of the surface the engine renders: written on its element, outside the
    // attributes the engine manages.
    effect(() => {
      if (!this.ready() || !this.editor) return;
      const dom = this.editor.view.dom;
      const menu = this.menu();
      setAttribute(dom, 'aria-label', this.ariaLabel());
      setAttribute(dom, 'aria-describedby', this.describedBy());
      setAttribute(dom, 'aria-invalid', this.isInvalid() ? 'true' : null);
      setAttribute(dom, 'aria-required', this.required() ? 'true' : null);
      setAttribute(dom, 'aria-disabled', this.isDisabled() ? 'true' : null);
      setAttribute(dom, 'aria-controls', menu ? this.ids.listbox : null);
      setAttribute(
        dom,
        'aria-activedescendant',
        menu && menu.items.length > 0 ? this.optionId(menu.active) : null,
      );
    });

    inject(DestroyRef).onDestroy(() => {
      this.closeMenu();
      this.removeOutsideListener?.();
      this.editor?.destroy();
      this.editor = null;
    });
  }

  /** Moves the focus to the text (Signal Forms calls it to focus the first invalid field). */
  focus(options?: FocusOptions): void {
    if (this.editor)
      this.editor.commands.focus(undefined, { scrollIntoView: !options?.preventScroll });
  }

  /** Toggles an inline mark on the selection (Ctrl + B, I, U, E, Maj + X). */
  toggleMark(mark: CwInlineMark): void {
    if (!this.editor || this.isDisabled()) return;
    this.editor.chain().focus().toggleMark(mark).run();
  }

  /**
   * Turns the current block into `kind`; choosing the type it already has turns it back into text
   * (mockup App.dc.html, toolbar type menu). `hr` inserts a separator.
   */
  setBlock(kind: CwBlockKind): void {
    if (!this.editor || this.isDisabled()) return;
    const current = activeBlock(this.editor);
    applyBlock(this.editor, kind === current && kind !== 'p' && kind !== 'hr' ? 'p' : kind);
  }

  /** Opens the link panel under the selection (Ctrl + K), filled with the current address. */
  openLink(): void {
    const editor = this.editor;
    if (!editor || this.isDisabled()) return;
    const href: unknown = editor.getAttributes('link')['href'];
    this.linkUrl.set(typeof href === 'string' ? href : '');
    this.closeMenu();
    const { from, to } = editor.state.selection;
    const reference = {
      getBoundingClientRect: () => this.selectionRect(from, to),
    };
    this.link.set({ x: 0, y: 0, above: false });
    afterNextRender(
      () => {
        const panel = this.linkPanel().nativeElement;
        void computePosition(reference, panel, {
          strategy: 'fixed',
          placement: 'bottom-start',
          middleware: [offset(4), flip(), shift({ padding: 8 })],
        }).then(({ x, y, placement }) => {
          if (this.link()) this.link.set({ x, y, above: placement.startsWith('top') });
        });
        this.linkInput().nativeElement.focus();
        this.listenOutside(panel);
      },
      { injector: this.injector },
    );
  }

  /** Inserts « @ » at the caret, which opens the people menu (the composer's Mention button). */
  startMention(): void {
    const editor = this.editor;
    if (!editor || this.isDisabled()) return;
    const { $from } = editor.state.selection;
    const before = $from.parent.textBetween(
      Math.max(0, $from.parentOffset - 1),
      $from.parentOffset,
    );
    editor
      .chain()
      .focus()
      .insertContent(before !== '' && !/\s/.test(before) ? ' @' : '@')
      .run();
  }

  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  protected isMarkActive(mark: CwInlineMark): boolean {
    return this.activeMarks().has(mark);
  }

  protected onTypeChosen(kind: string | undefined): void {
    const type = this.typeEntries.find((entry) => entry.kind === kind);
    if (type) this.setBlock(type.kind);
  }

  protected refocus(): void {
    // The menu gives the focus back to its trigger when it closes; the caret goes back to the text.
    setTimeout(() => this.editor?.commands.focus(), 0);
  }

  protected optionId(index: number): string {
    return `${this.ids.option}${String(index)}`;
  }

  protected nameParts(name: string, query: string): NameParts {
    return splitName(name, query);
  }

  protected highlight(index: number): void {
    this.menu.update((state) =>
      state && state.active !== index ? { ...state, active: index } : state,
    );
  }

  protected choose(index: number): void {
    const state = this.menu();
    const command = this.menuCommand;
    if (!state || !command) return;
    if (index < 0 || index >= state.items.length) return;
    const item = state.items[index];
    (command as (value: CwBlockType | CwMentionPerson) => void)(item);
  }

  protected onLinkInput(event: Event): void {
    this.linkUrl.set((event.target as HTMLInputElement).value);
  }

  protected onLinkKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.applyLink();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeLink(true);
    }
  }

  /** Applies the address of the link panel (mockup App.dc.html, `applyLink`). */
  protected applyLink(): void {
    const editor = this.editor;
    const url = this.linkUrl().trim();
    this.closeLink(false);
    if (!editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href =
      /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('/') || url.startsWith('#')
        ? url
        : `https://${url}`;
    const { empty } = editor.state.selection;
    if (empty && !editor.isActive('link')) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: url.replace(/^https?:\/\//i, ''),
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }

  private closeLink(refocus: boolean): void {
    this.link.set(null);
    this.removeOutsideListener?.();
    this.removeOutsideListener = null;
    if (refocus) this.editor?.commands.focus();
  }

  private listenOutside(panel: HTMLElement): void {
    this.removeOutsideListener?.();
    const listener = (event: Event): void => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      this.closeLink(false);
    };
    this.document.addEventListener('pointerdown', listener, true);
    this.removeOutsideListener = () => {
      this.document.removeEventListener('pointerdown', listener, true);
    };
  }

  private selectionRect(from: number, to: number): DOMRect {
    const editor = this.editor;
    try {
      if (editor) {
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const left = Math.min(start.left, end.left);
        return new DOMRect(left, start.top, Math.max(end.right - left, 1), end.bottom - start.top);
      }
    } catch {
      // No layout (a hidden editor): fall back on the surface.
    }
    return this.surface().nativeElement.getBoundingClientRect();
  }

  private createEditor(): void {
    const labels = (): CwBlockEditorLabels => this.text();
    this.lastMarkdown = this.value();
    const editor = new Editor({
      element: this.surface().nativeElement,
      content: this.value(),
      contentType: 'markdown',
      editable: !this.isDisabled(),
      extensions: createExtensions({
        maxLength: this.maxLength() ?? null,
        placeholder: (node, alone) => {
          if (alone) return this.placeholder();
          if (node.type.name === 'heading') {
            const level: unknown = node.attrs['level'];
            return this.typeEntries.find((type) => type.kind === `h${String(level)}`)?.label ?? '';
          }
          if (
            node.type.name === 'paragraph' &&
            this.variant() === 'document' &&
            this.blockTypes().length > 0
          )
            return labels().emptyBlock;
          return '';
        },
        checkboxLabel: (text, checked) =>
          (checked ? labels().uncheck : labels().check).replace('{text}', text || labels().task),
        blocksEnabled: () => this.blockTypes().length > 0,
        blockItems: (query) => this.blockItems(query),
        blockMenu: this.renderer<CwBlockType>('block'),
        mentionsEnabled: () => this.mentionSearch() !== null,
        mentionItems: (query, abort) => this.searchPeople(query, abort),
        mentionMenu: this.renderer<CwMentionPerson>('mention'),
        submit: () => {
          this.ctrlEnter.emit();
        },
        link: () => {
          this.openLink();
        },
      }),
      editorProps: {
        attributes: { role: 'textbox', 'aria-multiline': 'true', class: 'outline-none' },
      },
      onUpdate: ({ editor: instance }) => {
        // The trailing empty paragraph the engine keeps for the caret is not content.
        this.publish(instance.getMarkdown().trimEnd());
      },
      onTransaction: () => {
        this.revision.update((count) => count + 1);
      },
      onBlur: () => {
        this.accessorTouched.set(true);
        this.onTouched();
        this.touch.emit();
      },
    });
    this.editor = editor;
    this.ready.set(true);
  }

  private publish(markdown: string): void {
    if (markdown === this.lastMarkdown) return;
    this.lastMarkdown = markdown;
    this.value.set(markdown);
    this.onChange(markdown);
  }

  private syncValue(value: string): void {
    if (!this.editor || value === this.lastMarkdown) return;
    this.lastMarkdown = value;
    this.editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false });
  }

  private blockItems(query: string): CwBlockType[] {
    const needle = fold(query.trim()).join('');
    return this.blockTypes().filter(
      (type) =>
        needle === '' ||
        fold(type.label).join('').includes(needle) ||
        (type.hint ?? '').startsWith(query.trim()),
    );
  }

  private searchPeople(query: string, abort: AbortSignal): Promise<CwMentionPerson[]> {
    const search = this.mentionSearch();
    if (!search) return Promise.resolve([]);
    return new Promise((resolve) => {
      let settled = false;
      const settle = (people: readonly CwMentionPerson[]): void => {
        if (settled) return;
        settled = true;
        resolve([...people]);
      };
      // The first list only: `take(1)` ends the subscription once it arrives.
      const subscription = search(query)
        .pipe(take(1))
        .subscribe({
          next: settle,
          error: () => {
            settle([]);
          },
          complete: () => {
            settle([]);
          },
        });
      abort.addEventListener('abort', () => {
        subscription.unsubscribe();
        settle([]);
      });
    });
  }

  private renderer<I extends CwBlockType | CwMentionPerson>(
    kind: MenuState['kind'],
  ): SuggestionRenderer<I> {
    return {
      start: (props: SuggestionProps<I, I>) => {
        this.menuCommand = props.command;
        this.showMenu(kind, props);
        this.menuPosition.set(null);
        afterNextRender(
          () => {
            if (!this.menu()) return;
            this.unmountMenu?.();
            this.unmountMenu = props.mount(this.menuPanel().nativeElement, {
              onPosition: ({ x, y, placement }) => {
                this.menuPosition.set({ x, y, above: placement.startsWith('top') });
              },
            });
          },
          { injector: this.injector },
        );
      },
      update: (props: SuggestionProps<I, I>) => {
        this.menuCommand = props.command;
        this.showMenu(kind, props);
      },
      keyDown: ({ event }: SuggestionKeyDownProps) => this.onMenuKeydown(event),
      exit: () => {
        this.closeMenu();
      },
    };
  }

  private showMenu<I extends CwBlockType | CwMentionPerson>(
    kind: MenuState['kind'],
    props: SuggestionProps<I, I>,
  ): void {
    const previous = this.menu();
    const active = previous?.kind === kind ? previous.active : 0;
    const count = props.items.length;
    const next: MenuState =
      kind === 'block'
        ? {
            kind,
            items: props.items as readonly CwBlockType[],
            active: Math.min(active, Math.max(count - 1, 0)),
          }
        : {
            kind,
            items: props.items as readonly CwMentionPerson[],
            active: Math.min(active, Math.max(count - 1, 0)),
            query: props.query,
            loading: props.loading,
          };
    this.menu.set(next);
    if (!props.loading) {
      const text = this.text();
      void this.announcer.announce(
        count === 0
          ? text.noResults
          : count === 1
            ? text.oneResult
            : text.manyResults.replace('{count}', String(count)),
        'polite',
      );
    }
  }

  private onMenuKeydown(event: KeyboardEvent): boolean {
    const state = this.menu();
    if (!state) return false;
    const count = state.items.length;
    switch (event.key) {
      case 'ArrowDown':
        if (count > 0) this.highlight((state.active + 1) % count);
        return true;
      case 'ArrowUp':
        if (count > 0) this.highlight((state.active - 1 + count) % count);
        return true;
      case 'Enter':
      case 'Tab':
        if (count === 0) return false;
        this.choose(state.active);
        return true;
      default:
        return false;
    }
  }

  private closeMenu(): void {
    this.unmountMenu?.();
    this.unmountMenu = null;
    this.menuCommand = null;
    this.menu.set(null);
    this.menuPosition.set(null);
  }
}

function setAttribute(element: HTMLElement, name: string, value: string | null): void {
  if (value === null || value === '') element.removeAttribute(name);
  else if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}
