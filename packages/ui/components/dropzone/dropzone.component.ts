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
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorUploadSimpleBold } from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { ɵextensionOf, ɵformatFileSize } from '@cadenway/ui/core';

import type {
  CwDropzoneLabels,
  CwDropzoneRejection,
  CwDropzoneSize,
  CwDropzoneState,
} from './dropzone.types';

/**
 * Constant LABELS
 *
 * @description
 * Default French labels for dropzone states and limits.
 *
 * @type {CwDropzoneLabels}
 */
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
/**
 * Constant ROOT
 *
 * @description
 * Root layout classes for each dropzone size.
 *
 * @type {Record<CwDropzoneSize, string>}
 */
const ROOT: Record<CwDropzoneSize, string> = {
  default:
    'relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input px-4 py-5 text-center transition-colors motion-reduce:transition-none hover:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background',
  compact:
    'relative flex h-12 items-center gap-2.5 rounded-lg border border-dashed border-input px-3 text-sm transition-colors motion-reduce:transition-none hover:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background',
};

/**
 * Constant STATES
 *
 * @description
 * Classes for idle, accepted and rejected drag states.
 *
 * @type {Record<CwDropzoneState, string>}
 */
const STATES: Record<CwDropzoneState, string> = {
  idle: '',
  over: 'bg-selected hover:bg-selected',
  reject: 'border-destructive/50 bg-grenat-soft text-grenat-text hover:bg-grenat-soft',
};

/**
 * Constant DISABLED
 *
 * @description
 * Classes indicating an unavailable dropzone.
 *
 * @type {string}
 */
const DISABLED: string = 'pointer-events-none opacity-50';

/**
 * Constant TILE
 *
 * @description
 * Upload icon tile classes for each drag state.
 *
 * @type {Record<CwDropzoneState, string>}
 */
const TILE: Record<CwDropzoneState, string> = {
  idle: 'flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground',
  over: 'flex size-9 items-center justify-center rounded-lg bg-background text-foreground',
  reject: 'flex size-9 items-center justify-center rounded-lg bg-background text-destructive',
};

/**
 * Constant COMPACT_ICON
 *
 * @description
 * Compact upload icon classes for each drag state.
 *
 * @type {Record<CwDropzoneState, string>}
 */
const COMPACT_ICON: Record<CwDropzoneState, string> = {
  idle: 'shrink-0 text-muted-foreground',
  over: 'shrink-0 text-foreground',
  reject: 'shrink-0 text-destructive',
};

/* MIME types of the common extensions, so a refused type can be shown while it is still dragged:
   the browser gives the MIME type of a dragged file, never its name, before the drop. */
/**
 * Constant EXTENSION_TYPES
 *
 * @description
 * Known MIME types used to preview extension acceptance during drag.
 *
 * @type {Record<string, string>}
 */
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
 * Class CwDropzone
 * @class CwDropzone
 *
 * @description
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
  // #region Properties
  /**
   * Property accept
   * @readonly
   *
   * @description
   * Accepted types, the native `accept` syntax (`'.png,.jpg,application/pdf'`); empty takes all.
   *
   * @type {InputSignal<string>}
   */
  public readonly accept: InputSignal<string> = input('');

  /**
   * Property maxSize
   * @readonly
   *
   * @description
   * Largest accepted file, in bytes; 50 Mo by default.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly maxSize: InputSignalWithTransform<number, unknown> = input(52_428_800, {
    transform: numberAttribute,
  });

  /**
   * Property maxFiles
   * @readonly
   *
   * @description
   * Most files the zone holds, counted with `fileCount`; `null` for no limit.
   *
   * @type {InputSignal<number | null>}
   */
  public readonly maxFiles: InputSignal<number | null> = input<number | null>(null);

  /**
   * Property fileCount
   * @readonly
   *
   * @description
   * Files already attached, which use up `maxFiles`.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly fileCount: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property multiple
   * @readonly
   *
   * @description
   * Several files at a time; `false` keeps the first and refuses the others (`count`).
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly multiple: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property size
   * @readonly
   *
   * @description
   * A centered block or a 48 px line.
   *
   * @type {InputSignal<CwDropzoneSize>}
   */
  public readonly size: InputSignal<CwDropzoneSize> = input<CwDropzoneSize>('default');

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Disables the drop and the browse button.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property title
   * @readonly
   *
   * @description
   * Title of the zone.
   *
   * @type {InputSignal<string>}
   */
  public readonly title: InputSignal<string> = input('Déposez des fichiers');

  /**
   * Property browseLabel
   * @readonly
   *
   * @description
   * Text of the browse button.
   *
   * @type {InputSignal<string>}
   */
  public readonly browseLabel: InputSignal<string> = input('parcourez');

  /**
   * Property hint
   * @readonly
   *
   * @description
   * Limits shown next to the button; derived from `maxSize` (« 50 Mo max. ») when empty.
   *
   * @type {InputSignal<string>}
   */
  public readonly hint: InputSignal<string> = input('');

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Replaces some of the other French texts.
   *
   * @type {InputSignal<Partial<CwDropzoneLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwDropzoneLabels>> = input<Partial<CwDropzoneLabels>>(
    {},
  );

  /**
   * Property filesAdded
   * @readonly
   *
   * @description
   * The accepted files of one drop, selection or paste.
   *
   * @type {OutputEmitterRef<File[]>}
   */
  public readonly filesAdded: OutputEmitterRef<File[]> = output<File[]>();

  /**
   * Property filesRejected
   * @readonly
   *
   * @description
   * The refused files of one drop, selection or paste, with the reason of each.
   *
   * @type {OutputEmitterRef<CwDropzoneRejection[]>}
   */
  public readonly filesRejected: OutputEmitterRef<CwDropzoneRejection[]> =
    output<CwDropzoneRejection[]>();

  /**
   * Property picker
   * @readonly
   *
   * @description
   * Native file input used by the browse action.
   *
   * @type {Signal<ElementRef<HTMLInputElement>>}
   */
  private readonly picker: Signal<ElementRef<HTMLInputElement>> =
    viewChild.required<ElementRef<HTMLInputElement>>('picker');

  /**
   * Property dragDepth
   * @readonly
   *
   * @description
   * Nested drag entry depth over the zone.
   *
   * @type {WritableSignal<number>}
   */
  private readonly dragDepth: WritableSignal<number> = signal(0);

  /**
   * Property dragCount
   * @readonly
   *
   * @description
   * Number of files in the active drag.
   *
   * @type {WritableSignal<number>}
   */
  private readonly dragCount: WritableSignal<number> = signal(0);

  /**
   * Property dragRejected
   * @readonly
   *
   * @description
   * Whether a known dragged type is rejected.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly dragRejected: WritableSignal<boolean> = signal(false);

  /**
   * Property text
   * @readonly
   *
   * @description
   * Default labels merged with consumer overrides.
   *
   * @type {Signal<CwDropzoneLabels>}
   */
  protected readonly text: Signal<CwDropzoneLabels> = computed(() => ({
    ...LABELS,
    ...this.labels(),
  }));

  /**
   * Property limitReached
   * @readonly
   *
   * @description
   * Whether the configured file limit is reached.
   *
   * @type {Signal<boolean>}
   */
  protected readonly limitReached: Signal<boolean> = computed(() => {
    const max: number | null = this.maxFiles();
    return max !== null && this.fileCount() >= max;
  });

  /**
   * Property inert
   * @readonly
   *
   * @description
   * Whether browsing and drops are unavailable.
   *
   * @type {Signal<boolean>}
   */
  protected readonly inert: Signal<boolean> = computed(
    () => this.disabled() || this.limitReached(),
  );

  /**
   * Property state
   * @readonly
   *
   * @description
   * Current visual drag state.
   *
   * @type {Signal<CwDropzoneState>}
   */
  public readonly state: Signal<CwDropzoneState> = computed<CwDropzoneState>(() => {
    if (this.dragDepth() === 0 || this.inert()) return 'idle';
    return this.dragRejected() ? 'reject' : 'over';
  });

  /**
   * Property hintText
   * @readonly
   *
   * @description
   * Displayed size hint or its supplied override.
   *
   * @type {Signal<string>}
   */
  protected readonly hintText: Signal<string> = computed(
    () => this.hint() || `${ɵformatFileSize(this.maxSize())} max.`,
  );

  /**
   * Property browseAria
   * @readonly
   *
   * @description
   * Accessible browse name including the visible label and limits.
   *
   * @type {Signal<string>}
   */
  protected readonly browseAria: Signal<string> = computed(
    () => `${this.browseLabel()} ${this.text().browseAria} (${this.hintText()})`,
  );

  /**
   * Property countText
   * @readonly
   *
   * @description
   * Formatted number of dragged files.
   *
   * @type {Signal<string>}
   */
  protected readonly countText: Signal<string> = computed(() => this.files(this.dragCount()));

  /**
   * Property limitText
   * @readonly
   *
   * @description
   * Message shown when the file limit is reached.
   *
   * @type {Signal<string>}
   */
  protected readonly limitText: Signal<string> = computed(
    () => `${this.text().limit} : ${this.files(this.maxFiles() ?? 0)}`,
  );

  /**
   * Property pickMultiple
   * @readonly
   *
   * @description
   * Whether the picker can accept multiple additional files.
   *
   * @type {Signal<boolean>}
   */
  protected readonly pickMultiple: Signal<boolean> = computed(() => {
    const max: number | null = this.maxFiles();
    return this.multiple() && (max === null || max - this.fileCount() > 1);
  });

  /**
   * Property classes
   * @readonly
   *
   * @description
   * Root classes for size, drag state and availability.
   *
   * @type {Signal<string>}
   */
  protected readonly classes: Signal<string> = computed(
    () => `${ROOT[this.size()]} ${STATES[this.state()]}${this.inert() ? ` ${DISABLED}` : ''}`,
  );

  /**
   * Property tileClasses
   * @readonly
   *
   * @description
   * Icon tile classes for the current state.
   *
   * @type {Signal<string>}
   */
  protected readonly tileClasses: Signal<string> = computed(() => TILE[this.state()]);

  /**
   * Property compactIconClasses
   * @readonly
   *
   * @description
   * Compact icon classes for the current state.
   *
   * @type {Signal<string>}
   */
  protected readonly compactIconClasses: Signal<string> = computed(
    () => COMPACT_ICON[this.state()],
  );
  // #endregion

  // #region Methods
  /**
   * Method browse
   * @method browse
   *
   * @description
   * Opens the system file picker when the zone is available.
   */
  public browse(): void {
    if (!this.inert()) this.picker().nativeElement.click();
  }

  /**
   * Method picked
   * @method picked
   *
   * @description
   * Processes files selected in the picker and clears its value.
   */
  protected picked(): void {
    const input: HTMLInputElement = this.picker().nativeElement;
    this.take(Array.from(input.files ?? []));
    // Cleared so that picking the same file again still fires a change.
    input.value = '';
  }

  /**
   * Method enter
   * @method enter
   *
   * @description
   * Updates the drag state when files enter the zone.
   *
   * @param {DragEvent} event - Drag event entering the dropzone.
   */
  protected enter(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    event.preventDefault();
    this.dragDepth.update((depth) => depth + 1);
    const items: DataTransferItem[] = Array.from(event.dataTransfer?.items ?? []).filter(
      (item) => item.kind === 'file',
    );
    this.dragCount.set(items.length);
    this.dragRejected.set(items.some((item) => this.knownRefused(item.type)));
  }

  /**
   * Method over
   * @method over
   *
   * @description
   * Allows or rejects a file drop based on the current state.
   *
   * @param {DragEvent} event - Drag event over the dropzone.
   */
  protected over(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    // Without preventDefault the browser opens the dropped file in place of the application.
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.inert() || this.dragRejected() ? 'none' : 'copy';
    }
  }

  /**
   * Method leave
   * @method leave
   *
   * @description
   * Updates drag depth as the pointer leaves the zone.
   */
  protected leave(): void {
    // dragenter and dragleave fire for every child crossed: the depth tells when the pointer left.
    this.dragDepth.update((depth) => Math.max(0, depth - 1));
  }

  /**
   * Method drop
   * @method drop
   *
   * @description
   * Processes files dropped on the zone.
   *
   * @param {DragEvent} event - Drop event carrying files.
   */
  protected drop(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    event.preventDefault();
    this.dragDepth.set(0);
    if (this.inert()) return;
    this.take(Array.from(event.dataTransfer?.files ?? []));
  }

  /**
   * Method paste
   * @method paste
   *
   * @description
   * Processes files pasted into the zone.
   *
   * @param {ClipboardEvent} event - Clipboard event carrying files.
   */
  protected paste(event: ClipboardEvent): void {
    const files: File[] = Array.from(event.clipboardData?.files ?? []);
    if (this.inert() || files.length === 0) return;
    event.preventDefault();
    this.take(files);
  }

  /**
   * Method take
   * @method take
   *
   * @description
   * Partitions files by acceptance, size and remaining capacity.
   *
   * @param {File[]} files - Files to validate against the configured limits.
   */
  private take(files: File[]): void {
    if (files.length === 0) return;
    const max: number | null = this.maxFiles();
    let room: number =
      max === null ? Number.POSITIVE_INFINITY : Math.max(0, max - this.fileCount());
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

  /**
   * Method tokens
   * @method tokens
   *
   * @description
   * Parses the accepted extension and MIME tokens.
   *
   * @returns {string[]} Configured extension and MIME tokens.
   */
  private tokens(): string[] {
    return this.accept()
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token !== '');
  }

  /**
   * Method accepts
   * @method accepts
   *
   * @description
   * Checks a file against the configured acceptance tokens.
   *
   * @param {File} file - File to check against configured acceptance tokens.
   *
   * @returns {boolean} Whether the file is accepted.
   */
  private accepts(file: File): boolean {
    const tokens: string[] = this.tokens();
    if (tokens.length === 0) return true;
    const extension: string = ɵextensionOf(file.name);
    return tokens.some((token) =>
      token.startsWith('.') ? token.slice(1) === extension : this.typeMatches(token, file.type),
    );
  }

  /**
   * Method knownRefused
   * @method knownRefused
   *
   * @description
   * Checks whether a dragged MIME type is certainly refused.
   *
   * @param {string} type - Dragged MIME type to inspect.
   *
   * @returns {boolean} Whether the MIME type is certainly refused.
   */
  private knownRefused(type: string): boolean {
    const tokens: string[] = this.tokens();
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

  /**
   * Method typeMatches
   * @method typeMatches
   *
   * @description
   * Matches an exact or wildcard MIME token against a file type.
   *
   * @param {string} token - Configured exact or wildcard MIME token.
   * @param {string} type - File MIME type to compare.
   *
   * @returns {boolean} Whether the MIME type matches the token.
   */
  private typeMatches(token: string, type: string): boolean {
    const lower: string = type.toLowerCase();
    return token.endsWith('/*') ? lower.startsWith(token.slice(0, -1)) : token === lower;
  }

  /**
   * Method carriesFiles
   * @method carriesFiles
   *
   * @description
   * Checks whether a drag event carries files.
   *
   * @param {DragEvent} event - Drag event to inspect.
   *
   * @returns {boolean} Whether the transfer carries files.
   */
  private carriesFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }

  /**
   * Method files
   * @method files
   *
   * @description
   * Formats a French file count.
   *
   * @param {number} count - Number of files.
   *
   * @returns {string} French text for the file count.
   */
  private files(count: number): string {
    return `${String(count)} ${count === 1 ? this.text().file : this.text().files}`;
  }
  // #endregion
}
