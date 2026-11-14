import { _IdGenerator } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  type InputSignal,
  type InputSignalWithTransform,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwAttachment } from '@cadenway/ui/components/attachment';
import { CwAvatar } from '@cadenway/ui/components/avatar';
import { CwBlockEditor, type CwMentionSearch } from '@cadenway/ui/components/block-editor';
import { CwButton } from '@cadenway/ui/components/button';
import { CwKbd } from '@cadenway/ui/components/kbd';
import { CwToolbar, CwToolbarItem, CwToolbarSeparator } from '@cadenway/ui/components/toolbar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorAtBold,
  phosphorCodeBold,
  phosphorLinkSimpleBold,
  phosphorListBulletsBold,
  phosphorLockSimpleBold,
  phosphorPaperPlaneTiltBold,
  phosphorPaperclipBold,
  phosphorTextBBold,
  phosphorTextItalicBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { CW_COMMENT_COMPOSER_LABELS, CW_COMPOSER_COMMANDS } from './comment-composer.constants';
import type {
  CwAttachmentDraft,
  CwCommentComposerLabels,
  CwCommentComposerMode,
  CwCommentComposerVariant,
  CwCommentSubmit,
  CwComposerCommand,
  CwPerson,
} from './comment-composer.types';

/* The frame (CommentComposer sheet, anatomy 1, and preview): input border, amethyst border and
   20 % halo on focus (`FOCUS_WITHIN`), `destructive/60` border when the text is invalid. The
   compact variant at rest is one 36 px row. `@container` lets the Ctrl Entrée help hide under
   420 px. */
/**
 * Constant FRAME
 *
 * @description
 * Base frame classes with focus and invalid states.
 *
 * @type {string}
 */
const FRAME: string =
  'group/composer @container flex w-full min-w-0 rounded-lg border border-input bg-background transition-[color,box-shadow] ' +
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 has-[[aria-invalid=true]]:border-destructive/60';

/**
 * Constant LAYOUTS
 *
 * @description
 * Frame classes for expanded, collapsed and disabled layouts.
 *
 * @type {Readonly<Record<'expanded' | 'collapsed' | 'disabled', string>>}
 */
const LAYOUTS: Readonly<Record<'expanded' | 'collapsed' | 'disabled', string>> = {
  expanded: `${FRAME} flex-col`,
  collapsed: `${FRAME} min-h-9 flex-row flex-wrap items-center`,
  disabled: `${FRAME} min-h-9 cursor-not-allowed flex-row items-center opacity-50`,
} as const;

/* A formatting button of the bar: muted, ink when pressed on `bg-selected` (preview). */
/**
 * Constant TOOL
 *
 * @description
 * Formatting button classes for hover and selected states.
 *
 * @type {'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected'}
 */
const TOOL: 'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected' =
  'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected';

/**
 * Component CwCommentComposer
 *
 * @description
 * The comment editor of a task: formatted text, « @ » mentions, « / » blocks, attachments, sent with Ctrl + Entrée (CommentComposer sheet of the Design System artifact; mockup App.dc.html, comment box of the task panel). Built on `cw-block-editor`: `[(value)]` is the Markdown of the comment. It works with Signal Forms (`FormValueControl<string>`) and Reactive or template-driven forms (value accessor). `variant="full"` shows the toolbar (Gras, Italique, Lien, Liste à puces, Code │ Mention, Joindre), the Ctrl Entrée help (hidden under 420 px) and Envoyer; `compact` is one 36 px line (Joindre, Envoyer) that grows into the editor with a shorter bar when the text gets the focus and stays grown while it has text or files. `mode="edit"` shows Annuler and Enregistrer, and Échap cancels; in a compact empty composer, Échap gives the focus back and the line shrinks. Envoyer (or Enregistrer, or Ctrl + Entrée) emits `submit` only when the text is not empty, not `sending`, and no file is still uploading. `attachments` (model) shows each file as a compact `cw-attachment`; Joindre, a paste or a drop of files emits `filesAdded` (the host uploads and updates `attachments`); Retirer or Annuler l'envoi removes the file and emits `attachmentRemove`. `sending` puts Envoyer in its loading state. `error` sets `aria-invalid` on the text, shows the message under the frame (`role="alert"`, linked by `aria-describedby`) with Réessayer (`retry`); the text is kept. `disabled` shows `disabledText` with a lock instead of the editor.
 */
@Component({
  selector: 'cw-comment-composer',
  imports: [
    CwAttachment,
    CwAvatar,
    CwBlockEditor,
    CwButton,
    CwKbd,
    CwToolbar,
    CwToolbarItem,
    CwToolbarSeparator,
    NgIcon,
  ],
  providers: [
    provideIcons({
      phosphorAtBold,
      phosphorCodeBold,
      phosphorLinkSimpleBold,
      phosphorListBulletsBold,
      phosphorLockSimpleBold,
      phosphorPaperPlaneTiltBold,
      phosphorPaperclipBold,
      phosphorTextBBold,
      phosphorTextItalicBold,
      phosphorWarningCircleFill,
    }),
  ],
  host: {
    class: 'flex w-full min-w-0 flex-col',
    '[attr.id]': 'null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-mode]': 'mode()',
    '[attr.data-empty]': 'empty() ? "" : null',
    '[attr.data-expanded]': 'variant() === "compact" && expanded() ? "" : null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
  },
  templateUrl: './comment-composer.component.html',
})
export class CwCommentComposer implements FormValueControl<string>, ControlValueAccessor {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * The comment, in Markdown; `[(value)]`.
   *
   * @type {ModelSignal<string>}
   * @readonly
   */
  public readonly value: ModelSignal<string> = model('');

  /**
   * Property variant
   *
   * @description
   * Complete editor or one line.
   *
   * @type {InputSignal<CwCommentComposerVariant>}
   * @readonly
   */
  public readonly variant: InputSignal<CwCommentComposerVariant> =
    input<CwCommentComposerVariant>('full');

  /**
   * Property mode
   *
   * @description
   * Envoyer, or Annuler and Enregistrer.
   *
   * @type {InputSignal<CwCommentComposerMode>}
   * @readonly
   */
  public readonly mode: InputSignal<CwCommentComposerMode> = input<CwCommentComposerMode>('create');

  /**
   * Property placeholder
   *
   * @description
   * Shown while the text is empty.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly placeholder: InputSignal<string> = input('Écrire un commentaire…');

  /**
   * Property author
   *
   * @description
   * The writer, shown on the left.
   *
   * @type {InputSignal<CwPerson | null>}
   * @readonly
   */
  public readonly author: InputSignal<CwPerson | null> = input<CwPerson | null>(null);

  /**
   * Property mentionSearch
   *
   * @description
   * People offered after « @ »; without it there is no Mention button.
   *
   * @type {InputSignal<CwMentionSearch | null>}
   * @readonly
   */
  public readonly mentionSearch: InputSignal<CwMentionSearch | null> =
    input<CwMentionSearch | null>(null);

  /**
   * Property commands
   *
   * @description
   * Blocks offered after « / » at the start of a line.
   *
   * @type {InputSignal<readonly CwComposerCommand[]>}
   * @readonly
   */
  public readonly commands: InputSignal<readonly CwComposerCommand[]> =
    input<readonly CwComposerCommand[]>(CW_COMPOSER_COMMANDS);

  /**
   * Property attachments
   *
   * @description
   * Files joined to the comment and their upload; `[(attachments)]`.
   *
   * @type {ModelSignal<readonly CwAttachmentDraft[]>}
   * @readonly
   */
  public readonly attachments: ModelSignal<readonly CwAttachmentDraft[]> = model<
    readonly CwAttachmentDraft[]
  >([]);

  /**
   * Property disabled
   *
   * @description
   * Read-only: the editor is replaced by `disabledText` (Signal Forms binds it from the field).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property disabledText
   *
   * @description
   * Text shown when disabled.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly disabledText: InputSignal<string> = input('Commentaires désactivés');

  /**
   * Property sending
   *
   * @description
   * The comment is being sent: Envoyer shows its spinner.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly sending: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property error
   *
   * @description
   * The send failure message; the text is kept.
   *
   * @type {InputSignal<string | null>}
   * @readonly
   */
  public readonly error: InputSignal<string | null> = input<string | null>(null);

  /**
   * Property labels
   *
   * @description
   * French texts, overridable one by one.
   *
   * @type {InputSignal<Partial<CwCommentComposerLabels>>}
   * @readonly
   */
  public readonly labels: InputSignal<Partial<CwCommentComposerLabels>> = input<
    Partial<CwCommentComposerLabels>
  >({});

  /**
   * Property submit
   *
   * @description
   * Envoyer, Enregistrer or Ctrl + Entrée, with a non-empty text and every file uploaded.
   *
   * @type {OutputEmitterRef<CwCommentSubmit>}
   * @readonly
   */
  public readonly submit: OutputEmitterRef<CwCommentSubmit> = output<CwCommentSubmit>();

  /**
   * Property cancel
   *
   * @description
   * Annuler, or Échap in edit mode.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly cancel: OutputEmitterRef<void> = output();

  /**
   * Property filesAdded
   *
   * @description
   * Files chosen with Joindre, pasted or dropped.
   *
   * @type {OutputEmitterRef<File[]>}
   * @readonly
   */
  public readonly filesAdded: OutputEmitterRef<File[]> = output<File[]>();

  /**
   * Property attachmentRemove
   *
   * @description
   * Id of a file removed, or whose upload was cancelled.
   *
   * @type {OutputEmitterRef<string>}
   * @readonly
   */
  public readonly attachmentRemove: OutputEmitterRef<string> = output<string>();

  /**
   * Property attachmentRetry
   *
   * @description
   * Id of a failed file whose upload should start again.
   *
   * @type {OutputEmitterRef<string>}
   * @readonly
   */
  public readonly attachmentRetry: OutputEmitterRef<string> = output<string>();

  /**
   * Property retry
   *
   * @description
   * « Réessayer » under a send failure.
   *
   * @type {OutputEmitterRef<void>}
   * @readonly
   */
  public readonly retry: OutputEmitterRef<void> = output();

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
   * Property ngControl
   *
   * @description
   * Optional forms control whose value accessor is this composer.
   *
   * @type {NgControl | null}
   * @readonly
   */
  private readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  /**
   * Property frame
   *
   * @description
   * Composer frame used to track focus.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   * @readonly
   */
  private readonly frame: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('frame');

  /**
   * Property editor
   *
   * @description
   * Block editor used for text and formatting.
   *
   * @type {Signal<CwBlockEditor | undefined>}
   * @readonly
   */
  private readonly editor: Signal<CwBlockEditor | undefined> = viewChild(CwBlockEditor);

  /**
   * Property editorElement
   *
   * @description
   * Native editor host used to track focus.
   *
   * @type {Signal<ElementRef<HTMLElement> | undefined>}
   * @readonly
   */
  private readonly editorElement: Signal<ElementRef<HTMLElement> | undefined> = viewChild(
    CwBlockEditor,
    {
      read: ElementRef,
    },
  );

  /**
   * Property fileInput
   *
   * @description
   * Native file chooser used by the attach action.
   *
   * @type {Signal<ElementRef<HTMLInputElement>>}
   * @readonly
   */
  private readonly fileInput: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  /**
   * Property formDisabled
   *
   * @description
   * Disabled state supplied by a form control.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly formDisabled: WritableSignal<boolean> = signal(false);

  /**
   * Property focusedWithin
   *
   * @description
   * Whether focus keeps the compact composer expanded.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly focusedWithin: WritableSignal<boolean> = signal(false);

  /**
   * Property onChange
   *
   * @description
   * Callback notified when the comment value changes.
   *
   * @type {(value: string) => void}
   */
  private onChange: (value: string) => void = () => undefined;

  /**
   * Property onTouched
   *
   * @description
   * Callback notified when the editor is touched.
   *
   * @type {() => void}
   */
  private onTouched: () => void = () => undefined;

  /**
   * Property errorId
   *
   * @description
   * Unique identifier of the send-error message.
   *
   * @type {string}
   * @readonly
   */
  protected readonly errorId: string = `${inject(_IdGenerator).getId('cw-comment-composer-')}-error`;

  /**
   * Property text
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<{ editor: string; toolbar: string; formatting: string; bold: string; italic: string; link: string; bulletList: string; code: string; mention: string; attach: string; send: string; save: string; cancel: string; retry: string; sendKeys: readonly string[]; }>}
   * @readonly
   */
  protected readonly text: Signal<{
    editor: string;
    toolbar: string;
    formatting: string;
    bold: string;
    italic: string;
    link: string;
    bulletList: string;
    code: string;
    mention: string;
    attach: string;
    send: string;
    save: string;
    cancel: string;
    retry: string;
    sendKeys: readonly string[];
  }> = computed(() => ({ ...CW_COMMENT_COMPOSER_LABELS, ...this.labels() }));

  /**
   * Property isDisabled
   *
   * @description
   * Whether input or form state disables the composer.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly isDisabled: Signal<boolean> = computed(
    () => this.disabled() || this.formDisabled(),
  );

  /**
   * Property empty
   *
   * @description
   * Whether the trimmed comment text is empty.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly empty: Signal<boolean> = computed(() => this.value().trim() === '');

  /**
   * Property uploading
   *
   * @description
   * Whether an attachment is uploading or processing.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly uploading: Signal<boolean> = computed(() =>
    this.attachments().some((file) => file.state === 'uploading' || file.state === 'processing'),
  );

  /**
   * Property canSubmit
   *
   * @description
   * Whether the comment can currently be sent.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly canSubmit: Signal<boolean> = computed(
    () => !this.isDisabled() && !this.sending() && !this.empty() && !this.uploading(),
  );

  /**
   * Property expanded
   *
   * @description
   * Whether the full editor is displayed; the compact line expands on focus or with content.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly expanded: Signal<boolean> = computed(
    () =>
      this.variant() === 'full' ||
      this.focusedWithin() ||
      !this.empty() ||
      this.attachments().length > 0 ||
      this.error() !== null,
  );

  /**
   * Property layout
   *
   * @description
   * Frame classes selected for the current composer state.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly layout: Signal<string> = computed(() =>
    this.isDisabled() ? LAYOUTS.disabled : this.expanded() ? LAYOUTS.expanded : LAYOUTS.collapsed,
  );

  /**
   * Property toolStyle
   *
   * @description
   * Formatting-button state classes.
   *
   * @type {'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected'}
   * @readonly
   */
  protected readonly toolStyle: 'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected' =
    TOOL;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Connects the composer to its optional form control.
   *
   * @constructor
   */
  public constructor() {
    // Reactive and template-driven forms: this composer is the control's value accessor.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }
  // #endregion

  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Moves the focus to the text.
   *
   * @param {FocusOptions} options - Optional browser focus behavior.
   */
  public focus(options?: FocusOptions): void {
    this.editor()?.focus(options);
  }

  /**
   * Method writeValue
   *
   * @description
   * Applies text supplied by the form control.
   *
   * @param {unknown} value - Value supplied by the form or editor.
   */
  public writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : '');
  }

  /**
   * Method registerOnChange
   *
   * @description
   * Registers the form value-change callback.
   *
   * @param {(value: string) => void} fn - Callback registered by the form control.
   */
  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Method registerOnTouched
   *
   * @description
   * Registers the form touched callback.
   *
   * @param {() => void} fn - Callback registered by the form control.
   */
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Method setDisabledState
   *
   * @description
   * Updates the disabled state supplied by the form.
   *
   * @param {boolean} isDisabled - Disabled state supplied by the form.
   */
  public setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  /**
   * Method onValueChange
   *
   * @description
   * Reports edited Markdown to the form control.
   *
   * @param {string} value - Value supplied by the form or editor.
   */
  protected onValueChange(value: string): void {
    this.onChange(value);
  }

  /**
   * Method onEditorTouched
   *
   * @description
   * Reports the editor touched state.
   */
  protected onEditorTouched(): void {
    this.onTouched();
    this.touch.emit();
  }

  /**
   * Method markActive
   *
   * @description
   * Checks whether a formatting mark is active.
   *
   * @param {'bold' | 'italic' | 'code'} mark - Formatting mark to inspect or toggle.
   * @returns {boolean} Whether the formatting mark is active.
   */
  protected markActive(mark: 'bold' | 'italic' | 'code'): boolean {
    return this.editor()?.activeMarks().has(mark) ?? false;
  }

  /**
   * Method bulletActive
   *
   * @description
   * Checks whether the active block is a bulleted list.
   * @returns {boolean} Whether the current block is a bulleted list.
   */
  protected bulletActive(): boolean {
    return this.editor()?.activeBlock() === 'li';
  }

  /**
   * Method linkActive
   *
   * @description
   * Checks whether the current selection has a link.
   * @returns {boolean} Whether the current selection has a link.
   */
  protected linkActive(): boolean {
    return this.editor()?.linkActive() ?? false;
  }

  /**
   * Method toggleMark
   *
   * @description
   * Toggles a formatting mark in the editor.
   *
   * @param {'bold' | 'italic' | 'code'} mark - Formatting mark to inspect or toggle.
   */
  protected toggleMark(mark: 'bold' | 'italic' | 'code'): void {
    this.editor()?.toggleMark(mark);
  }

  /**
   * Method toggleBulletList
   *
   * @description
   * Changes the current block to a bulleted list.
   */
  protected toggleBulletList(): void {
    this.editor()?.setBlock('li');
  }

  /**
   * Method openLink
   *
   * @description
   * Opens the editor link control.
   */
  protected openLink(): void {
    this.editor()?.openLink();
  }

  /**
   * Method mention
   *
   * @description
   * Starts a mention in the editor.
   */
  protected mention(): void {
    this.editor()?.startMention();
  }

  /**
   * Method chooseFiles
   *
   * @description
   * Opens the native attachment chooser.
   */
  protected chooseFiles(): void {
    this.fileInput().nativeElement.click();
  }

  /**
   * Method onFilesChosen
   *
   * @description
   * Reports files selected by the native chooser.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected onFilesChosen(event: Event): void {
    const field: HTMLInputElement = event.target as HTMLInputElement;
    const files: File[] = Array.from(field.files ?? []);
    field.value = '';
    if (files.length > 0) this.filesAdded.emit(files);
  }

  /**
   * Method onPaste
   *
   * @description
   * Reports pasted files when the composer is enabled.
   *
   * @param {ClipboardEvent} event - Browser event associated with the interaction.
   */
  protected onPaste(event: ClipboardEvent): void {
    const files: File[] = Array.from(event.clipboardData?.files ?? []);
    if (files.length === 0 || this.isDisabled()) return;
    event.preventDefault();
    this.filesAdded.emit(files);
  }

  /**
   * Method onDragOver
   *
   * @description
   * Allows file drops while the composer is enabled.
   *
   * @param {DragEvent} event - Browser event associated with the interaction.
   */
  protected onDragOver(event: DragEvent): void {
    if (this.isDisabled() || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
  }

  /**
   * Method onDrop
   *
   * @description
   * Reports files dropped onto the composer.
   *
   * @param {DragEvent} event - Browser event associated with the interaction.
   */
  protected onDrop(event: DragEvent): void {
    const files: File[] = Array.from(event.dataTransfer?.files ?? []);
    if (files.length === 0 || this.isDisabled()) return;
    event.preventDefault();
    this.filesAdded.emit(files);
  }

  /**
   * Method removeAttachment
   *
   * @description
   * Removes an attachment and reports its identifier.
   *
   * @param {string} id - Identifier of the attachment to remove.
   */
  protected removeAttachment(id: string): void {
    this.attachments.update((files) => files.filter((file) => file.id !== id));
    this.attachmentRemove.emit(id);
  }

  /**
   * Method onFocusIn
   *
   * @description
   * Expands the compact composer when its editor receives focus.
   *
   * @param {FocusEvent} event - Browser event associated with the interaction.
   */
  protected onFocusIn(event: FocusEvent): void {
    // Only the text grows the compact line: Joindre and Envoyer of the line keep their click.
    const editor: HTMLElement | undefined = this.editorElement()?.nativeElement;
    if (this.expanded() || (event.target instanceof Node && editor?.contains(event.target)))
      this.focusedWithin.set(true);
  }

  /**
   * Method onFocusOut
   *
   * @description
   * Clears focus state when focus leaves the frame.
   *
   * @param {FocusEvent} event - Browser event associated with the interaction.
   */
  protected onFocusOut(event: FocusEvent): void {
    const next: EventTarget | null = event.relatedTarget;
    const frame: HTMLElement | undefined = this.frame()?.nativeElement;
    if (next instanceof Node && frame?.contains(next)) return;
    this.focusedWithin.set(false);
  }

  /**
   * Method onKeydown
   *
   * @description
   * Cancels editing or collapses an empty compact composer on Escape.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected onKeydown(event: KeyboardEvent): void {
    // A key the editor already used (a menu open, the link panel) is not the composer's.
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (this.mode() === 'edit') {
      event.preventDefault();
      this.cancel.emit();
    } else if (this.variant() === 'compact' && this.empty()) {
      event.preventDefault();
      (event.target as HTMLElement | null)?.blur();
    }
  }

  /**
   * Method send
   *
   * @description
   * Emits `submit` when the comment can be sent.
   */
  protected send(): void {
    if (!this.canSubmit()) return;
    this.submit.emit({
      markdown: this.value().trim(),
      mentions: this.editor()?.mentions() ?? [],
      attachments: this.attachments()
        .filter((file) => file.state === 'done')
        .map((file) => file.id),
    });
  }
  // #endregion
}
