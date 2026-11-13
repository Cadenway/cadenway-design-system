import { CdkDrag, type CdkDragEnd } from '@angular/cdk/drag-drop';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  type ElementRef,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';

import { CwToastItem } from '../toast-item/toast-item.component';
import { CW_TOAST_DURATIONS } from '../toast.constants';
import { CwToastService } from '../toast.service';
import type { CwToast, CwToastDurations, CwToastPosition } from '../toast.types';

/* Literal class strings (Toast sheet and preview of the Design System artifact). At the top of the
   screen the stack opens downwards: the list and the counter swap places. */
const REGION = 'fixed z-50 flex w-[356px] max-w-[calc(100%-2rem)] outline-none';

const POSITIONS: Record<CwToastPosition, string> = {
  'top-left': 'top-4 left-4 flex-col-reverse',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse',
  'top-right': 'top-4 right-4 flex-col-reverse',
  'bottom-left': 'bottom-4 left-4 flex-col',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col',
  'bottom-right': 'right-4 bottom-4 flex-col',
};

// Folded, the toasts behind the front one peek out by 8 px each: the counter keeps its distance.
const GAPS = { folded: 'gap-5', unfolded: 'gap-4' } as const;

const LISTS = {
  folded: 'relative',
  bottom: 'flex flex-col gap-2',
  top: 'flex flex-col-reverse gap-2',
} as const;

const COUNTER =
  'inline-flex h-5 items-center rounded-full bg-secondary px-2 text-[11px] font-medium text-muted-foreground tabular-nums';

// The stack moves (fold, unfold, arrival, departure) on `transform` only; not while dragged.
const ITEM =
  'block transition-transform duration-300 ease-snap motion-reduce:transition-none [&.cdk-drag-dragging]:transition-none';

// Folded stack (sheet, « Pile repliée »): rank 0 is the newest, in front; ranks 1 and 2 sit behind
// it, 8 px and 16 px further, at 96 % and 92 %; any further rank is invisible.
const BOTTOM_RANKS = [
  'relative',
  'absolute inset-0 origin-top -translate-y-2 scale-[0.96]',
  'absolute inset-0 origin-top -translate-y-4 scale-[0.92]',
  'absolute inset-0 origin-top -translate-y-4 scale-[0.92] opacity-0',
] as const;
const TOP_RANKS = [
  'relative',
  'absolute inset-0 origin-bottom translate-y-2 scale-[0.96]',
  'absolute inset-0 origin-bottom translate-y-4 scale-[0.92]',
  'absolute inset-0 origin-bottom translate-y-4 scale-[0.92] opacity-0',
] as const;
const UNFOLDED = 'relative';

// Sheet, « Glissé »: past 40 % of its width the toast closes, otherwise it slides back.
const SWIPE_RATIO = 0.4;

/**
 * The notification region of the application, where `CwToastService` shows its toasts: place it
 * once in the application template (Toast sheet of the Design System artifact).
 *
 * A `section` named `ariaLabel` (« Notifications (F8) ») in a corner (`position`). The newest
 * `visibleToasts` toasts are shown, the older ones wait and are counted (« +2 »). Several toasts
 * fold into a stack (−8 px and 96 % per rank) that unfolds while hovered, while the focus is inside
 * or with `expand`; the durations pause meanwhile and while the window is inactive. `hotkey` (F8)
 * moves the focus into the region; Escape closes the focused toast and returns the focus where it
 * was. A toast swiped towards the screen edge past 40 % of its width closes. `duration` overrides
 * the duration of any tone, `closeButton` adds the close button (`closeLabel`) to every toast.
 */
@Component({
  selector: 'cw-toaster',
  imports: [CdkDrag, CwToastItem],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
    '(document:visibilitychange)': 'onVisibilityChange()',
    '(window:blur)': 'inactive.set(true)',
    '(window:focus)': 'inactive.set(false)',
  },
  templateUrl: './toaster.component.html',
})
export class CwToaster {
  /** Corner or edge of the screen. */
  readonly position = input<CwToastPosition>('bottom-right');
  /** Keeps the stack unfolded. */
  readonly expand = input(false, { transform: booleanAttribute });
  /** How many toasts are shown; the older ones wait, counted by « +N ». */
  readonly visibleToasts = input(3, { transform: numberAttribute });
  /** Duration per tone in milliseconds, over `CW_TOAST_DURATIONS` (`Infinity`: until closed). */
  readonly duration = input<CwToastDurations>({});
  /** Adds the close button to every toast. */
  readonly closeButton = input(false, { transform: booleanAttribute });
  /** Key (`KeyboardEvent.key`) that moves the focus into the region. */
  readonly hotkey = input('F8');
  /** Accessible name of the region; it names the hotkey. */
  readonly ariaLabel = input('Notifications (F8)');
  /** Accessible name of the close buttons. */
  readonly closeLabel = input('Fermer la notification');
  /** Text of the counter of waiting toasts while the stack is unfolded. */
  readonly olderLabel = input<(count: number) => string>(
    (count) => `+${String(count)} plus anciennes`,
  );

  protected readonly service = inject(CwToastService);
  protected readonly inactive = signal(false);
  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  private readonly region = viewChild.required<ElementRef<HTMLElement>>('region');
  private readonly document = inject(DOCUMENT);
  private previousFocus: HTMLElement | null = null;

  protected readonly expanded = computed(() => this.expand() || this.hovered() || this.focused());
  protected readonly top = computed(() => this.position().startsWith('top'));
  /** The newest `visibleToasts` open toasts, and those playing their exit, oldest first. */
  protected readonly shown = computed(() => {
    const toasts = this.service.toasts();
    const open = toasts.filter((toast) => toast.state === 'open');
    const visible = new Set(open.slice(-this.visibleToasts()).map((toast) => toast.id));
    return toasts.filter((toast) => toast.state === 'closed' || visible.has(toast.id));
  });
  protected readonly waiting = computed(
    () =>
      this.service.toasts().filter((toast) => toast.state === 'open').length -
      this.shown().filter((toast) => toast.state === 'open').length,
  );
  protected readonly counter = computed(() =>
    this.expanded() ? this.olderLabel()(this.waiting()) : `+${String(this.waiting())}`,
  );
  protected readonly regionClasses = computed(
    () =>
      `${REGION} ${POSITIONS[this.position()]} ${this.expanded() ? GAPS.unfolded : GAPS.folded}`,
  );
  protected readonly listClasses = computed(() => {
    if (!this.expanded()) return LISTS.folded;
    return this.top() ? LISTS.top : LISTS.bottom;
  });
  protected readonly counterClasses = COUNTER;

  constructor() {
    inject(DestroyRef).onDestroy(this.service.ɵattach());
    effect(() => {
      this.service.ɵconfigure(
        { ...CW_TOAST_DURATIONS, ...this.duration() },
        Math.max(1, this.visibleToasts()),
      );
    });
    effect(() => {
      this.service.ɵpause(this.expanded() || this.inactive());
    });
  }

  /** Distance of a toast from the newest one (0); drives the folded stack. */
  protected rank(index: number): number {
    return this.shown().length - 1 - index;
  }

  protected itemClasses(index: number): string {
    if (this.expanded()) return `${ITEM} ${UNFOLDED}`;
    const ranks = this.top() ? TOP_RANKS : BOTTOM_RANKS;
    return `${ITEM} ${ranks[Math.min(this.rank(index), ranks.length - 1)]}`;
  }

  // An action runs once: a toast already closing ignores it.
  protected run(toast: CwToast): void {
    if (toast.state !== 'open') return;
    toast.action?.run();
    this.service.dismiss(toast.id);
  }

  protected remove(toast: CwToast): void {
    this.service.ɵremove(toast.id);
  }

  protected onSwipe(event: CdkDragEnd, toast: CwToast): void {
    const width = event.source.element.nativeElement.offsetWidth;
    const towardsEdge = this.position().endsWith('left') ? -event.distance.x : event.distance.x;
    if (towardsEdge > 0 && towardsEdge >= width * SWIPE_RATIO) this.service.dismiss(toast.id);
    else event.source.reset();
  }

  protected onPointer(inside: boolean): void {
    this.hovered.set(inside);
  }

  protected onFocusIn(): void {
    this.focused.set(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.region().nativeElement.contains(next)) {
      this.focused.set(false);
    }
  }

  // Escape in the region (after a toast has closed itself): the focus goes back where it was
  // before the hotkey, or stays in the region.
  protected onEscape(): void {
    const previous = this.previousFocus;
    this.previousFocus = null;
    if (previous?.isConnected) previous.focus();
    else this.region().nativeElement.focus();
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== this.hotkey() || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const region = this.region().nativeElement;
    const active = this.document.activeElement;
    if (active instanceof HTMLElement && !region.contains(active)) this.previousFocus = active;
    region.focus();
  }

  protected onVisibilityChange(): void {
    this.inactive.set(this.document.visibilityState === 'hidden');
  }
}
