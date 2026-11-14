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
  type InputSignal,
  type InputSignalWithTransform,
  numberAttribute,
  signal,
  type Signal,
  viewChild,
  type WritableSignal,
} from '@angular/core';

import { CwToastItem } from '../toast-item/toast-item.component';
import { CW_TOAST_DURATIONS } from '../toast.constants';
import { CwToastService } from '../toast.service';
import type { CwToast, CwToastDurations, CwToastPosition } from '../toast.types';

/* Literal class strings (Toast sheet and preview of the Design System artifact). At the top of the
   screen the stack opens downwards: the list and the counter swap places. */
/**
 * Constant REGION
 *
 * @description
 * Base positioning and sizing classes for the notification region.
 *
 * @type {string}
 */
const REGION: string = 'fixed z-50 flex w-[356px] max-w-[calc(100%-2rem)] outline-none';

/**
 * Constant POSITIONS
 *
 * @description
 * Maps each screen position to its alignment and stack direction classes.
 *
 * @type {Record<CwToastPosition, string>}
 */
const POSITIONS: Record<CwToastPosition, string> = {
  'top-left': 'top-4 left-4 flex-col-reverse',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 flex-col-reverse',
  'top-right': 'top-4 right-4 flex-col-reverse',
  'bottom-left': 'bottom-4 left-4 flex-col',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 flex-col',
  'bottom-right': 'right-4 bottom-4 flex-col',
};

// Folded, the toasts behind the front one peek out by 8 px each: the counter keeps its distance.
/**
 * Constant GAPS
 *
 * @description
 * Controls the spacing between the counter and stack when folded or unfolded.
 *
 * @type {Readonly<{ folded: string; unfolded: string }>}
 */
const GAPS: Readonly<{ folded: string; unfolded: string }> = {
  folded: 'gap-5',
  unfolded: 'gap-4',
} as const;

/**
 * Constant LISTS
 *
 * @description
 * Provides list layout classes for folded and unfolded stacks.
 *
 * @type {Readonly<{ folded: string; bottom: string; top: string }>}
 */
const LISTS: Readonly<{ folded: string; bottom: string; top: string }> = {
  folded: 'relative',
  bottom: 'flex flex-col gap-2',
  top: 'flex flex-col-reverse gap-2',
} as const;

/**
 * Constant COUNTER
 *
 * @description
 * Styles the count of older notifications waiting behind the visible stack.
 *
 * @type {string}
 */
const COUNTER: string =
  'inline-flex h-5 items-center rounded-full bg-secondary px-2 text-[11px] font-medium text-muted-foreground tabular-nums';

// The stack moves (fold, unfold, arrival, departure) on `transform` only; not while dragged.
/**
 * Constant ITEM
 *
 * @description
 * Styles stack movement while disabling transitions during dragging.
 *
 * @type {string}
 */
const ITEM: string =
  'block transition-transform duration-300 ease-snap motion-reduce:transition-none [&.cdk-drag-dragging]:transition-none';

// Folded stack (sheet, « Pile repliée »): rank 0 is the newest, in front; ranks 1 and 2 sit behind
// it, 8 px and 16 px further, at 96 % and 92 %; any further rank is invisible.
/**
 * Constant BOTTOM_RANKS
 *
 * @description
 * Offsets and scales folded items when the stack is at the bottom.
 *
 * @type {readonly string[]}
 */
const BOTTOM_RANKS: readonly string[] = [
  'relative',
  'absolute inset-0 origin-top -translate-y-2 scale-[0.96]',
  'absolute inset-0 origin-top -translate-y-4 scale-[0.92]',
  'absolute inset-0 origin-top -translate-y-4 scale-[0.92] opacity-0',
] as const;
/**
 * Constant TOP_RANKS
 *
 * @description
 * Offsets and scales folded items when the stack is at the top.
 *
 * @type {readonly string[]}
 */
const TOP_RANKS: readonly string[] = [
  'relative',
  'absolute inset-0 origin-bottom translate-y-2 scale-[0.96]',
  'absolute inset-0 origin-bottom translate-y-4 scale-[0.92]',
  'absolute inset-0 origin-bottom translate-y-4 scale-[0.92] opacity-0',
] as const;
/**
 * Constant UNFOLDED
 *
 * @description
 * Places each item normally in the unfolded stack.
 *
 * @type {string}
 */
const UNFOLDED: string = 'relative';

// Sheet, « Glissé »: past 40 % of its width the toast closes, otherwise it slides back.
/**
 * Constant SWIPE_RATIO
 *
 * @description
 * Minimum proportion of toast width required to dismiss a swipe toward the edge.
 *
 * @type {number}
 */
const SWIPE_RATIO: number = 0.4;

/**
 * Component CwToaster
 *
 * @description
 * The notification region of the application, where `CwToastService` shows its toasts: place it once in the application template (Toast sheet of the Design System artifact). A `section` named `ariaLabel` (« Notifications (F8) ») in a corner (`position`). The newest `visibleToasts` toasts are shown, the older ones wait and are counted (« +2 »). Several toasts fold into a stack (−8 px and 96 % per rank) that unfolds while hovered, while the focus is inside or with `expand`; the durations pause meanwhile and while the window is inactive. `hotkey` (F8) moves the focus into the region; Escape closes the focused toast and returns the focus where it was. A toast swiped towards the screen edge past 40 % of its width closes. `duration` overrides the duration of any tone, `closeButton` adds the close button (`closeLabel`) to every toast.
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
  // #region Properties
  /**
   * Property position
   *
   * @description
   * Corner or edge of the screen.
   *
   * @type {InputSignal<CwToastPosition>}
   * @readonly
   */
  public readonly position: InputSignal<CwToastPosition> = input<CwToastPosition>('bottom-right');

  /**
   * Property expand
   *
   * @description
   * Keeps the stack unfolded.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly expand: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property visibleToasts
   *
   * @description
   * How many toasts are shown; the older ones wait, counted by « +N ».
   *
   * @type {InputSignalWithTransform<number, unknown>}
   * @readonly
   */
  public readonly visibleToasts: InputSignalWithTransform<number, unknown> = input(3, {
    transform: numberAttribute,
  });

  /**
   * Property duration
   *
   * @description
   * Duration per tone in milliseconds, over `CW_TOAST_DURATIONS` (`Infinity`: until closed).
   *
   * @type {InputSignal<CwToastDurations>}
   * @readonly
   */
  public readonly duration: InputSignal<CwToastDurations> = input<CwToastDurations>({});

  /**
   * Property closeButton
   *
   * @description
   * Adds the close button to every toast.
   *
   * @type {InputSignalWithTransform<boolean, unknown>}
   * @readonly
   */
  public readonly closeButton: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  /**
   * Property hotkey
   *
   * @description
   * Key (`KeyboardEvent.key`) that moves the focus into the region.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly hotkey: InputSignal<string> = input('F8');

  /**
   * Property ariaLabel
   *
   * @description
   * Accessible name of the region; it names the hotkey.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly ariaLabel: InputSignal<string> = input('Notifications (F8)');

  /**
   * Property closeLabel
   *
   * @description
   * Accessible name of the close buttons.
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly closeLabel: InputSignal<string> = input('Fermer la notification');

  /**
   * Property olderLabel
   *
   * @description
   * Text of the counter of waiting toasts while the stack is unfolded.
   *
   * @type {InputSignal<(count: number) => string>}
   * @readonly
   */
  public readonly olderLabel: InputSignal<(count: number) => string> = input<
    (count: number) => string
  >((count) => `+${String(count)} plus anciennes`);

  /**
   * Property service
   *
   * @description
   * Service supplying notification records and controlling their timers.
   *
   * @type {CwToastService}
   * @readonly
   */
  protected readonly service: CwToastService = inject(CwToastService);

  /**
   * Property inactive
   *
   * @description
   * Tracks whether the browser window or document is inactive.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  protected readonly inactive: WritableSignal<boolean> = signal(false);

  /**
   * Property hovered
   *
   * @description
   * Tracks pointer presence in the notification region.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly hovered: WritableSignal<boolean> = signal(false);

  /**
   * Property focused
   *
   * @description
   * Tracks whether focus is inside the notification region.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  private readonly focused: WritableSignal<boolean> = signal(false);

  /**
   * Property region
   *
   * @description
   * Reference to the focusable notification region.
   *
   * @type {Signal<ElementRef<HTMLElement>>}
   * @readonly
   */
  private readonly region: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('region');

  /**
   * Property document
   *
   * @description
   * Document used to inspect the active element and visibility state.
   *
   * @type {Document}
   * @readonly
   */
  private readonly document: Document = inject(DOCUMENT);

  /**
   * Property previousFocus
   *
   * @description
   * Element to restore focus to after using the region hotkey.
   *
   * @type {HTMLElement | null}
   */
  private previousFocus: HTMLElement | null = null;

  /**
   * Property expanded
   *
   * @description
   * Indicates whether configuration, hover or focus has unfolded the stack.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly expanded: Signal<boolean> = computed(
    () => this.expand() || this.hovered() || this.focused(),
  );

  /**
   * Property top
   *
   * @description
   * Indicates whether the stack is positioned at the top of the screen.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  protected readonly top: Signal<boolean> = computed(() => this.position().startsWith('top'));

  /**
   * Property shown
   *
   * @description
   * The newest `visibleToasts` open toasts, and those playing their exit, oldest first.
   *
   * @type {Signal<readonly CwToast[]>}
   * @readonly
   */
  protected readonly shown: Signal<readonly CwToast[]> = computed(() => {
    const toasts: readonly CwToast[] = this.service.toasts();
    const open: CwToast[] = toasts.filter((toast) => toast.state === 'open');
    const visible: Set<string> = new Set<string>(
      open.slice(-this.visibleToasts()).map((toast) => toast.id),
    );
    return toasts.filter((toast) => toast.state === 'closed' || visible.has(toast.id));
  });

  /**
   * Property waiting
   *
   * @description
   * Counts open notifications not currently shown in the stack.
   *
   * @type {Signal<number>}
   * @readonly
   */
  protected readonly waiting: Signal<number> = computed(
    () =>
      this.service.toasts().filter((toast) => toast.state === 'open').length -
      this.shown().filter((toast) => toast.state === 'open').length,
  );

  /**
   * Property counter
   *
   * @description
   * Formats the waiting count for the current stack state.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly counter: Signal<string> = computed(() =>
    this.expanded() ? this.olderLabel()(this.waiting()) : `+${String(this.waiting())}`,
  );

  /**
   * Property regionClasses
   *
   * @description
   * Combines positioning and spacing classes for the region.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly regionClasses: Signal<string> = computed(
    () =>
      `${REGION} ${POSITIONS[this.position()]} ${this.expanded() ? GAPS.unfolded : GAPS.folded}`,
  );

  /**
   * Property listClasses
   *
   * @description
   * Selects the list layout for the current stack state and position.
   *
   * @type {Signal<string>}
   * @readonly
   */
  protected readonly listClasses: Signal<string> = computed(() => {
    if (!this.expanded()) return LISTS.folded;
    return this.top() ? LISTS.top : LISTS.bottom;
  });

  /**
   * Property counterClasses
   *
   * @description
   * Classes applied to the waiting count.
   *
   * @type {string}
   * @readonly
   */
  protected readonly counterClasses: string = COUNTER;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Registers the toaster and synchronizes timer settings and pause state with the service.
   *
   * @constructor
   */
  public constructor() {
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
  // #endregion

  // #region Methods
  /**
   * Method rank
   *
   * @description
   * Distance of a toast from the newest one (0); drives the folded stack.
   *
   * @param {number} index - Index of the item within the shown stack.
   * @returns {number} Distance from the newest item, starting at zero.
   */
  protected rank(index: number): number {
    return this.shown().length - 1 - index;
  }

  /**
   * Method itemClasses
   *
   * @description
   * Combines movement and rank classes for an item in the stack.
   *
   * @param {number} index - Index of the item within the shown stack.
   * @returns {string} Classes for the item at the given index.
   */
  protected itemClasses(index: number): string {
    if (this.expanded()) return `${ITEM} ${UNFOLDED}`;
    const ranks: readonly string[] = this.top() ? TOP_RANKS : BOTTOM_RANKS;
    return `${ITEM} ${ranks[Math.min(this.rank(index), ranks.length - 1)]}`;
  }

  /**
   * Method run
   *
   * @description
   * Runs the action of an open toast and dismisses it.
   *
   * @param {CwToast} toast - Toast affected by the interaction.
   */
  protected run(toast: CwToast): void {
    if (toast.state !== 'open') return;
    toast.action?.run();
    this.service.dismiss(toast.id);
  }

  /**
   * Method remove
   *
   * @description
   * Removes a toast after its exit animation completes.
   *
   * @param {CwToast} toast - Toast affected by the interaction.
   */
  protected remove(toast: CwToast): void {
    this.service.ɵremove(toast.id);
  }

  /**
   * Method onSwipe
   *
   * @description
   * Dismisses a toast swiped sufficiently toward the screen edge, or resets its position.
   *
   * @param {CdkDragEnd} event - Browser or drag event associated with the interaction.
   * @param {CwToast} toast - Toast affected by the interaction.
   */
  protected onSwipe(event: CdkDragEnd, toast: CwToast): void {
    const width: number = event.source.element.nativeElement.offsetWidth;
    const towardsEdge: number = this.position().endsWith('left')
      ? -event.distance.x
      : event.distance.x;
    if (towardsEdge > 0 && towardsEdge >= width * SWIPE_RATIO) this.service.dismiss(toast.id);
    else event.source.reset();
  }

  /**
   * Method onPointer
   *
   * @description
   * Updates whether the pointer is inside the notification region.
   *
   * @param {boolean} inside - Whether the pointer is inside the region.
   */
  protected onPointer(inside: boolean): void {
    this.hovered.set(inside);
  }

  /**
   * Method onFocusIn
   *
   * @description
   * Marks the notification region as focused.
   */
  protected onFocusIn(): void {
    this.focused.set(true);
  }

  /**
   * Method onFocusOut
   *
   * @description
   * Clears focus state when focus moves outside the region.
   *
   * @param {FocusEvent} event - Browser or drag event associated with the interaction.
   */
  protected onFocusOut(event: FocusEvent): void {
    const next: EventTarget | null = event.relatedTarget;
    if (!(next instanceof Node) || !this.region().nativeElement.contains(next)) {
      this.focused.set(false);
    }
  }

  /**
   * Method onEscape
   *
   * @description
   * Restores focus to the previously focused element when available, otherwise to the region.
   */
  protected onEscape(): void {
    const previous: HTMLElement | null = this.previousFocus;
    this.previousFocus = null;
    if (previous?.isConnected) previous.focus();
    else this.region().nativeElement.focus();
  }

  /**
   * Method onDocumentKeydown
   *
   * @description
   * Moves focus to the notification region when its configured hotkey is pressed.
   *
   * @param {KeyboardEvent} event - Browser or drag event associated with the interaction.
   */
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== this.hotkey() || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const region: HTMLElement = this.region().nativeElement;
    const active: Element | null = this.document.activeElement;
    if (active instanceof HTMLElement && !region.contains(active)) this.previousFocus = active;
    region.focus();
  }

  /**
   * Method onVisibilityChange
   *
   * @description
   * Updates inactivity when the document visibility changes.
   */
  protected onVisibilityChange(): void {
    this.inactive.set(this.document.visibilityState === 'hidden');
  }
  // #endregion
}
