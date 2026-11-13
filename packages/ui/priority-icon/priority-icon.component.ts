import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  input,
  signal,
} from '@angular/core';

import type { CwPriorityIconSize, CwPriorityKey } from './priority-icon.types';

/* Literal class strings (mockup `PrioriteTache.dc.html`, `TONES` and `SIZES`), so Tailwind finds
   them in the compiled package. The number of lit bars carries the meaning, the color confirms it. */
const TONES: Record<CwPriorityKey, string> = {
  urgente: 'text-grenat',
  haute: 'text-cornaline',
  moyenne: 'text-balise',
  basse: 'text-ink-muted',
};

const SIZES: Record<CwPriorityIconSize, string> = {
  '3': 'size-3',
  '3.5': 'size-3.5',
  '4': 'size-4',
  '5': 'size-5',
};

function isPriority(value: unknown): value is CwPriorityKey {
  return typeof value === 'string' && Object.hasOwn(TONES, value);
}

function toSize(value: CwPriorityIconSize | number | null | undefined): CwPriorityIconSize {
  const size = String(value ?? '4');
  return Object.hasOwn(SIZES, size) ? (size as CwPriorityIconSize) : '4';
}

/**
 * The animated icon of a task priority: three growing bars that light up one by one, folding into
 * a disc with an exclamation mark for `urgente` (mockup `PrioriteTache.dc.html`).
 *
 * Decorative: the SVG is `aria-hidden`, so always write the priority word next to it
 * (`CW_PRIORITY_LABELS`, or `cw-priority-badge` from `@cadenway/ui/badge`). `priority` sets the
 * shape and the color; an unknown key falls back to `moyenne`, as in the mockup. `from` draws a
 * previous priority first, then switches to `priority` two animation frames after the first render,
 * so a freshly mounted icon still plays its morph. Under `prefers-reduced-motion` every change is
 * immediate. Style hooks: `data-priority` (the priority drawn right now) and `data-size` on the host.
 */
@Component({
  selector: 'cw-priority-icon',
  styleUrl: './priority-icon.component.css',
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-priority]': 'shown()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './priority-icon.component.html',
})
export class CwPriorityIcon {
  /** The priority to draw; an unknown key draws `moyenne`. */
  readonly priority = input<CwPriorityKey>('moyenne');
  /** A previous priority drawn first, then morphed into `priority` two frames after the first render. */
  readonly from = input<CwPriorityKey | null | undefined>(undefined);
  /** Side of the icon: `3` (12 px) to `5` (20 px); numbers are accepted. */
  readonly size = input<CwPriorityIconSize, CwPriorityIconSize | number | null | undefined>('4', {
    transform: toSize,
  });

  private readonly armed = signal(false);

  protected readonly current = computed<CwPriorityKey>(() => {
    const priority = this.priority();
    return isPriority(priority) ? priority : 'moyenne';
  });
  protected readonly shown = computed<CwPriorityKey>(() => {
    const from = this.from();
    const current = this.current();
    return !this.armed() && isPriority(from) && from !== current ? from : current;
  });
  protected readonly tone = computed(() => TONES[this.shown()]);
  protected readonly hostClasses = computed(() => `${SIZES[this.size()]} inline-flex shrink-0`);

  constructor() {
    const view = inject(DOCUMENT).defaultView;
    let frame = 0;
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
}
