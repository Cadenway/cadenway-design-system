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
} from '@angular/core';
import { type ControlValueAccessor, NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { CwAttachment } from '@cadenway/ui/attachment';
import { CwAvatar } from '@cadenway/ui/avatar';
import { CwBlockEditor, type CwMentionSearch } from '@cadenway/ui/block-editor';
import { CwButton } from '@cadenway/ui/button';
import { CwKbd } from '@cadenway/ui/kbd';
import { CwToolbar, CwToolbarItem, CwToolbarSeparator } from '@cadenway/ui/toolbar';
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
const FRAME =
  'group/composer @container flex w-full min-w-0 rounded-lg border border-input bg-background transition-[color,box-shadow] ' +
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20 has-[[aria-invalid=true]]:border-destructive/60';

const LAYOUTS = {
  expanded: `${FRAME} flex-col`,
  collapsed: `${FRAME} min-h-9 flex-row flex-wrap items-center`,
  disabled: `${FRAME} min-h-9 cursor-not-allowed flex-row items-center opacity-50`,
} as const;

/* A formatting button of the bar: muted, ink when pressed on `bg-selected` (preview). */
const TOOL =
  'text-muted-foreground hover:text-foreground aria-pressed:bg-selected aria-pressed:text-foreground aria-pressed:hover:bg-selected';

/**
 * The comment editor of a task: formatted text, « @ » mentions, « / » blocks, attachments, sent
 * with Ctrl + Entrée (CommentComposer sheet of the Design System artifact; mockup App.dc.html,
 * comment box of the task panel).
 *
 * Built on `cw-block-editor`: `[(value)]` is the Markdown of the comment. It works with Signal
 * Forms (`FormValueControl<string>`) and Reactive or template-driven forms (value accessor).
 * `variant="full"` shows the toolbar (Gras, Italique, Lien, Liste à puces, Code │ Mention,
 * Joindre), the Ctrl Entrée help (hidden under 420 px) and Envoyer; `compact` is one 36 px line
 * (Joindre, Envoyer) that grows into the editor with a shorter bar when the text gets the focus and
 * stays grown while it has text or files. `mode="edit"` shows Annuler and Enregistrer, and Échap
 * cancels; in a compact empty composer, Échap gives the focus back and the line shrinks.
 *
 * Envoyer (or Enregistrer, or Ctrl + Entrée) emits `submit` only when the text is not empty, not
 * `sending`, and no file is still uploading. `attachments` (model) shows each file as a compact
 * `cw-attachment`; Joindre, a paste or a drop of files emits `filesAdded` (the host uploads and
 * updates `attachments`); Retirer or Annuler l'envoi removes the file and emits `attachmentRemove`.
 * `sending` puts Envoyer in its loading state. `error` sets `aria-invalid` on the text, shows the
 * message under the frame (`role="alert"`, linked by `aria-describedby`) with Réessayer
 * (`retry`); the text is kept. `disabled` shows `disabledText` with a lock instead of the editor.
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
  /** The comment, in Markdown; `[(value)]`. */
  readonly value = model('');
  /** Complete editor or one line. */
  readonly variant = input<CwCommentComposerVariant>('full');
  /** Envoyer, or Annuler and Enregistrer. */
  readonly mode = input<CwCommentComposerMode>('create');
  /** Shown while the text is empty. */
  readonly placeholder = input('Écrire un commentaire…');
  /** The writer, shown on the left. */
  readonly author = input<CwPerson | null>(null);
  /** People offered after « @ »; without it there is no Mention button. */
  readonly mentionSearch = input<CwMentionSearch | null>(null);
  /** Blocks offered after « / » at the start of a line. */
  readonly commands = input<readonly CwComposerCommand[]>(CW_COMPOSER_COMMANDS);
  /** Files joined to the comment and their upload; `[(attachments)]`. */
  readonly attachments = model<readonly CwAttachmentDraft[]>([]);
  /** Read-only: the editor is replaced by `disabledText` (Signal Forms binds it from the field). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Text shown when disabled. */
  readonly disabledText = input('Commentaires désactivés');
  /** The comment is being sent: Envoyer shows its spinner. */
  readonly sending = input(false, { transform: booleanAttribute });
  /** The send failure message; the text is kept. */
  readonly error = input<string | null>(null);
  /** French texts, overridable one by one. */
  readonly labels = input<Partial<CwCommentComposerLabels>>({});

  /** Envoyer, Enregistrer or Ctrl + Entrée, with a non-empty text and every file uploaded. */
  // The sheet names this output `submit`; it is bound on the component, not on a form.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly submit = output<CwCommentSubmit>();
  /** Annuler, or Échap in edit mode. */
  // The sheet names this output `cancel`; it is bound on the component, not on a dialog.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output();
  /** Files chosen with Joindre, pasted or dropped. */
  readonly filesAdded = output<File[]>();
  /** Id of a file removed, or whose upload was cancelled. */
  readonly attachmentRemove = output<string>();
  /** Id of a failed file whose upload should start again. */
  readonly attachmentRetry = output<string>();
  /** « Réessayer » under a send failure. */
  readonly retry = output();
  /** Emitted when the focus leaves the text: Signal Forms marks the field touched. */
  readonly touch = output();

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly frame = viewChild<ElementRef<HTMLElement>>('frame');
  private readonly editor = viewChild(CwBlockEditor);
  private readonly editorElement = viewChild(CwBlockEditor, { read: ElementRef });
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly formDisabled = signal(false);
  private readonly focusedWithin = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly errorId = `${inject(_IdGenerator).getId('cw-comment-composer-')}-error`;
  protected readonly text = computed(() => ({ ...CW_COMMENT_COMPOSER_LABELS, ...this.labels() }));
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly empty = computed(() => this.value().trim() === '');
  protected readonly uploading = computed(() =>
    this.attachments().some((file) => file.state === 'uploading' || file.state === 'processing'),
  );
  protected readonly canSubmit = computed(
    () => !this.isDisabled() && !this.sending() && !this.empty() && !this.uploading(),
  );
  /* CommentComposer sheet: the compact line grows on focus and stays grown with content. */
  protected readonly expanded = computed(
    () =>
      this.variant() === 'full' ||
      this.focusedWithin() ||
      !this.empty() ||
      this.attachments().length > 0 ||
      this.error() !== null,
  );
  protected readonly layout = computed(() =>
    this.isDisabled() ? LAYOUTS.disabled : this.expanded() ? LAYOUTS.expanded : LAYOUTS.collapsed,
  );
  protected readonly toolStyle = TOOL;

  constructor() {
    // Reactive and template-driven forms: this composer is the control's value accessor.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  /** Moves the focus to the text. */
  focus(options?: FocusOptions): void {
    this.editor()?.focus(options);
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

  protected onValueChange(value: string): void {
    this.onChange(value);
  }

  protected onEditorTouched(): void {
    this.onTouched();
    this.touch.emit();
  }

  protected markActive(mark: 'bold' | 'italic' | 'code'): boolean {
    return this.editor()?.activeMarks().has(mark) ?? false;
  }

  protected bulletActive(): boolean {
    return this.editor()?.activeBlock() === 'li';
  }

  protected linkActive(): boolean {
    return this.editor()?.linkActive() ?? false;
  }

  protected toggleMark(mark: 'bold' | 'italic' | 'code'): void {
    this.editor()?.toggleMark(mark);
  }

  protected toggleBulletList(): void {
    this.editor()?.setBlock('li');
  }

  protected openLink(): void {
    this.editor()?.openLink();
  }

  protected mention(): void {
    this.editor()?.startMention();
  }

  protected chooseFiles(): void {
    this.fileInput().nativeElement.click();
  }

  protected onFilesChosen(event: Event): void {
    const field = event.target as HTMLInputElement;
    const files = Array.from(field.files ?? []);
    field.value = '';
    if (files.length > 0) this.filesAdded.emit(files);
  }

  protected onPaste(event: ClipboardEvent): void {
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length === 0 || this.isDisabled()) return;
    event.preventDefault();
    this.filesAdded.emit(files);
  }

  protected onDragOver(event: DragEvent): void {
    if (this.isDisabled() || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length === 0 || this.isDisabled()) return;
    event.preventDefault();
    this.filesAdded.emit(files);
  }

  protected removeAttachment(id: string): void {
    this.attachments.update((files) => files.filter((file) => file.id !== id));
    this.attachmentRemove.emit(id);
  }

  protected onFocusIn(event: FocusEvent): void {
    // Only the text grows the compact line: Joindre and Envoyer of the line keep their click.
    const editor = this.editorElement()?.nativeElement as HTMLElement | undefined;
    if (this.expanded() || (event.target instanceof Node && editor?.contains(event.target)))
      this.focusedWithin.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    const frame = this.frame()?.nativeElement;
    if (next instanceof Node && frame?.contains(next)) return;
    this.focusedWithin.set(false);
  }

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

  /** Emits `submit` when the comment can be sent. */
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
}
