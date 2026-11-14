import {
  Component,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  type InputSignal,
  type InputSignalWithTransform,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CwButton } from '@cadenway/ui/components/button';
import { CwRipple, ɵextensionOf, ɵformatFileSize } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/components/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowClockwiseBold,
  phosphorArrowSquareOutBold,
  phosphorDownloadSimpleBold,
  phosphorFileBold,
  phosphorFileCsvBold,
  phosphorFileImageBold,
  phosphorFilePdfBold,
  phosphorFileZipBold,
  phosphorLinkSimpleBold,
  phosphorXBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorWarningCircleFill } from '@ng-icons/phosphor-icons/fill';

import { detectType, domainOf, typeIcon } from './attachment.format';
import type {
  CwAttachmentLabels,
  CwAttachmentOrientation,
  CwAttachmentSize,
  CwAttachmentState,
  CwAttachmentType,
} from './attachment.types';

/**
 * Constant LABELS
 *
 * @description
 * Default French labels for attachment actions and states.
 *
 * @type {CwAttachmentLabels}
 */
const LABELS: CwAttachmentLabels = {
  image: 'Image',
  file: 'Fichier',
  download: 'Télécharger',
  open: 'Ouvrir',
  retry: "Réessayer l'envoi de",
  cancel: "Annuler l'envoi de",
  progress: 'Envoi de',
  processing: "Génération de l'aperçu…",
  processingShort: 'Aperçu…',
  uploading: 'Envoi…',
  failed: 'Échec',
  sending: 'Envoi en cours',
  working: 'Traitement en cours',
  done: 'joint',
};

/**
 * Type Layout
 *
 * @description
 * Available attachment presentation layouts.
 *
 * @type {'card' | 'chip' | 'tile'}
 */
type Layout = 'card' | 'chip' | 'tile';

/* Literal class strings (Attachment sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. The name is a stretched link (`after:inset-0`): the whole card
   is clickable without nesting buttons, and the ring follows its keyboard focus. */
/**
 * Constant ROOT
 *
 * @description
 * Root classes for each attachment layout.
 *
 * @type {Record<Layout, string>}
 */
const ROOT: Record<Layout, string> = {
  card: 'group/attachment relative flex min-w-0 items-center gap-2.5 rounded-xl border bg-card p-2 pr-1.5 text-sm text-card-foreground transition-colors motion-reduce:transition-none hover:bg-accent has-[[data-name]:focus-visible]:ring-2 has-[[data-name]:focus-visible]:ring-ring has-[[data-name]:focus-visible]:ring-offset-2 has-[[data-name]:focus-visible]:ring-offset-background data-[state=error]:border-destructive/40',
  chip: 'group/attachment relative inline-flex h-7 max-w-60 min-w-0 items-center gap-1.5 rounded-md border bg-card pr-0.5 pl-2 text-xs text-card-foreground transition-colors motion-reduce:transition-none hover:bg-accent has-[[data-name]:focus-visible]:ring-2 has-[[data-name]:focus-visible]:ring-ring has-[[data-name]:focus-visible]:ring-offset-2 has-[[data-name]:focus-visible]:ring-offset-background data-[state=error]:border-destructive/40',
  tile: 'group/attachment relative flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-sm text-card-foreground transition-colors motion-reduce:transition-none hover:bg-accent has-[[data-name]:focus-visible]:ring-2 has-[[data-name]:focus-visible]:ring-ring has-[[data-name]:focus-visible]:ring-offset-2 has-[[data-name]:focus-visible]:ring-offset-background data-[state=error]:border-destructive/40',
};

/**
 * Constant NAME
 *
 * @description
 * Name and stretched-link classes for each attachment layout.
 *
 * @type {Record<Layout, string>}
 */
const NAME: Record<Layout, string> = {
  card: "block min-w-0 truncate text-left text-sm leading-5 font-medium outline-none after:absolute after:inset-0 after:content-['']",
  chip: "block min-w-0 truncate text-left font-medium outline-none after:absolute after:inset-0 after:content-['']",
  tile: "block min-w-0 truncate text-left text-sm leading-5 font-medium outline-none after:absolute after:inset-0 after:content-['']",
};

/**
 * Component CwAttachment
 *
 * @description
 * One attached file or link: type icon or thumbnail, name, size and type, upload progress, error and
 * actions (Attachment sheet of the Design System artifact; mockup `App.dc.html`, attachments tab).
 *
 * `type` defaults to what `mimeType`, then the extension of `name`, tell (a name without extension
 * pointing to a web address is a `link`); it picks the neutral media icon and the main action,
 * Télécharger (`href`, `download`) or Ouvrir for a link (new tab). The name is the card's only link
 * (a button without `href`), stretched over the whole card: it emits `open` with the click, call
 * `preventDefault()` on it to show a preview instead of following `href`. `state` drives the second
 * line: size and type (« 2,4 Mo · PDF »; the domain for a link), a named `role="progressbar"` with
 * the percentage while `uploading`, « Génération de l'aperçu… » while `processing`, the `error`
 * message in text on `error`. Actions are icon buttons named with the file name: Retirer
 * (`removable`, the `remove` output only detaches), Réessayer on `error`, Annuler l'envoi while
 * uploading; at rest they appear on hover or focus. `size="sm"` is a 28 px chip whose Delete and
 * Backspace keys remove it; `orientation="vertical"` a 144 px thumbnail. The end of an upload and an
 * error are announced. No network call.
 */
@Component({
  selector: 'cw-attachment',
  imports: [CwButton, CwRipple, CwSpinner, NgIcon, NgTemplateOutlet],
  providers: [
    provideIcons({
      phosphorArrowClockwiseBold,
      phosphorArrowSquareOutBold,
      phosphorDownloadSimpleBold,
      phosphorFileBold,
      phosphorFileCsvBold,
      phosphorFileImageBold,
      phosphorFilePdfBold,
      phosphorFileZipBold,
      phosphorLinkSimpleBold,
      phosphorWarningCircleFill,
      phosphorXBold,
    }),
  ],
  host: {
    '[class]': 'rootClasses()',
    '[attr.data-state]': 'state()',
    '[attr.data-type]': 'kind()',
    '[attr.data-size]': 'size()',
    '[attr.data-orientation]': 'orientation()',
  },
  templateUrl: './attachment.component.html',
})
export class CwAttachment {
  // #region Properties
  /**
   * Property name
   * @readonly
   *
   * @description
   * File name or link title.
   *
   * @type {InputSignal<string>}
   */
  public readonly name: InputSignal<string> = input.required<string>();

  /**
   * Property type
   * @readonly
   *
   * @description
   * Explicit media type, or null to detect it from the file.
   *
   * @type {InputSignal<CwAttachmentType | null>}
   */
  public readonly type: InputSignal<CwAttachmentType | null> = input<CwAttachmentType | null>(null);

  /**
   * Property mimeType
   * @readonly
   *
   * @description
   * MIME type used to detect the media type.
   *
   * @type {InputSignal<string>}
   */
  public readonly mimeType: InputSignal<string> = input('');

  /**
   * Property fileSize
   * @readonly
   *
   * @description
   * File size in bytes, or null when unknown.
   *
   * @type {InputSignal<number | null>}
   */
  public readonly fileSize: InputSignal<number | null> = input<number | null>(null);

  /**
   * Property href
   * @readonly
   *
   * @description
   * Address of the file or link.
   *
   * @type {InputSignal<string>}
   */
  public readonly href: InputSignal<string> = input('');

  /**
   * Property thumbnail
   * @readonly
   *
   * @description
   * Address of the image or PDF thumbnail.
   *
   * @type {InputSignal<string>}
   */
  public readonly thumbnail: InputSignal<string> = input('');

  /**
   * Property state
   * @readonly
   *
   * @description
   * Current upload state.
   *
   * @type {InputSignal<CwAttachmentState>}
   */
  public readonly state: InputSignal<CwAttachmentState> = input<CwAttachmentState>('done');

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Upload progress from zero to one hundred.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly progress: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property error
   * @readonly
   *
   * @description
   * Message displayed when the upload fails.
   *
   * @type {InputSignal<string>}
   */
  public readonly error: InputSignal<string> = input('');

  /**
   * Property size
   * @readonly
   *
   * @description
   * Card or compact chip size.
   *
   * @type {InputSignal<CwAttachmentSize>}
   */
  public readonly size: InputSignal<CwAttachmentSize> = input<CwAttachmentSize>('default');

  /**
   * Property orientation
   * @readonly
   *
   * @description
   * Horizontal card or vertical thumbnail layout.
   *
   * @type {InputSignal<CwAttachmentOrientation>}
   */
  public readonly orientation: InputSignal<CwAttachmentOrientation> =
    input<CwAttachmentOrientation>('horizontal');

  /**
   * Property removable
   * @readonly
   *
   * @description
   * Whether the remove action is available.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly removable: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });

  /**
   * Property removeLabel
   * @readonly
   *
   * @description
   * Prefix for the remove button accessible name.
   *
   * @type {InputSignal<string>}
   */
  public readonly removeLabel: InputSignal<string> = input('Retirer');

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Overrides for the default French labels.
   *
   * @type {InputSignal<Partial<CwAttachmentLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwAttachmentLabels>> = input<
    Partial<CwAttachmentLabels>
  >({});

  /**
   * Property open
   * @readonly
   *
   * @description
   * Emits the click used to open the attachment.
   *
   * @type {OutputEmitterRef<MouseEvent>}
   */
  public readonly open: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

  /**
   * Property remove
   * @readonly
   *
   * @description
   * Emits when the attachment is detached.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly remove: OutputEmitterRef<void> = output();

  /**
   * Property retry
   * @readonly
   *
   * @description
   * Emits when a failed upload is retried.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly retry: OutputEmitterRef<void> = output();

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Emits when an upload is cancelled.
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly cancel: OutputEmitterRef<void> = output();

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announces upload completion and errors.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property text
   * @readonly
   *
   * @description
   * Combines default labels with caller overrides.
   *
   * @type {Signal<CwAttachmentLabels>}
   */
  protected readonly text: Signal<CwAttachmentLabels> = computed(() => ({
    ...LABELS,
    ...this.labels(),
  }));

  /**
   * Property layout
   * @readonly
   *
   * @description
   * Layout derived from the orientation and size.
   *
   * @type {Signal<Layout>}
   */
  protected readonly layout: Signal<Layout> = computed<Layout>(() =>
    this.orientation() === 'vertical' ? 'tile' : this.size() === 'sm' ? 'chip' : 'card',
  );

  /**
   * Property rootClasses
   * @readonly
   *
   * @description
   * Classes applied to the attachment container.
   *
   * @type {Signal<string>}
   */
  protected readonly rootClasses: Signal<string> = computed(() => ROOT[this.layout()]);

  /**
   * Property nameClasses
   * @readonly
   *
   * @description
   * Classes applied to the attachment name.
   *
   * @type {Signal<string>}
   */
  protected readonly nameClasses: Signal<string> = computed(() => NAME[this.layout()]);

  /**
   * Property kind
   * @readonly
   *
   * @description
   * Explicit or detected attachment type.
   *
   * @type {Signal<CwAttachmentType>}
   */
  public readonly kind: Signal<CwAttachmentType> = computed(
    () => this.type() ?? detectType(this.name(), this.mimeType(), this.href()),
  );

  /**
   * Property icon
   * @readonly
   *
   * @description
   * Icon selected for the attachment type.
   *
   * @type {Signal<string>}
   */
  protected readonly icon: Signal<string> = computed(() => typeIcon(this.kind(), this.name()));

  /**
   * Property percent
   * @readonly
   *
   * @description
   * Upload progress clamped to a whole percentage.
   *
   * @type {Signal<number>}
   */
  protected readonly percent: Signal<number> = computed(() =>
    Math.round(Math.min(100, Math.max(0, this.progress()))),
  );

  /**
   * Property sizeText
   * @readonly
   *
   * @description
   * Formatted file size, or an empty string.
   *
   * @type {Signal<string>}
   */
  protected readonly sizeText: Signal<string> = computed(() => {
    const bytes: number | null = this.fileSize();
    return bytes === null ? '' : ɵformatFileSize(bytes);
  });

  /**
   * Property meta
   * @readonly
   *
   * @description
   * File size and type, or the domain of a link.
   *
   * @type {Signal<string>}
   */
  protected readonly meta: Signal<string> = computed(() => {
    if (this.kind() === 'link') return this.href() ? domainOf(this.href()) : '';
    const word: string =
      this.kind() === 'image'
        ? this.text().image
        : this.kind() === 'pdf'
          ? 'PDF'
          : ɵextensionOf(this.name()).toUpperCase() || this.text().file;
    return [this.sizeText(), word].filter((part) => part !== '').join(' · ');
  });

  /**
   * Property chipMeta
   * @readonly
   *
   * @description
   * Metadata displayed in the compact chip.
   *
   * @type {Signal<string>}
   */
  protected readonly chipMeta: Signal<string> = computed(() =>
    this.kind() === 'link' ? this.meta() : this.sizeText(),
  );

  /**
   * Property isLink
   * @readonly
   *
   * @description
   * Whether the attachment represents a link.
   *
   * @type {Signal<boolean>}
   */
  protected readonly isLink: Signal<boolean> = computed(() => this.kind() === 'link');
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Announces upload completion and errors when the state changes.
   */
  public constructor() {
    let previous: CwAttachmentState | null = null;
    effect(() => {
      const state: CwAttachmentState = this.state();
      // Announce transitions only (sheet: end of upload and error through LiveAnnouncer).
      if (previous !== null && previous !== state) {
        if (state === 'done') void this.announcer.announce(`${this.name()} ${this.text().done}`);
        if (state === 'error' && this.error()) void this.announcer.announce(this.error());
      }
      previous = state;
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method opened
   *
   * @description
   * Emits the click used to open the attachment.
   *
   * @param {MouseEvent} event - Original click; consumers can prevent its default navigation.
   */
  protected opened(event: MouseEvent): void {
    this.open.emit(event);
  }

  /**
   * Method key
   *
   * @description
   * Removes a compact attachment on Delete or Backspace.
   *
   * @param {KeyboardEvent} event - Key event received by the attachment name.
   */
  protected key(event: KeyboardEvent): void {
    // Attachment sheet, "Clavier": Delete or Backspace removes a compact chip of the composer.
    if (
      this.layout() === 'chip' &&
      this.removable() &&
      (event.key === 'Delete' || event.key === 'Backspace')
    ) {
      event.preventDefault();
      this.remove.emit();
    }
  }
  // #endregion
}
