import {
  afterNextRender,
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

import type { CwPriorityIconSize, CwPriorityKey } from './priority-icon.types';

/**
 * Constant TONES
 *
 * @description
 * Literal color classes for each priority, discoverable by Tailwind.
 *
 * @type {Record<CwPriorityKey, string>}
 */
const TONES: Record<CwPriorityKey, string> = {
  urgente: 'text-grenat',
  haute: 'text-cornaline',
  moyenne: 'text-balise',
  basse: 'text-ink-muted',
};

/**
 * Constant SIZES
 *
 * @description
 * Literal dimension classes for each supported icon size.
 *
 * @type {Record<CwPriorityIconSize, string>}
 */
const SIZES: Record<CwPriorityIconSize, string> = {
  '3': 'size-3',
  '3.5': 'size-3.5',
  '4': 'size-4',
  '5': 'size-5',
};

/**
 * Function isPriority
 *
 * @description
 * Checks whether a value names a supported priority.
 *
 * @param {unknown} value - Value to check against supported priority keys.
 *
 * @returns {value is CwPriorityKey} Whether the value is a supported priority.
 */
function isPriority(value: unknown): value is CwPriorityKey {
  return typeof value === 'string' && Object.hasOwn(TONES, value);
}

/**
 * Function toSize
 *
 * @description
 * Normalizes a size input, falling back to the default for unsupported values.
 *
 * @param {CwPriorityIconSize | number | null | undefined} value - Requested size, expressed as a string or number.
 *
 * @returns {CwPriorityIconSize} Supported size, or the default when the value is unsupported.
 */
function toSize(value: CwPriorityIconSize | number | null | undefined): CwPriorityIconSize {
  const size: string = String(value ?? '4');
  return Object.hasOwn(SIZES, size) ? (size as CwPriorityIconSize) : '4';
}

/**
 * Class CwPriorityIcon
 * @class CwPriorityIcon
 *
 * @description
 * The animated icon of a task priority: three growing bars that light up one by one, folding into
 * a disc with an exclamation mark for `urgente` (mockup `PrioriteTache.dc.html`).
 *
 * Decorative: the SVG is `aria-hidden`, so always write the priority word next to it
 * (`CW_PRIORITY_LABELS`, or `cw-priority-badge` from `@cadenway/ui/components/badge`). `priority` sets the
 * shape and the color; an unknown key falls back to `moyenne`, as in the mockup. `from` draws a
 * previous priority first, then switches to `priority` two animation frames after the first render,
 * so a freshly mounted icon still plays its morph. Under `prefers-reduced-motion` every change is
 * immediate. Style hooks: `data-priority` (the priority drawn right now) and `data-size` on the host.
 */
@Component({
  selector: 'cw-priority-icon',
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-priority]': 'shown()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './priority-icon.component.html',
})
export class CwPriorityIcon {
  // #region Properties
  /**
   * Property priority
   * @readonly
   *
   * @description
   * Priority to draw; unsupported values fall back to moyenne.
   *
   * @type {InputSignal<CwPriorityKey>}
   */
  public readonly priority: InputSignal<CwPriorityKey> = input<CwPriorityKey>('moyenne');

  /**
   * Property from
   * @readonly
   *
   * @description
   * Previous priority displayed before the initial morph.
   *
   * @type {InputSignal<CwPriorityKey | null | undefined>}
   */
  public readonly from: InputSignal<CwPriorityKey | null | undefined> = input<
    CwPriorityKey | null | undefined
  >(undefined);

  /**
   * Property size
   * @readonly
   *
   * @description
   * Icon side length, accepting supported string or numeric values.
   *
   * @type {InputSignalWithTransform<CwPriorityIconSize, CwPriorityIconSize | number | null | undefined>}
   */
  public readonly size: InputSignalWithTransform<
    CwPriorityIconSize,
    CwPriorityIconSize | number | null | undefined
  > = input<CwPriorityIconSize, CwPriorityIconSize | number | null | undefined>('4', {
    transform: toSize,
  });

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
   * Validated target priority with its default fallback.
   *
   * @type {Signal<CwPriorityKey>}
   */
  protected readonly current: Signal<CwPriorityKey> = computed<CwPriorityKey>(() => {
    const priority: CwPriorityKey = this.priority();
    return isPriority(priority) ? priority : 'moyenne';
  });

  /**
   * Property shown
   * @readonly
   *
   * @description
   * Priority currently drawn during the initial morph.
   *
   * @type {Signal<CwPriorityKey>}
   */
  protected readonly shown: Signal<CwPriorityKey> = computed<CwPriorityKey>(() => {
    const from: CwPriorityKey | null | undefined = this.from();
    const current: CwPriorityKey = this.current();
    return !this.armed() && isPriority(from) && from !== current ? from : current;
  });

  /**
   * Property tone
   * @readonly
   *
   * @description
   * Color class for the priority currently drawn.
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
    () => `${SIZES[this.size()]} group/priority inline-flex shrink-0`,
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
    // Mockup `PrioriteTache.dc.html`: two frames, so the browser paints `from` before the morph starts.
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
