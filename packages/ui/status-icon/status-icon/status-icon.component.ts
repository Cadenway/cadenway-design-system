import { _IdGenerator } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import type { CwStatusIconSize, CwStatusKey } from '../status-icon.types';

/* Literal class strings (mockup `StatutTache.dc.html`, `TONES` and `SIZES`), so Tailwind finds them
   in the compiled package. The shape carries the meaning, the color confirms it. */
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

const SIZES: Record<CwStatusIconSize, string> = {
  '3': 'size-3',
  '3.5': 'size-3.5',
  '4': 'size-4',
  '5': 'size-5',
};

function isStatus(value: unknown): value is CwStatusKey {
  return typeof value === 'string' && Object.hasOwn(TONES, value);
}

function toSize(value: CwStatusIconSize | number | null | undefined): CwStatusIconSize {
  const size = String(value ?? '4');
  return Object.hasOwn(SIZES, size) ? (size as CwStatusIconSize) : '4';
}

/**
 * The animated icon of a task status: one 16 px SVG in the Phosphor stroke (1.5 px) that morphs from
 * one status to the next (mockup `StatutTache.dc.html`).
 *
 * Decorative: the SVG is `aria-hidden`, so always write the status word next to it
 * (`CW_STATUS_LABELS`, or `cw-status-badge` from `@cadenway/ui/badge`). `status` sets the shape and
 * the color; an unknown key falls back to `todo`, as in the mockup. `from` draws a previous status
 * first, then switches to `status` two animation frames after the first render, so a freshly
 * mounted icon (a row that moved group) still plays its morph. `milestone` draws the same layers as
 * a diamond. Under `prefers-reduced-motion` every change is immediate. Style hooks: `data-status`
 * (the status drawn right now) and `data-size` on the host.
 */
@Component({
  selector: 'cw-status-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './status-icon.component.css',
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-status]': 'shown()',
    '[attr.data-size]': 'size()',
  },
  templateUrl: './status-icon.component.html',
})
export class CwStatusIcon {
  /** The status to draw; an unknown key draws `todo`. */
  readonly status = input<CwStatusKey>('todo');
  /** A previous status drawn first, then morphed into `status` two frames after the first render. */
  readonly from = input<CwStatusKey | null | undefined>(undefined);
  /** Draws the status as a diamond, the shape of a milestone. */
  readonly milestone = input(false, { transform: booleanAttribute });
  /** Side of the icon: `3` (12 px) to `5` (20 px); numbers are accepted. */
  readonly size = input<CwStatusIconSize, CwStatusIconSize | number | null | undefined>('4', {
    transform: toSize,
  });

  /** A unique id, because the diamond's clip path is referenced by id in the document. */
  protected readonly clipId = inject(_IdGenerator).getId('cw-status-icon-clip-');
  protected readonly clipUrl = `url(#${this.clipId})`;

  private readonly armed = signal(false);

  protected readonly current = computed<CwStatusKey>(() => {
    const status = this.status();
    return isStatus(status) ? status : 'todo';
  });
  protected readonly shown = computed<CwStatusKey>(() => {
    const from = this.from();
    const current = this.current();
    return !this.armed() && isStatus(from) && from !== current ? from : current;
  });
  protected readonly tone = computed(() => TONES[this.shown()]);
  protected readonly hostClasses = computed(() => `${SIZES[this.size()]} inline-flex shrink-0`);

  constructor() {
    const view = inject(DOCUMENT).defaultView;
    let frame = 0;
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
}
