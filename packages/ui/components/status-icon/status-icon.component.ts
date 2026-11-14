import { _IdGenerator } from '@angular/cdk/a11y';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  input,
  signal,
  type InputSignal,
  type InputSignalWithTransform,
  type Signal,
  type WritableSignal,
} from '@angular/core';

import type { CwStatusIconSize, CwStatusKey } from './status-icon.types';

/**
 * Constant TONES
 *
 * @description
 * Literal color classes for each status, discoverable by Tailwind.
 *
 * @type {Record<CwStatusKey, string>}
 */
const TONES: Record<CwStatusKey, string> = {
  triage: 'text-amethyste',
  backlog: 'text-ink-muted',
  todo: 'text-ink-muted',
  progress: 'text-balise',
  review: 'text-cornaline',
  testing: 'text-jade',
  waiting: 'text-ink-muted',
  blocked: 'text-grenat',
  done: 'text-jade',
  cancelled: 'text-ink-muted',
};

/**
 * Constant SIZES
 *
 * @description
 * Literal dimension classes for each supported icon size.
 *
 * @type {Record<CwStatusIconSize, string>}
 */
const SIZES: Record<CwStatusIconSize, string> = {
  '3': 'size-3',
  '3.5': 'size-3.5',
  '4': 'size-4',
  '5': 'size-5',
};

/**
 * Function isStatus
 *
 * @description
 * Checks whether a value names a supported status.
 *
 * @param {unknown} value - Value to check against supported status keys.
 *
 * @returns {value is CwStatusKey} Whether the value is a supported status.
 */
function isStatus(value: unknown): value is CwStatusKey {
  return typeof value === 'string' && Object.hasOwn(TONES, value);
}

/**
 * Function toSize
 *
 * @description
 * Normalizes a size input, falling back to the default for unsupported values.
 *
 * @param {CwStatusIconSize | number | null | undefined} value - Requested size, expressed as a string or number.
 *
 * @returns {CwStatusIconSize} Supported size, or the default when the value is unsupported.
 */
function toSize(value: CwStatusIconSize | number | null | undefined): CwStatusIconSize {
  const size: string = String(value ?? '4');
  return Object.hasOwn(SIZES, size) ? (size as CwStatusIconSize) : '4';
}

/**
 * Class CwStatusIcon
 * @class CwStatusIcon
 *
 * @description
 * The animated icon of a task status: one 16 px SVG in the Phosphor stroke (1.5 px) that morphs from
 * one status to the next (mockup `StatutTache.dc.html`).
 *
 * Decorative: the SVG is `aria-hidden`, so always write the status word next to it
 * (`CW_STATUS_LABELS`, or `cw-status-badge` from `@cadenway/ui/components/badge`). `status` sets the shape and
 * the color; an unknown key falls back to `todo`, as in the mockup. `from` draws a previous status
 * first, then switches to `status` two animation frames after the first render, so a freshly
 * mounted icon (a row that moved group) still plays its morph. `milestone` draws the same layers as
 * a diamond. Under `prefers-reduced-motion` every change is immediate. Style hooks: `data-status`
 * (the status drawn right now) and `data-size` on the host.
 */
@Component({
  selector: 'cw-status-icon',
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-status]': 'shown()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './status-icon.component.html',
})
export class CwStatusIcon {
  // #region Properties
  /**
   * Property status
   * @readonly
   *
   * @description
   * Status to draw; unsupported values fall back to todo.
   *
   * @type {InputSignal<CwStatusKey>}
   */
  public readonly status: InputSignal<CwStatusKey> = input<CwStatusKey>('todo');

  /**
   * Property from
   * @readonly
   *
   * @description
   * Previous status displayed before the initial morph.
   *
   * @type {InputSignal<CwStatusKey | null | undefined>}
   */
  public readonly from: InputSignal<CwStatusKey | null | undefined> = input<
    CwStatusKey | null | undefined
  >(undefined);

  /**
   * Property milestone
   * @readonly
   *
   * @description
   * Draws the status in the diamond shape of a milestone.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   */
  public readonly milestone: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property size
   * @readonly
   *
   * @description
   * Icon side length, accepting supported string or numeric values.
   *
   * @type {InputSignalWithTransform<CwStatusIconSize, CwStatusIconSize | number | null | undefined>}
   */
  public readonly size: InputSignalWithTransform<
    CwStatusIconSize,
    CwStatusIconSize | number | null | undefined
  > = input<CwStatusIconSize, CwStatusIconSize | number | null | undefined>('4', {
    transform: toSize,
  });

  /**
   * Property clipId
   * @readonly
   *
   * @description
   * Unique identifier for the diamond clip path.
   *
   * @type {string}
   */
  protected readonly clipId: string = inject(_IdGenerator).getId('cw-status-icon-clip-');

  /**
   * Property clipUrl
   * @readonly
   *
   * @description
   * SVG reference to the unique clip path.
   *
   * @type {string}
   */
  protected readonly clipUrl: string = `url(#${this.clipId})`;

  /**
   * Property armed
   * @readonly
   *
   * @description
   * Whether the initial animation frames have elapsed.
   *
   * @type {WritableSignal<boolean>}
   */
  private readonly armed: WritableSignal<boolean> = signal(false);

  /**
   * Property current
   * @readonly
   *
   * @description
   * Validated target status with its default fallback.
   *
   * @type {Signal<CwStatusKey>}
   */
  protected readonly current: Signal<CwStatusKey> = computed<CwStatusKey>(() => {
    const status: CwStatusKey = this.status();
    return isStatus(status) ? status : 'todo';
  });

  /**
   * Property shown
   * @readonly
   *
   * @description
   * Status currently drawn during the initial morph.
   *
   * @type {Signal<CwStatusKey>}
   */
  protected readonly shown: Signal<CwStatusKey> = computed<CwStatusKey>(() => {
    const from: CwStatusKey | null | undefined = this.from();
    const current: CwStatusKey = this.current();
    return !this.armed() && isStatus(from) && from !== current ? from : current;
  });

  /**
   * Property tone
   * @readonly
   *
   * @description
   * Color class for the status currently drawn.
   *
   * @type {Signal<string>}
   */
  protected readonly tone: Signal<string> = computed(() => TONES[this.shown()]);

  /**
   * Property hostClasses
   * @readonly
   *
   * @description
   * Host layout and size classes.
   *
   * @type {Signal<string>}
   */
  protected readonly hostClasses: Signal<string> = computed(
    () => `${SIZES[this.size()]} group/status inline-flex shrink-0`,
  );
  // #endregion

  // #region Constructor
  /**
   * Constructor
   * @constructor
   *
   * @description
   * Schedules the initial morph and cancels its pending frame on destruction.
   */
  public constructor() {
    const view: (Window & typeof globalThis) | null = inject(DOCUMENT).defaultView;
    let frame: number = 0;
    // Mockup `StatutTache.dc.html`: two frames, so the browser paints `from` before the morph starts.
    afterNextRender(() => {
      if (typeof view?.requestAnimationFrame !== 'function') {
        this.armed.set(true);
        return;
      }
      frame = view.requestAnimationFrame(() => {
        frame = view.requestAnimationFrame(() => {
          this.armed.set(true);
        });
      });
    });
    inject(DestroyRef).onDestroy(() => {
      view?.cancelAnimationFrame(frame);
    });
  }
  // #endregion
}
