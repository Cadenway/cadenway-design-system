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
  type InputSignalWithTransform,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type WritableSignal,
  type Signal,
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
import { take, type Subscription } from 'rxjs';
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
import type { ResolvedPos } from '@tiptap/pm/model';
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
  CwInlineMarkButton,
  CwMentionPerson,
  CwMentionSearch,
} from './block-editor.types';

/* Styles of the editable surface: Tiptap ships none, every rule is Tailwind over the tokens
   (cw-brick-recipes, `cw-block-editor`). Block styles from the mockup (App.dc.html, `BLOCK_CLS`,
   `RUN_CLS`); placeholder on the empty node Tiptap marks (`is-empty`, `data-placeholder`). */
/**
 * Constant SURFACE
 *
 * @description
 * Classes for the editable content surface.
 *
 * @type {string}
 */
const SURFACE: string =
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

/**
 * Constant VARIANTS
 *
 * @description
 * Surface classes for each editor layout.
 *
 * @type {Record<CwBlockEditorVariant, string>}
 */
const VARIANTS: Record<CwBlockEditorVariant, string> = {
  document: 'min-h-24 py-1 leading-relaxed [&>*+*]:mt-1.5',
  field: 'max-h-60 min-h-14 overflow-y-auto px-3 pt-2 pb-1 leading-6 [&>*+*]:mt-1',
  line: 'max-h-60 overflow-y-auto px-3 py-[7px] leading-5 [&>*+*]:mt-1',
};

/* Toolbar of the document editor (mockup App.dc.html, document editing): a sticky bar above the
   text. Pressed buttons read `bg-selected` (CommentComposer preview). */
/**
 * Constant TOOLBAR_FRAME
 *
 * @description
 * Classes for the formatting toolbar frame.
 *
 * @type {string}
 */
const TOOLBAR_FRAME: string =
  'sticky top-0 z-30 mb-2 rounded-lg border border-border bg-background/95 px-1.5 py-1 backdrop-blur';
/**
 * Constant TOOL
 *
 * @description
 * Classes for formatting toolbar controls.
 *
 * @type {string}
 */
const TOOL: string =
  'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected aria-expanded:bg-selected aria-expanded:text-foreground';

/* The panel of the « / » and « @ » menus (CommentComposer preview, anatomy 8 and 9): opened from
   the token corner, items entering one after the other, 60 ms then +30 ms, twelve at most. */
/**
 * Constant LISTBOX
 *
 * @description
 * Classes for suggestion menus.
 *
 * @type {string}
 */
const LISTBOX: string =
  'flex max-h-72 flex-col overflow-y-auto *:animate-item-in *:motion-reduce:animate-none ' +
  '[&>*:nth-child(1)]:[animation-delay:60ms] [&>*:nth-child(2)]:[animation-delay:90ms] [&>*:nth-child(3)]:[animation-delay:120ms] ' +
  '[&>*:nth-child(4)]:[animation-delay:150ms] [&>*:nth-child(5)]:[animation-delay:180ms] [&>*:nth-child(6)]:[animation-delay:210ms] ' +
  '[&>*:nth-child(7)]:[animation-delay:240ms] [&>*:nth-child(8)]:[animation-delay:270ms] [&>*:nth-child(9)]:[animation-delay:300ms] ' +
  '[&>*:nth-child(10)]:[animation-delay:330ms] [&>*:nth-child(11)]:[animation-delay:360ms] [&>*:nth-child(12)]:[animation-delay:390ms]';

/**
 * Type MenuState
 *
 * @description
 * Current block or mention suggestion menu state.
 *
 * @type {| { readonly kind: 'block'; readonly items: readonly CwBlockType[]; readonly active: number } | { readonly kind: 'mention'; readonly items: readonly CwMentionPerson[]; readonly active: number; readonly query: string; readonly loading: boolean; }}
 */
type MenuState =
  | { readonly kind: 'block'; readonly items: readonly CwBlockType[]; readonly active: number }
  | {
      readonly kind: 'mention';
      readonly items: readonly CwMentionPerson[];
      readonly active: number;
      readonly query: string;
      readonly loading: boolean;
    };

/**
 * Interface PanelPosition
 *
 * @description
 * Position of an editor overlay.
 */
interface PanelPosition {
  // #region Properties
  /**
   * Property x
   *
   * @description
   * Horizontal position in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly x: number;

  /**
   * Property y
   *
   * @description
   * Vertical position in pixels.
   *
   * @type {number}
   * @readonly
   */
  readonly y: number;

  /**
   * Property above
   *
   * @description
   * Whether the panel is above its anchor.
   *
   * @type {boolean}
   * @readonly
   */
  readonly above: boolean;
  // #endregion
}

/**
 * Interface NameParts
 *
 * @description
 * A name split around the typed query, for the bold match of the « @ » menu.
 */
interface NameParts {
  // #region Properties
  /**
   * Property before
   *
   * @description
   * Name text preceding the match.
   *
   * @type {string}
   * @readonly
   */
  readonly before: string;

  /**
   * Property match
   *
   * @description
   * Matching portion of the name.
   *
   * @type {string}
   * @readonly
   */
  readonly match: string;

  /**
   * Property after
   *
   * @description
   * Name text following the match.
   *
   * @type {string}
   * @readonly
   */
  readonly after: string;
  // #endregion
}

/**
 * Function fold
 *
 * @description
 * Normalizes text for case- and accent-insensitive matching.
 *
 * @param {string} text - Text to normalize.
 * @returns {string[]} Normalized characters.
 */
function fold(text: string): string[] {
  return Array.from(text).map((char) => char.normalize('NFD').charAt(0).toLocaleLowerCase('fr'));
}

/**
 * Function splitName
 *
 * @description
 * Splits a name around a matched query.
 *
 * @param {string} name - Name to search or attribute name.
 * @param {string} query - Query used to filter or highlight.
 * @returns {NameParts} Name segments around the match.
 */
function splitName(name: string, query: string): NameParts {
  const chars: string[] = Array.from(name);
  const haystack: string = fold(name).join('');
  const needle: string = fold(query).join('');
  const index: number = needle === '' ? -1 : haystack.indexOf(needle);
  if (index < 0) return { before: name, match: '', after: '' };
  const length: number = Array.from(needle).length;
  return {
    before: chars.slice(0, index).join(''),
    match: chars.slice(index, index + length).join(''),
    after: chars.slice(index + length).join(''),
  };
}

/**
 * Function connected
 *
 * @description
 * Builds overlay positioning for a panel above or below its anchor.
 *
 * @param {boolean} above - Whether the panel is above the anchor.
 * @returns {ConnectedPosition} Overlay position.
 */
function connected(above: boolean): ConnectedPosition {
  return {
    originX: 'start',
    originY: above ? 'top' : 'bottom',
    overlayX: 'start',
    overlayY: above ? 'bottom' : 'top',
  };
}

/**
 * Component CwBlockEditor
 *
 * @description
 * Rich text editing stored as Markdown: a document, a task description, the field of a comment (mockup App.dc.html, document editor and description; the CommentComposer sheet builds on it). `[(value)]` is the Markdown (the grammar `cw-markdown` reads: `**gras**`, `*italique*`, `__souligné__`, `~~barré~~`, `` `code` ``, links, headings, lists, tasks, quotes, code blocks, separators, `@[Nom](id)` mentions). The editor works with Signal Forms (`[formField]`, it is a `FormValueControl<string>`) and with Reactive or template-driven forms (it is the control's value accessor); `aria-invalid` is set when the control is invalid and touched. The surface is `role="textbox" aria-multiline="true"`, named by `ariaLabel`. Typing Markdown shorthands converts the block (`# `, `- `, `1. `, `[ ] `, `> `, ` ``` `, `---`). « / » at the start of a line opens the block menu (`blockTypes`, the ten types of the mockup by default); « @ » opens the people menu when `mentionSearch` is given. Both are listboxes the surface points to with `aria-activedescendant`: ↑ ↓ choose, Entrée or Tab insert, Échap closes and keeps the text; the number of results is announced. Ctrl + B, I, U, E and Ctrl + Maj + X toggle the marks; Ctrl + K opens the link panel; Ctrl + Entrée emits `ctrlEnter` (no line break). With `toolbar`, a formatting toolbar sits above the text (`role="toolbar"`, one Tab stop, ← →): block type menu, the five marks with `aria-pressed`, link, lists, task, quote, code, separator. Without it, a host drives the editor through `toggleMark`, `setBlock`, `openLink`, `startMention` and reads `activeMarks`, `activeBlock`, `linkActive`, `mentions`. The engine (Tiptap) is created after the first render in the browser and destroyed with the component; nothing outside this entry point loads it.
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
  // #region Properties
  /**
   * Property value
   *
   * @description
   * The text, in Markdown; `[(value)]`.
   *
   * @type {ModelSignal<string>}
   * @readonly
   */
  public readonly value: ModelSignal<string> = model('');

  /**
   * Property variant
   *
   * @description
   * Layout of the editable surface.
   *
   * @type {InputSignal<CwBlockEditorVariant>}
   * @readonly
   */
  public readonly variant: InputSignal<CwBlockEditorVariant> =
    input<CwBlockEditorVariant>('document');

  /**
   * Property placeholder
   *
   * @description
   * Shown when the document is empty.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly placeholder: InputSignal<string> = input(
    'Écrivez, ou tapez « / » pour insérer un bloc',
  );

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the editable surface.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('Contenu du document');

  /**
   * Property describedBy
   *
   * @description
   * Id of the element that describes the surface (an error message), `aria-describedby`.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly describedBy: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property toolbar
   *
   * @description
   * Shows the formatting toolbar above the text.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly toolbar: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property blockTypes
   *
   * @description
   * Entries of the « / » menu; empty turns the menu off.
   *
   * @type {InputSignal<readonly CwBlockType[]>}
   * @readonly
   */
  public readonly blockTypes: InputSignal<readonly CwBlockType[]> =
    input<readonly CwBlockType[]>(CW_BLOCK_TYPES);

  /**
   * Property mentionSearch
   *
   * @description
   * Looks people up after « @ »; without it, « @ » is plain text.
   *
   * @type {InputSignal<CwMentionSearch | null>}
   * @readonly
   */
  public readonly mentionSearch: InputSignal<CwMentionSearch | null> =
    input<CwMentionSearch | null>(null);

  /**
   * Property maxLength
   *
   * @description
   * Maximum number of characters (Signal Forms binds it from `maxLength`); read when the editor starts.
   *
   * @type {InputSignal<number | undefined>}
   * @readonly
   */
  public readonly maxLength: InputSignal<number | undefined> = input<number | undefined>(undefined);

  /**
   * Property labels
   *
   * @description
   * French texts, overridable one by one.
   *
   * @type {InputSignal<Partial<CwBlockEditorLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwBlockEditorLabels>> = input<
    Partial<CwBlockEditorLabels>
  >({});

  /**
   * Property disabled
   *
   * @description
   * Read-only, dimmed text (Signal Forms binds it from the field).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property invalid
   *
   * @description
   * Invalid state given by Signal Forms; shown once touched.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly invalid: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property touched
   *
   * @description
   * Touched state given by Signal Forms.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly touched: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property required
   *
   * @description
   * Required state given by Signal Forms; `aria-required`.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly required: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property touch
   *
   * @description
   * Emitted when the focus leaves the text: Signal Forms marks the field touched.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly touch: OutputEmitterRef<void> = output();

  /**
   * Property ctrlEnter
   *
   * @description
   * Emitted on Ctrl + Entrée (⌘ + Entrée): send or save.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly ctrlEnter: OutputEmitterRef<void> = output();

  /**
   * Property document
   *
   * @description
   * Document used to listen for outside interactions.
   *
   * @type {Document}
   * @readonly
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property injector
   *
   * @description
   * Injector used for work scheduled after rendering.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property announcer
   *
   * @description
   * Announces suggestion results to assistive technology.
   *
   * @type {LiveAnnouncer}
   * @readonly
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property ngControl
   *
   * @description
   * Optional Angular forms control bound to the editor.
   *
   * @type {NgControl | null}
   * @readonly
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property surface
   *
   * @description
   * Editable surface element.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly surface: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('surface');

  /**
   * Property menuPanel
   *
   * @description
   * Suggestion menu panel element.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly menuPanel: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('menuPanel');

  /**
   * Property linkPanel
   *
   * @description
   * Link editor panel element.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly linkPanel: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('linkPanel');

  /**
   * Property linkInput
   *
   * @description
   * Link address input element.
   *
   * @type {Signal<ElementRef<HTMLInputElement>>}
   * @readonly
   */
  private readonly linkInput: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required<ElementRef<HTMLInputElement>>('linkInput');

  /**
   * Property editor
   *
   * @description
   * Tiptap editor instance, once created.
   *
   * @type {Editor | null}
   */
  private editor: Editor | null = null;

  /**
   * Property lastMarkdown
   *
   * @description
   * Last Markdown value published or synchronized.
   *
   * @type {string}
   */
  private lastMarkdown: string = '';

  /**
   * Property ready
   *
   * @description
   * Whether the editor instance has been created.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly ready: WritableSignal<boolean> = signal(false);

  /**
   * Property revision
   *
   * @description
   * Counter updated on editor transactions to refresh derived state.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  private readonly revision: WritableSignal<number> = signal(0);

  /**
   * Property formDisabled
   *
   * @description
   * Disabled state supplied by Angular forms.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property accessorTouched
   *
   * @description
   * Whether Angular forms has been notified of blur.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly accessorTouched: WritableSignal<boolean> = signal(false);

  /**
   * Property onChange
   *
   * @description
   * Angular forms value-change callback.
   *
   * @type {(value: string) => void}
   */
  private onChange: (value: string) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Angular forms touch callback.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property menuCommand
   *
   * @description
   * Command for the current suggestion menu.
   *
   * @type {((item: never) => void) | null}
   */
  private menuCommand: ((item: never) => void) | null = null;

  /**
   * Property unmountMenu
   *
   * @description
   * Cleanup function for the mounted suggestion menu.
   *
   * @type {(() => void) | null}
   */
  private unmountMenu: (() => void) | null = null;

  /**
   * Property removeOutsideListener
   *
   * @description
   * Cleanup function for the outside pointer listener.
   *
   * @type {(() => void) | null}
   */
  private removeOutsideListener: (() => void) | null = null;

  /**
   * Property id
   *
   * @description
   * Unique prefix for editor element identifiers.
   *
   * @type {string}
   * @readonly
   */
  private readonly id: string = inject(_IdGenerator).getId('cw-block-editor-');

  /**
   * Property ids
   *
   * @description
   * Identifiers used by the suggestion menu.
   *
   * @type {{ menuTitle: string; listbox: string; option: string; }}
   * @readonly
   */
  protected readonly ids: { menuTitle: string; listbox: string; option: string } = {
    menuTitle: `${this.id}-menu-title`,
    listbox: `${this.id}-listbox`,
    option: `${this.id}-option-`,
  };

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<{ toolbar: string; blockType: string; blockMenu: string; mentionMenu: string; noResults: string; oneResult: string; manyResults: string; choose: string; insert: string; up: string; down: string; enter: string; link: string; linkPanel: string; linkUrl: string; linkPlaceholder: string; linkApply: string; emptyBlock: string; check: string; uncheck: string; task: string; }>}
   * @readonly
   */
  protected readonly text: Signal<{
    toolbar: string;
    blockType: string;
    blockMenu: string;
    mentionMenu: string;
    noResults: string;
    oneResult: string;
    manyResults: string;
    choose: string;
    insert: string;
    up: string;
    down: string;
    enter: string;
    link: string;
    linkPanel: string;
    linkUrl: string;
    linkPlaceholder: string;
    linkApply: string;
    emptyBlock: string;
    check: string;
    uncheck: string;
    task: string;
  }> = computed(() => ({ ...CW_BLOCK_EDITOR_LABELS, ...this.labels() }));

  /**
   * Property marks
   *
   * @description
   * Inline formatting buttons.
   *
   * @type {readonly CwInlineMarkButton[]}
   * @readonly
   */
  protected readonly marks: readonly CwInlineMarkButton[] = CW_INLINE_MARKS;

  /**
   * Property toolbarBlocks
   *
   * @description
   * Block types displayed in the toolbar.
   *
   * @type {Signal<CwBlockType[]>}
   * @readonly
   */
  protected readonly toolbarBlocks: Signal<CwBlockType[]> = computed(() =>
    CW_TOOLBAR_BLOCKS.map((kind) => CW_BLOCK_TYPES.find((type) => type.kind === kind)).filter(
      (type): type is CwBlockType => type !== undefined,
    ),
  );

  /**
   * Property typeEntries
   *
   * @description
   * Block type choices excluding the separator.
   *
   * @type {CwBlockType[]}
   * @readonly
   */
  protected readonly typeEntries: CwBlockType[] = CW_BLOCK_TYPES.filter(
    (type) => type.kind !== 'hr',
  );

  /**
   * Property surfaceClasses
   *
   * @description
   * Editable surface classes for the current variant.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly surfaceClasses: Signal<string> = computed(
    () => `${SURFACE} ${VARIANTS[this.variant()]}`,
  );

  /**
   * Property isDisabled
   *
   * @description
   * Whether the editor is disabled by either forms API.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property toolStyle
   *
   * @description
   * Classes for formatting controls.
   *
   * @type {string}
   * @readonly
   */
  protected readonly toolStyle: string = TOOL;

  /**
   * Property toolbarFrame
   *
   * @description
   * Classes for the toolbar frame.
   *
   * @type {string}
   * @readonly
   */
  protected readonly toolbarFrame: string = TOOLBAR_FRAME;

  /**
   * Property listboxClasses
   *
   * @description
   * Classes for suggestion menus.
   *
   * @type {string}
   * @readonly
   */
  protected readonly listboxClasses: string = LISTBOX;

  /**
   * Property menu
   *
   * @description
   * Current suggestion menu state.
   *
   * @type {WritableSignal<MenuState | null>}
   * @readonly
   */
  protected readonly menu: WritableSignal<MenuState | null> = signal<MenuState | null>(null);

  /**
   * Property menuPosition
   *
   * @description
   * Position of the suggestion menu.
   *
   * @type {WritableSignal<PanelPosition | null>}
   * @readonly
   */
  protected readonly menuPosition: WritableSignal<PanelPosition | null> =
    signal<PanelPosition | null>(null);

  /**
   * Property menuFrom
   *
   * @description
   * Overlay origin for the suggestion menu.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly menuFrom: Signal<string> = computed(() =>
    ɵmenuFrom(connected(this.menuPosition()?.above ?? false)),
  );

  /**
   * Property link
   *
   * @description
   * Position of the link panel.
   *
   * @type {WritableSignal<PanelPosition | null>}
   * @readonly
   */
  protected readonly link: WritableSignal<PanelPosition | null> = signal<PanelPosition | null>(
    null,
  );

  /**
   * Property linkUrl
   *
   * @description
   * Address entered in the link panel.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  protected readonly linkUrl: WritableSignal<string> = signal('');

  /**
   * Property linkFrom
   *
   * @description
   * Overlay origin for the link panel.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly linkFrom: Signal<string> = computed(() =>
    ɵmenuFrom(connected(this.link()?.above ?? false)),
  );

  /**
   * Property activeMarks
   *
   * @description
   * The inline marks under the selection.
   *
   * @type {Signal<ReadonlySet<CwInlineMark>>}
   * @readonly
   */
  public readonly activeMarks: Signal<ReadonlySet<CwInlineMark>> = computed<
    ReadonlySet<CwInlineMark>
  >(() => {
    this.revision();
    const editor: Editor | null = this.ready() ? this.editor : null;
    if (!editor) return new Set();
    return new Set(this.marks.map((button) => button.mark).filter((mark) => editor.isActive(mark)));
  });

  /**
   * Property activeBlock
   *
   * @description
   * The block under the selection.
   *
   * @type {Signal<CwBlockKind>}
   * @readonly
   */
  public readonly activeBlock: Signal<CwBlockKind> = computed<CwBlockKind>(() => {
    this.revision();
    const editor: Editor | null = this.ready() ? this.editor : null;
    return editor ? activeBlock(editor) : 'p';
  });

  /**
   * Property linkActive
   *
   * @description
   * Whether the selection is inside a link.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly linkActive: Signal<boolean> = computed(() => {
    this.revision();
    const editor: Editor | null = this.ready() ? this.editor : null;
    return editor ? editor.isActive('link') : false;
  });

  /**
   * Property mentions
   *
   * @description
   * The ids of the people mentioned in the text, each once, in reading order.
   *
   * @type {Signal<readonly string[]>}
   * @readonly
   */
  public readonly mentions: Signal<readonly string[]> = computed<readonly string[]>(() => {
    this.revision();
    const editor: Editor | null = this.ready() ? this.editor : null;
    if (!editor) return [];
    const ids: string[] = [];
    editor.state.doc.descendants((node) => {
      const id: unknown = node.attrs['id'];
      if (node.type.name === 'mention' && typeof id === 'string' && !ids.includes(id)) ids.push(id);
    });
    return ids;
  });

  /**
   * Property typeLabel
   *
   * @description
   * Displayed label of the active block type.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly typeLabel: Signal<string> = computed(
    () =>
      this.typeEntries.find((type) => type.kind === this.activeBlock())?.label ??
      this.typeEntries[0].label,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Initializes the editor after rendering and synchronizes forms and accessibility state.
   *
   * @constructor
   */
  public constructor() {
    // Reactive and template-driven forms: this editor is the control's value accessor, set here
    // rather than through NG_VALUE_ACCESSOR so it can read the control's validity.
    if (this.ngControl) this.ngControl.valueAccessor = this;

    afterNextRender(() => {
      this.createEditor();
    });

    effect(() => {
      const value: string = this.value();
      if (!this.ready()) return;
      untracked(() => {
        this.syncValue(value);
      });
    });

    effect(() => {
      const editable: boolean = !this.isDisabled();
      if (!this.ready()) return;
      untracked(() => this.editor?.setEditable(editable, false));
    });

    // ARIA state of the surface the engine renders: written on its element, outside the
    // attributes the engine manages.
    effect(() => {
      if (!this.ready() || !this.editor) return;
      const dom: HTMLElement = this.editor.view.dom;
      const menu: MenuState | null = this.menu();
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
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Moves the focus to the text (Signal Forms calls it to focus the first invalid field).
   *
   * @param {FocusOptions} options - Focus options.
   */
  public focus(options?: FocusOptions): void {
    if (this.editor)
      this.editor.commands.focus(undefined, { scrollIntoView: !options?.preventScroll });
  }

  /**
   * Method toggleMark
   *
   * @description
   * Toggles an inline mark on the selection (Ctrl + B, I, U, E, Maj + X).
   *
   * @param {CwInlineMark} mark - Inline mark to toggle or inspect.
   */
  public toggleMark(mark: CwInlineMark): void {
    if (!this.editor || this.isDisabled()) return;
    this.editor.chain().focus().toggleMark(mark).run();
  }

  /**
   * Method setBlock
   *
   * @description
   * Turns the current block into `kind`; choosing the type it already has turns it back into text (mockup App.dc.html, toolbar type menu). `hr` inserts a separator.
   *
   * @param {CwBlockKind} kind - Block or suggestion menu kind.
   */
  public setBlock(kind: CwBlockKind): void {
    if (!this.editor || this.isDisabled()) return;
    const current: CwBlockKind = activeBlock(this.editor);
    applyBlock(this.editor, kind === current && kind !== 'p' && kind !== 'hr' ? 'p' : kind);
  }

  /**
   * Method openLink
   *
   * @description
   * Opens the link panel under the selection (Ctrl + K), filled with the current address.
   */
  public openLink(): void {
    const editor: Editor | null = this.editor;
    if (!editor || this.isDisabled()) return;
    const href: unknown = editor.getAttributes('link')['href'];
    this.linkUrl.set(typeof href === 'string' ? href : '');
    this.closeMenu();
    const { from, to }: { from: number; to: number } = editor.state.selection;
    const reference: { getBoundingClientRect: () => DOMRect } = {
      getBoundingClientRect: () => this.selectionRect(from, to),
    };
    this.link.set({ x: 0, y: 0, above: false });
    afterNextRender(
      () => {
        const panel: HTMLElement = this.linkPanel().nativeElement;
        void computePosition(reference, panel, {
          strategy: 'fixed',
          placement: 'bottom-start',
          middleware: [offset(4), flip(), shift({ padding: 8 })],
        }).then(({ x, y, placement }: { x: number; y: number; placement: string }) => {
          if (this.link()) this.link.set({ x, y, above: placement.startsWith('top') });
        });
        this.linkInput().nativeElement.focus();
        this.listenOutside(panel);
      },
      { injector: this.injector },
    );
  }

  /**
   * Method startMention
   *
   * @description
   * Inserts « @ » at the caret, which opens the people menu (the composer's Mention button).
   */
  public startMention(): void {
    const editor: Editor | null = this.editor;
    if (!editor || this.isDisabled()) return;
    const { $from }: { $from: ResolvedPos } = editor.state.selection;
    const before: string = $from.parent.textBetween(
      Math.max(0, $from.parentOffset - 1),
      $from.parentOffset,
    );
    editor
      .chain()
      .focus()
      .insertContent(before !== '' && !/\s/.test(before) ? ' @' : '@')
      .run();
  }

  /**
   * Method writeValue
   *
   * @description
   * Updates the Markdown value from Angular forms.
   *
   * @param {unknown} value - Value to write or synchronize.
   */
  public writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the Angular forms value-change callback.
   *
   * @param {(value: string) => void} fn - Callback registered by Angular forms.
   */
  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   *
   * @description
   * Registers the Angular forms touch callback.
   *
   * @param {() => void} fn - Callback registered by Angular forms.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   *
   * @description
   * Updates the disabled state from Angular forms.
   *
   * @param {boolean} isDisabled - Disabled state supplied by Angular forms.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Method isInvalid
   *
   * @description
   * Checks whether the editor should expose an invalid state.
   * @returns {boolean} Whether the editor is invalid and touched.
   */
  protected isInvalid(): boolean {
    if (this.invalid() && this.touched()) return true;
    const control: NgControl | null = this.ngControl;
    return (
      !!control && control.invalid === true && (control.touched === true || this.accessorTouched())
    );
  }

  /**
   * Method isMarkActive
   *
   * @description
   * Checks whether the selection has an inline mark.
   *
   * @param {CwInlineMark} mark - Inline mark to toggle or inspect.
   * @returns {boolean} Whether the mark is active.
   */
  protected isMarkActive(mark: CwInlineMark): boolean {
    return this.activeMarks().has(mark);
  }

  /**
   * Method onTypeChosen
   *
   * @description
   * Applies a selected block type.
   *
   * @param {string | undefined} kind - Block or suggestion menu kind.
   */
  protected onTypeChosen(kind: string | undefined): void {
    const type: CwBlockType | undefined = this.typeEntries.find((entry) => entry.kind === kind);
    if (type) this.setBlock(type.kind);
  }

  /**
   * Method refocus
   *
   * @description
   * Returns focus to the editor after the menu closes.
   */
  protected refocus(): void {
    // The menu gives the focus back to its trigger when it closes; the caret goes back to the text.
    setTimeout(() => this.editor?.commands.focus(), 0);
  }

  /**
   * Method optionId
   *
   * @description
   * Builds the identifier of a suggestion option.
   *
   * @param {number} index - Suggestion index.
   * @returns {string} Suggestion option identifier.
   */
  protected optionId(index: number): string {
    return `${this.ids.option}${String(index)}`;
  }

  /**
   * Method nameParts
   *
   * @description
   * Splits a suggested name around the query.
   *
   * @param {string} name - Name to search or attribute name.
   * @param {string} query - Query used to filter or highlight.
   * @returns {NameParts} Name segments around the match.
   */
  protected nameParts(name: string, query: string): NameParts {
    return splitName(name, query);
  }

  /**
   * Method highlight
   *
   * @description
   * Highlights a suggestion by index.
   *
   * @param {number} index - Suggestion index.
   */
  protected highlight(index: number): void {
    this.menu.update((state) =>
      state && state.active !== index ? { ...state, active: index } : state,
    );
  }

  /**
   * Method choose
   *
   * @description
   * Runs the command for a suggestion by index.
   *
   * @param {number} index - Suggestion index.
   */
  protected choose(index: number): void {
    const state: MenuState | null = this.menu();
    const command: ((item: never) => void) | null = this.menuCommand;
    if (!state || !command) return;
    if (index < 0 || index >= state.items.length) return;
    const item: CwBlockType | CwMentionPerson = state.items[index];
    (command as (value: CwBlockType | CwMentionPerson) => void)(item);
  }

  /**
   * Method onLinkInput
   *
   * @description
   * Updates the link address from input.
   *
   * @param {Event} event - Browser event from the interaction.
   */
  protected onLinkInput(event: Event): void {
    this.linkUrl.set((event.target as HTMLInputElement).value);
  }

  /**
   * Method onLinkKeydown
   *
   * @description
   * Applies or closes the link panel using the keyboard.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   */
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

  /**
   * Method applyLink
   *
   * @description
   * Applies the address of the link panel (mockup App.dc.html, `applyLink`).
   */
  protected applyLink(): void {
    const editor: Editor | null = this.editor;
    const url: string = this.linkUrl().trim();
    this.closeLink(false);
    if (!editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const href: string =
      /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('/') || url.startsWith('#')
        ? url
        : `https://${url}`;
    const { empty }: { empty: boolean } = editor.state.selection;
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

  /**
   * Method closeLink
   *
   * @description
   * Closes the link panel and optionally returns focus.
   *
   * @param {boolean} refocus - Whether to return focus to the editor.
   */
  private closeLink(refocus: boolean): void {
    this.link.set(null);
    this.removeOutsideListener?.();
    this.removeOutsideListener = null;
    if (refocus) this.editor?.commands.focus();
  }

  /**
   * Method listenOutside
   *
   * @description
   * Closes the link panel when the pointer lands outside it.
   *
   * @param {HTMLElement} panel - Panel to monitor for outside interactions.
   */
  private listenOutside(panel: HTMLElement): void {
    this.removeOutsideListener?.();
    const listener: (event: Event) => void = (event: Event): void => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      this.closeLink(false);
    };
    this.document.addEventListener('pointerdown', listener, true);
    this.removeOutsideListener = () => {
      this.document.removeEventListener('pointerdown', listener, true);
    };
  }

  /**
   * Method selectionRect
   *
   * @description
   * Finds the screen rectangle of the editor selection.
   *
   * @param {number} from - Start position of the selection.
   * @param {number} to - End position of the selection.
   * @returns {DOMRect} Selection rectangle in viewport coordinates.
   */
  private selectionRect(from: number, to: number): DOMRect {
    const editor: Editor | null = this.editor;
    try {
      if (editor) {
        const start: { left: number; right: number; top: number; bottom: number } =
          editor.view.coordsAtPos(from);
        const end: { left: number; right: number; top: number; bottom: number } =
          editor.view.coordsAtPos(to);
        const left: number = Math.min(start.left, end.left);
        return new DOMRect(left, start.top, Math.max(end.right - left, 1), end.bottom - start.top);
      }
    } catch {
      // No layout (a hidden editor): fall back on the surface.
    }
    return this.surface().nativeElement.getBoundingClientRect();
  }

  /**
   * Method createEditor
   *
   * @description
   * Creates the editor and connects its extensions and events.
   */
  private createEditor(): void {
    const labels: () => CwBlockEditorLabels = (): CwBlockEditorLabels => this.text();
    this.lastMarkdown = this.value();
    const editor: Editor = new Editor({
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
      onUpdate: ({ editor: instance }: { editor: Editor }) => {
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

  /**
   * Method publish
   *
   * @description
   * Publishes changed Markdown to the model and Angular forms.
   *
   * @param {string} markdown - Markdown value to publish.
   */
  private publish(markdown: string): void {
    if (markdown === this.lastMarkdown) return;
    this.lastMarkdown = markdown;
    this.value.set(markdown);
    this.onChange(markdown);
  }

  /**
   * Method syncValue
   *
   * @description
   * Synchronizes an external Markdown value to the editor.
   *
   * @param {string} value - Value to write or synchronize.
   */
  private syncValue(value: string): void {
    if (!this.editor || value === this.lastMarkdown) return;
    this.lastMarkdown = value;
    this.editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false });
  }

  /**
   * Method blockItems
   *
   * @description
   * Filters block types for the current query.
   *
   * @param {string} query - Query used to filter or highlight.
   * @returns {CwBlockType[]} Block types matching the query.
   */
  private blockItems(query: string): CwBlockType[] {
    const needle: string = fold(query.trim()).join('');
    return this.blockTypes().filter(
      (type) =>
        needle === '' ||
        fold(type.label).join('').includes(needle) ||
        (type.hint ?? '').startsWith(query.trim()),
    );
  }

  /**
   * Method searchPeople
   *
   * @description
   * Searches mentions and resolves on the first result or abort.
   *
   * @param {string} query - Query used to filter or highlight.
   * @param {AbortSignal} abort - Signal used to cancel the search.
   * @returns {Promise<CwMentionPerson[]>} Promise resolving to matching people.
   */
  private searchPeople(query: string, abort: AbortSignal): Promise<CwMentionPerson[]> {
    const search: CwMentionSearch | null = this.mentionSearch();
    if (!search) return Promise.resolve([]);
    return new Promise((resolve) => {
      let settled: boolean = false;
      const settle: (people: readonly CwMentionPerson[]) => void = (
        people: readonly CwMentionPerson[],
      ): void => {
        if (settled) return;
        settled = true;
        resolve([...people]);
      };
      // The first list only: `take(1)` ends the subscription once it arrives.
      const subscription: Subscription = search(query)
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

  /**
   * Method renderer
   *
   * @description
   * Creates the callbacks used by a suggestion menu.
   *
   * @param {MenuState['kind']} kind - Block or suggestion menu kind.
   * @returns {SuggestionRenderer<I>} Suggestion callbacks for the requested menu.
   */
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
              onPosition: ({ x, y, placement }: { x: number; y: number; placement: string }) => {
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

  /**
   * Method showMenu
   *
   * @description
   * Updates and announces the current suggestion menu.
   *
   * @param {MenuState['kind']} kind - Block or suggestion menu kind.
   * @param {SuggestionProps<I, I>} props - Suggestion state supplied by the editor.
   */
  private showMenu<I extends CwBlockType | CwMentionPerson>(
    kind: MenuState['kind'],
    props: SuggestionProps<I, I>,
  ): void {
    const previous: MenuState | null = this.menu();
    const active: number = previous?.kind === kind ? previous.active : 0;
    const count: number = props.items.length;
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
      const text: {
        toolbar: string;
        blockType: string;
        blockMenu: string;
        mentionMenu: string;
        noResults: string;
        oneResult: string;
        manyResults: string;
        choose: string;
        insert: string;
        up: string;
        down: string;
        enter: string;
        link: string;
        linkPanel: string;
        linkUrl: string;
        linkPlaceholder: string;
        linkApply: string;
        emptyBlock: string;
        check: string;
        uncheck: string;
        task: string;
      } = this.text();
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

  /**
   * Method onMenuKeydown
   *
   * @description
   * Handles suggestion navigation and selection keys.
   *
   * @param {KeyboardEvent} event - Browser event from the interaction.
   * @returns {boolean} Whether the event was handled.
   */
  private onMenuKeydown(event: KeyboardEvent): boolean {
    const state: MenuState | null = this.menu();
    if (!state) return false;
    const count: number = state.items.length;
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

  /**
   * Method closeMenu
   *
   * @description
   * Unmounts and clears the suggestion menu.
   */
  private closeMenu(): void {
    this.unmountMenu?.();
    this.unmountMenu = null;
    this.menuCommand = null;
    this.menu.set(null);
    this.menuPosition.set(null);
  }
  // #endregion
}

/**
 * Function setAttribute
 *
 * @description
 * Sets or removes an attribute on an element.
 *
 * @param {HTMLElement} element - Element whose attribute is updated.
 * @param {string} name - Name to search or attribute name.
 * @param {string | null} value - Value to write or synchronize.
 */
function setAttribute(element: HTMLElement, name: string, value: string | null): void {
  if (value === null || value === '') element.removeAttribute(name);
  else if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}
