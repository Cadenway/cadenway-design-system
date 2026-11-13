import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorUploadSimpleBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { extensionOf, formatFileSize } from './dropzone.format';
import type {
  CwDropzoneLabels,
  CwDropzoneRejection,
  CwDropzoneSize,
  CwDropzoneState,
} from './dropzone.types';

const LABELS: CwDropzoneLabels = {
  or: 'ou',
  browseAria: 'les fichiers',
  drop: 'Relâchez pour joindre',
  reject: 'Type non accepté',
  limit: 'Limite atteinte',
  file: 'fichier',
  files: 'fichiers',
};

/* Literal class strings (Dropzone sheet and preview of the Design System artifact), so Tailwind finds
   them in the compiled package. The ring follows the keyboard focus of the browse button
   (`has-focus-visible:`): the whole zone shows it. */
const ROOT: Record<CwDropzoneSize, string> = {
  default:
    'relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input px-4 py-5 text-center transition-colors motion-reduce:transition-none hover:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background',
  compact:
    'relative flex h-12 items-center gap-2.5 rounded-lg border border-dashed border-input px-3 text-sm transition-colors motion-reduce:transition-none hover:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background',
};

const STATES: Record<CwDropzoneState, string> = {
  idle: '',
  over: 'bg-selected hover:bg-selected',
  reject: 'border-destructive/50 bg-grenat-soft text-grenat-text hover:bg-grenat-soft',
};

const DISABLED = 'pointer-events-none opacity-50';

const TILE: Record<CwDropzoneState, string> = {
  idle: 'flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground',
  over: 'flex size-9 items-center justify-center rounded-lg bg-background text-foreground',
  reject: 'flex size-9 items-center justify-center rounded-lg bg-background text-destructive',
};

const COMPACT_ICON: Record<CwDropzoneState, string> = {
  idle: 'shrink-0 text-muted-foreground',
  over: 'shrink-0 text-foreground',
  reject: 'shrink-0 text-destructive',
};

/* MIME types of the common extensions, so a refused type can be shown while it is still dragged:
   the browser gives the MIME type of a dragged file, never its name, before the drop. */
const EXTENSION_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  csv: 'text/csv',
  json: 'application/json',
  txt: 'text/plain',
  zip: 'application/zip',
  mp4: 'video/mp4',
};

/**
 * Takes files dropped, browsed or pasted, checks them locally and hands the accepted ones to the
 * consumer, which uploads them (Dropzone sheet of the Design System artifact; mockup `App.dc.html`,
 * attachments tab and the request form « Glissez des fichiers ici ou parcourez »).
 *
 * The « parcourez » button opens the system file picker through a hidden native `input type="file"`
 * (Tab reaches it, Enter or Space opens the picker); Ctrl + V pastes the files of the clipboard
 * while the zone holds the focus. Every file is checked against `accept` (extensions and MIME
 * types, `image/*` included), `maxSize` (bytes) and the room left by `maxFiles` minus `fileCount`
 * (`multiple=false` keeps one); `filesAdded` gets the accepted files, `filesRejected` the others
 * with their reason, in one call each per drop. While files are dragged over it the zone shows
 * `data-state="over"`, or `reject` when the browser already tells a refused MIME type, and says so
 * in a polite live region (`role="alert"` on a reject). `disabled`, or `fileCount` reaching
 * `maxFiles`, sets `aria-disabled`, dims the zone and ignores drops. No upload, no network call:
 * show the queue with `cw-dropzone-file`.
 */
@Component({
  selector: 'cw-dropzone',
  imports: [NgIcon, NgTemplateOutlet],
  providers: [provideIcons({ phosphorUploadSimpleBold, phosphorWarningCircleFill })],
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'state()',
    '[attr.data-size]': 'size()',
    '[attr.aria-disabled]': 'inert() ? "true" : null',
    '[attr.role]': 'state() === "reject" ? "alert" : null',
    '(dragenter)': 'enter($event)',
    '(dragover)': 'over($event)',
    '(dragleave)': 'leave()',
    '(drop)': 'drop($event)',
    '(paste)': 'paste($event)',
  },
  templateUrl: './dropzone.component.html',
})
export class CwDropzone {
  /** Accepted types, the native `accept` syntax (`'.png,.jpg,application/pdf'`); empty takes all. */
  readonly accept = input('');
  /** Largest accepted file, in bytes; 50 Mo by default. */
  readonly maxSize = input(52_428_800, { transform: numberAttribute });
  /** Most files the zone holds, counted with `fileCount`; `null` for no limit. */
  readonly maxFiles = input<number | null>(null);
  /** Files already attached, which use up `maxFiles`. */
  readonly fileCount = input(0, { transform: numberAttribute });
  /** Several files at a time; `false` keeps the first and refuses the others (`count`). */
  readonly multiple = input(true, { transform: booleanAttribute });
  /** A centered block or a 48 px line. */
  readonly size = input<CwDropzoneSize>('default');
  /** Disables the drop and the browse button. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Title of the zone. */
  readonly title = input('Déposez des fichiers');
  /** Text of the browse button. */
  readonly browseLabel = input('parcourez');
  /** Limits shown next to the button; derived from `maxSize` (« 50 Mo max. ») when empty. */
  readonly hint = input('');
  /** Replaces some of the other French texts. */
  readonly labels = input<Partial<CwDropzoneLabels>>({});

  /** The accepted files of one drop, selection or paste. */
  readonly filesAdded = output<File[]>();
  /** The refused files of one drop, selection or paste, with the reason of each. */
  readonly filesRejected = output<CwDropzoneRejection[]>();

  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');
  private readonly dragDepth = signal(0);
  private readonly dragCount = signal(0);
  private readonly dragRejected = signal(false);

  protected readonly text = computed(() => ({ ...LABELS, ...this.labels() }));
  protected readonly limitReached = computed(() => {
    const max = this.maxFiles();
    return max !== null && this.fileCount() >= max;
  });
  protected readonly inert = computed(() => this.disabled() || this.limitReached());
  readonly state = computed<CwDropzoneState>(() => {
    if (this.dragDepth() === 0 || this.inert()) return 'idle';
    return this.dragRejected() ? 'reject' : 'over';
  });
  protected readonly hintText = computed(
    () => this.hint() || `${formatFileSize(this.maxSize())} max.`,
  );
  // The accessible name starts with the visible text (WCAG 2.5.3, axe label-content-name-mismatch).
  protected readonly browseAria = computed(
    () => `${this.browseLabel()} ${this.text().browseAria} (${this.hintText()})`,
  );
  protected readonly countText = computed(() => this.files(this.dragCount()));
  protected readonly limitText = computed(
    () => `${this.text().limit} : ${this.files(this.maxFiles() ?? 0)}`,
  );
  protected readonly pickMultiple = computed(() => {
    const max = this.maxFiles();
    return this.multiple() && (max === null || max - this.fileCount() > 1);
  });
  protected readonly classes = computed(
    () => `${ROOT[this.size()]} ${STATES[this.state()]}${this.inert() ? ` ${DISABLED}` : ''}`,
  );
  protected readonly tileClasses = computed(() => TILE[this.state()]);
  protected readonly compactIconClasses = computed(() => COMPACT_ICON[this.state()]);

  /** Opens the system file picker, as the browse button does. */
  browse(): void {
    if (!this.inert()) this.picker().nativeElement.click();
  }

  protected picked(): void {
    const input = this.picker().nativeElement;
    this.take(Array.from(input.files ?? []));
    // Cleared so that picking the same file again still fires a change.
    input.value = '';
  }

  protected enter(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    event.preventDefault();
    this.dragDepth.update((depth) => depth + 1);
    const items = Array.from(event.dataTransfer?.items ?? []).filter(
      (item) => item.kind === 'file',
    );
    this.dragCount.set(items.length);
    this.dragRejected.set(items.some((item) => this.knownRefused(item.type)));
  }

  protected over(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    // Without preventDefault the browser opens the dropped file in place of the application.
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.inert() || this.dragRejected() ? 'none' : 'copy';
    }
  }

  protected leave(): void {
    // dragenter and dragleave fire for every child crossed: the depth tells when the pointer left.
    this.dragDepth.update((depth) => Math.max(0, depth - 1));
  }

  protected drop(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    event.preventDefault();
    this.dragDepth.set(0);
    if (this.inert()) return;
    this.take(Array.from(event.dataTransfer?.files ?? []));
  }

  protected paste(event: ClipboardEvent): void {
    const files = Array.from(event.clipboardData?.files ?? []);
    if (this.inert() || files.length === 0) return;
    event.preventDefault();
    this.take(files);
  }

  private take(files: File[]): void {
    if (files.length === 0) return;
    const max = this.maxFiles();
    let room = max === null ? Number.POSITIVE_INFINITY : Math.max(0, max - this.fileCount());
    if (!this.multiple()) room = Math.min(room, 1);
    const accepted: File[] = [];
    const rejected: CwDropzoneRejection[] = [];
    for (const file of files) {
      if (!this.accepts(file)) rejected.push({ file, reason: 'type' });
      else if (file.size > this.maxSize()) rejected.push({ file, reason: 'size' });
      else if (accepted.length >= room) rejected.push({ file, reason: 'count' });
      else accepted.push(file);
    }
    if (accepted.length > 0) this.filesAdded.emit(accepted);
    if (rejected.length > 0) this.filesRejected.emit(rejected);
  }

  private tokens(): string[] {
    return this.accept()
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token !== '');
  }

  private accepts(file: File): boolean {
    const tokens = this.tokens();
    if (tokens.length === 0) return true;
    const extension = extensionOf(file.name);
    return tokens.some((token) =>
      token.startsWith('.') ? token.slice(1) === extension : this.typeMatches(token, file.type),
    );
  }

  /** Whether a dragged MIME type is refused for sure; unknown cases wait for the drop. */
  private knownRefused(type: string): boolean {
    const tokens = this.tokens();
    if (tokens.length === 0 || type === '') return false;
    const types: string[] = [];
    for (const token of tokens) {
      if (!token.startsWith('.')) types.push(token);
      else if (EXTENSION_TYPES[token.slice(1)]) types.push(EXTENSION_TYPES[token.slice(1)]);
      // An extension without a known MIME type could be any type: no verdict before the drop.
      else return false;
    }
    return !types.some((token) => this.typeMatches(token, type));
  }

  private typeMatches(token: string, type: string): boolean {
    const lower = type.toLowerCase();
    return token.endsWith('/*') ? lower.startsWith(token.slice(0, -1)) : token === lower;
  }

  private carriesFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }

  private files(count: number): string {
    return `${String(count)} ${count === 1 ? this.text().file : this.text().files}`;
  }
}
