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

/**
 * Constant LABELS
 *
 * @description
 * Default French labels for upload file rows.
 *
 * @type {CwDropzoneFileLabels}
 */
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
 * Class CwDropzoneFile
 * @class CwDropzoneFile
 *
 * @description
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
  // #region Properties
  /**
   * Property name
   * @readonly
   *
   * @description
   * File name, shown truncated and used in every accessible name of the row.
   *
   * @type {InputSignal<string>}
   */
  public readonly name: InputSignal<string> = input.required<string>();

  /**
   * Property size
   * @readonly
   *
   * @description
   * File size in bytes.
   *
   * @type {InputSignalWithTransform<number, unknown>}
   */
  public readonly size: InputSignalWithTransform<number, unknown> = input(0, {
    transform: numberAttribute,
  });

  /**
   * Property state
   * @readonly
   *
   * @description
   * Upload state.
   *
   * @type {InputSignal<CwDropzoneFileState>}
   */
  public readonly state: InputSignal<CwDropzoneFileState> = input<CwDropzoneFileState>('queued');

  /**
   * Property progress
   * @readonly
   *
   * @description
   * Upload progress, 0 to 100, while `uploading`.
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
   * Error message shown under the name in the `error` state (« Trop volumineux : 50 Mo maximum. »).
   *
   * @type {InputSignal<string>}
   */
  public readonly error: InputSignal<string> = input('');

  /**
   * Property retryable
   * @readonly
   *
   * @description
   * Offers « Réessayer » in the `error` state; set it for network errors, not for local refusals.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly retryable: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property labels
   * @readonly
   *
   * @description
   * Replaces some of the French texts.
   *
   * @type {InputSignal<Partial<CwDropzoneFileLabels>>}
   */
  public readonly labels: InputSignal<Partial<CwDropzoneFileLabels>> = input<
    Partial<CwDropzoneFileLabels>
  >({});

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Cancel the upload (`queued`, `uploading`).
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly cancel: OutputEmitterRef<void> = output();

  /**
   * Property retry
   * @readonly
   *
   * @description
   * Send the file again (`error` and `retryable`).
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly retry: OutputEmitterRef<void> = output();

  /**
   * Property remove
   * @readonly
   *
   * @description
   * Take the file out of the queue (`done`, `error`).
   *
   * @type {OutputEmitterRef<void>}
   */
  public readonly remove: OutputEmitterRef<void> = output();

  /**
   * Property announcer
   * @readonly
   *
   * @description
   * Announcer for upload completion and errors.
   *
   * @type {LiveAnnouncer}
   */
  private readonly announcer: LiveAnnouncer = inject(LiveAnnouncer);

  /**
   * Property text
   * @readonly
   *
   * @description
   * Default file row labels merged with overrides.
   *
   * @type {Signal<CwDropzoneFileLabels>}
   */
  protected readonly text: Signal<CwDropzoneFileLabels> = computed(() => ({
    ...LABELS,
    ...this.labels(),
  }));

  /**
   * Property icon
   * @readonly
   *
   * @description
   * File icon selected from the name extension.
   *
   * @type {Signal<string>}
   */
  protected readonly icon: Signal<string> = computed(() => fileIcon(this.name()));

  /**
   * Property percent
   * @readonly
   *
   * @description
   * Upload progress rounded and clamped from zero to one hundred.
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
   * Formatted file size.
   *
   * @type {Signal<string>}
   */
  protected readonly sizeText: Signal<string> = computed(() => ɵformatFileSize(this.size()));

  /**
   * Property progressText
   * @readonly
   *
   * @description
   * Formatted upload percentage and sent size.
   *
   * @type {Signal<string>}
   */
  protected readonly progressText: Signal<string> = computed(() => {
    const sent: string = ɵformatFileSize((this.size() * this.percent()) / 100);
    return `${String(this.percent())} % · ${sent} ${this.text().of} ${this.sizeText()}`;
  });
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Announces upload completion or errors after state transitions.
   */
  public constructor() {
    let previous: CwDropzoneFileState | null = null;
    effect(() => {
      const state: CwDropzoneFileState = this.state();
      // Announce transitions only: a row rendered as done or failed is read with the list.
      if (previous !== null && previous !== state) {
        if (state === 'done') void this.announcer.announce(`${this.name()} ${this.text().done}`);
        if (state === 'error' && this.error()) void this.announcer.announce(this.error());
      }
      previous = state;
    });
  }
  // #endregion
}
