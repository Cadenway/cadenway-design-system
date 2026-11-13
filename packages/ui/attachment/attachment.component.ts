import {
  Component,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CwButton } from '@cadenway/ui/button';
import { CwRipple, ɵextensionOf, ɵformatFileSize } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/spinner';
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

type Layout = 'card' | 'chip' | 'tile';

/* Literal class strings (Attachment sheet and preview of the Design System artifact), so Tailwind
   finds them in the compiled package. The name is a stretched link (`after:inset-0`): the whole card
   is clickable without nesting buttons, and the ring follows its keyboard focus. */
const ROOT: Record<Layout, string> = {
  card: 'group/attachment relative flex min-w-0 items-center gap-2.5 rounded-xl border bg-card p-2 pr-1.5 text-sm text-card-foreground transition-colors motion-reduce:transition-none hover:bg-accent has-[[data-name]:focus-visible]:ring-2 has-[[data-name]:focus-visible]:ring-ring has-[[data-name]:focus-visible]:ring-offset-2 has-[[data-name]:focus-visible]:ring-offset-background data-[state=error]:border-destructive/40',
  chip: 'group/attachment relative inline-flex h-7 max-w-60 min-w-0 items-center gap-1.5 rounded-md border bg-card pr-0.5 pl-2 text-xs text-card-foreground transition-colors motion-reduce:transition-none hover:bg-accent has-[[data-name]:focus-visible]:ring-2 has-[[data-name]:focus-visible]:ring-ring has-[[data-name]:focus-visible]:ring-offset-2 has-[[data-name]:focus-visible]:ring-offset-background data-[state=error]:border-destructive/40',
  tile: 'group/attachment relative flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-sm text-card-foreground transition-colors motion-reduce:transition-none hover:bg-accent has-[[data-name]:focus-visible]:ring-2 has-[[data-name]:focus-visible]:ring-ring has-[[data-name]:focus-visible]:ring-offset-2 has-[[data-name]:focus-visible]:ring-offset-background data-[state=error]:border-destructive/40',
};

const NAME: Record<Layout, string> = {
  card: "block min-w-0 truncate text-left text-sm leading-5 font-medium outline-none after:absolute after:inset-0 after:content-['']",
  chip: "block min-w-0 truncate text-left font-medium outline-none after:absolute after:inset-0 after:content-['']",
  tile: "block min-w-0 truncate text-left text-sm leading-5 font-medium outline-none after:absolute after:inset-0 after:content-['']",
};

/**
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
  /** File name or link title. */
  readonly name = input.required<string>();
  /** Media and main action; detected from `mimeType`, the name and `href` when `null`. */
  readonly type = input<CwAttachmentType | null>(null);
  /** MIME type of the file, when known (`File.type`), used to detect `type`. */
  readonly mimeType = input('');
  /** File size in bytes, shown « 2,4 Mo »; hidden when `null`. */
  readonly fileSize = input<number | null>(null);
  /** Address of the file to download or of the link to open. */
  readonly href = input('');
  /** Thumbnail address (images, PDF). */
  readonly thumbnail = input('');
  /** Upload state. */
  readonly state = input<CwAttachmentState>('done');
  /** Upload progress, 0 to 100, while `uploading`. */
  readonly progress = input(0, { transform: numberAttribute });
  /** Error message on `error`; says what to do (« Trop volumineux (max. 50 Mo) »). */
  readonly error = input('');
  /** A 58 px card or a 28 px chip. */
  readonly size = input<CwAttachmentSize>('default');
  /** `vertical` draws a thumbnail; it ignores `size`. */
  readonly orientation = input<CwAttachmentOrientation>('horizontal');
  /** Shows « Retirer ». */
  readonly removable = input(true, { transform: booleanAttribute });
  /** Start of the remove button's accessible name (« Retirer maquette-accueil.fig »). */
  readonly removeLabel = input('Retirer');
  /** Replaces the other French texts. */
  readonly labels = input<Partial<CwAttachmentLabels>>({});

  /** Click on the name: open the preview; `preventDefault()` keeps the browser on the page. */
  readonly open = output<MouseEvent>();
  /** Retirer: detach the file (a deletion goes through an Alert Dialog, never from the card). */
  readonly remove = output();
  /** Réessayer, on `error`. */
  readonly retry = output();
  /** Annuler l'envoi, while uploading. */
  // The sheet names this output `cancel`; it is bound on the component, not on a dialog.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output();

  private readonly announcer = inject(LiveAnnouncer);

  protected readonly text = computed(() => ({ ...LABELS, ...this.labels() }));
  protected readonly layout = computed<Layout>(() =>
    this.orientation() === 'vertical' ? 'tile' : this.size() === 'sm' ? 'chip' : 'card',
  );
  protected readonly rootClasses = computed(() => ROOT[this.layout()]);
  protected readonly nameClasses = computed(() => NAME[this.layout()]);
  /** The type in use, given or detected. */
  readonly kind = computed(
    () => this.type() ?? detectType(this.name(), this.mimeType(), this.href()),
  );
  protected readonly icon = computed(() => typeIcon(this.kind(), this.name()));
  protected readonly percent = computed(() =>
    Math.round(Math.min(100, Math.max(0, this.progress()))),
  );
  protected readonly sizeText = computed(() => {
    const bytes = this.fileSize();
    return bytes === null ? '' : ɵformatFileSize(bytes);
  });
  protected readonly meta = computed(() => {
    if (this.kind() === 'link') return this.href() ? domainOf(this.href()) : '';
    const word =
      this.kind() === 'image'
        ? this.text().image
        : this.kind() === 'pdf'
          ? 'PDF'
          : ɵextensionOf(this.name()).toUpperCase() || this.text().file;
    return [this.sizeText(), word].filter((part) => part !== '').join(' · ');
  });
  protected readonly chipMeta = computed(() =>
    this.kind() === 'link' ? this.meta() : this.sizeText(),
  );
  protected readonly isLink = computed(() => this.kind() === 'link');

  constructor() {
    let previous: CwAttachmentState | null = null;
    effect(() => {
      const state = this.state();
      // Announce transitions only (sheet: end of upload and error through LiveAnnouncer).
      if (previous !== null && previous !== state) {
        if (state === 'done') void this.announcer.announce(`${this.name()} ${this.text().done}`);
        if (state === 'error' && this.error()) void this.announcer.announce(this.error());
      }
      previous = state;
    });
  }

  protected opened(event: MouseEvent): void {
    this.open.emit(event);
  }

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
}
