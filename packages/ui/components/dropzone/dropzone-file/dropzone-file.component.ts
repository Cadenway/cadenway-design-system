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
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CwButton } from '@cadenway/ui/components/button';
import { ɵformatFileSize } from '@cadenway/ui/core';
import { CwSpinner } from '@cadenway/ui/components/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorArrowCounterClockwiseBold,
  phosphorFileBold,
  phosphorFileCsvBold,
  phosphorFileImageBold,
  phosphorFilePdfBold,
  phosphorFileZipBold,
  phosphorWarningCircleBold,
  phosphorXBold,
} from '@ng-icons/phosphor-icons/bold';
import { phosphorCheckCircleFill } from '@ng-icons/phosphor-icons/fill';

import { fileIcon } from '../dropzone.format';
import type { CwDropzoneFileLabels, CwDropzoneFileState } from '../dropzone.types';

const LABELS: CwDropzoneFileLabels = {
  queued: 'En attente',
  of: 'sur',
  progress: 'Envoi de',
  sending: 'Envoi en cours',
  cancel: "Annuler l'envoi de",
  retry: "Réessayer l'envoi de",
  remove: 'Retirer',
  done: 'joint',
};

/**
 * One line of the upload queue under a drop zone: type icon, name, sizes, progress and the action
 * the state allows (Dropzone sheet of the Design System artifact, « Liste d'envoi »).
 *
 * Give it the consumer's descriptor of the file (`name`, `size` in bytes) and its upload `state`:
 * `queued` shows « En attente » over an empty track, `uploading` a spinner and a named
 * `role="progressbar"` (« 64 % · 312 Ko sur 488 Ko »), `done` the jade check and the size, `error`
 * the `error` message in text (never the color alone). Cancel (`queued`, `uploading`), retry
 * (`error` and `retryable`: network errors only) and remove (`done`, `error`) are icon buttons named
 * with the file name; the row emits `cancel`, `retry` and `remove` and changes nothing itself. The
 * end of an upload and an error are announced. The host is a `listitem`: put rows in a `<ul>`.
 */
@Component({
  selector: 'cw-dropzone-file',
  imports: [CwButton, CwSpinner, NgIcon],
  providers: [
    provideIcons({
      phosphorArrowCounterClockwiseBold,
      phosphorCheckCircleFill,
      phosphorFileBold,
      phosphorFileCsvBold,
      phosphorFileImageBold,
      phosphorFilePdfBold,
      phosphorFileZipBold,
      phosphorWarningCircleBold,
      phosphorXBold,
    }),
  ],
  host: {
    role: 'listitem',
    class:
      'flex items-center gap-3 rounded-lg border px-2.5 py-2 animate-item-in motion-reduce:animate-none',
    '[attr.data-state]': 'state()',
  },
  templateUrl: './dropzone-file.component.html',
})
export class CwDropzoneFile {
  /** File name, shown truncated and used in every accessible name of the row. */
  readonly name = input.required<string>();
  /** File size in bytes. */
  readonly size = input(0, { transform: numberAttribute });
  /** Upload state. */
  readonly state = input<CwDropzoneFileState>('queued');
  /** Upload progress, 0 to 100, while `uploading`. */
  readonly progress = input(0, { transform: numberAttribute });
  /** Error message shown under the name in the `error` state (« Trop volumineux : 50 Mo maximum. »). */
  readonly error = input('');
  /** Offers « Réessayer » in the `error` state; set it for network errors, not for local refusals. */
  readonly retryable = input(false, { transform: booleanAttribute });
  /** Replaces some of the French texts. */
  readonly labels = input<Partial<CwDropzoneFileLabels>>({});

  /** Cancel the upload (`queued`, `uploading`). */
  // The sheet names this output `cancel`; it is bound on the component, not on a dialog.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output();
  /** Send the file again (`error` and `retryable`). */
  readonly retry = output();
  /** Take the file out of the queue (`done`, `error`). */
  readonly remove = output();

  private readonly announcer = inject(LiveAnnouncer);

  protected readonly text = computed(() => ({ ...LABELS, ...this.labels() }));
  protected readonly icon = computed(() => fileIcon(this.name()));
  protected readonly percent = computed(() =>
    Math.round(Math.min(100, Math.max(0, this.progress()))),
  );
  protected readonly sizeText = computed(() => ɵformatFileSize(this.size()));
  protected readonly progressText = computed(() => {
    const sent = ɵformatFileSize((this.size() * this.percent()) / 100);
    return `${String(this.percent())} % · ${sent} ${this.text().of} ${this.sizeText()}`;
  });

  constructor() {
    let previous: CwDropzoneFileState | null = null;
    effect(() => {
      const state = this.state();
      // Announce transitions only: a row rendered as done or failed is read with the list.
      if (previous !== null && previous !== state) {
        if (state === 'done') void this.announcer.announce(`${this.name()} ${this.text().done}`);
        if (state === 'error' && this.error()) void this.announcer.announce(this.error());
      }
      previous = state;
    });
  }
}
