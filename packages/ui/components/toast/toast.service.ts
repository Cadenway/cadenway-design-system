import {
  DestroyRef,
  inject,
  Service,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';

import { CW_TOAST_DURATIONS } from './toast.constants';
import type {
  CwToast,
  CwToastChanges,
  CwToastOptions,
  CwToastPromiseMessages,
  CwToastTone,
} from './toast.types';

// Mockup App.dc.html: the action of an undoable change reads « Annuler ».
/**
 * Constant UNDO_LABEL
 *
 * @description
 * Label used when the undo shorthand creates an action.
 *
 * @type {string}
 */
const UNDO_LABEL: string = 'Annuler';

/**
 * Interface Timer
 *
 * @description
 * Tracks the remaining display time and scheduled timeout for a toast.
 */
interface Timer {
  // #region Properties
  /**
   * Property remaining
   *
   * @description
   * Milliseconds left; null until the toast is first shown (the tone's duration then).
   *
   * @type {number | null}
   */
  remaining: number | null;

  /**
   * Property startedAt
   *
   * @description
   * Time at which the current countdown started, in milliseconds since the epoch.
   *
   * @type {number}
   */
  startedAt: number;

  /**
   * Property handle
   *
   * @description
   * Scheduled timeout, or null while the countdown is stopped.
   *
   * @type {ReturnType<typeof setTimeout> | null}
   */
  handle: ReturnType<typeof setTimeout> | null;
  // #endregion
}

/**
 * Service CwToastService
 *
 * @description
 * Shows passing notifications in the `cw-toaster` of the application: confirm an action and offer to undo it, follow a long operation, report a transient error (Toast sheet of the Design System artifact). Inject it anywhere; place one `cw-toaster` in the application template. Every method returns or takes the toast's id. A toast closes after its duration (6 s, see `CW_TOAST_DURATIONS`; `error` and `loading` stay), its close button, Escape, a swipe or `dismiss()`; running its action closes it too. Durations only run for the toasts the toaster shows, and pause while the stack is unfolded (hover, focus, F8) or the window is inactive. Without a toaster on the page, nothing is displayed and dismissed toasts leave at once.
 */
@Service()
export class CwToastService {
  // #region Properties
  /**
   * Property list
   *
   * @description
   * Toast records including those whose exit animation is playing.
   *
   * @type {WritableSignal<readonly CwToast[]>}
   * @readonly
   */
  private readonly list: WritableSignal<readonly CwToast[]> = signal<readonly CwToast[]>([]);

  /**
   * Property toasts
   *
   * @description
   * The toasts, oldest first, including those playing their exit; read by `cw-toaster`.
   *
   * @type {Signal<readonly CwToast[]>}
   * @readonly
   */
  public readonly toasts: Signal<readonly CwToast[]> = this.list.asReadonly();

  /**
   * Property timers
   *
   * @description
   * Countdown state indexed by toast identifier.
   *
   * @type {Map<string, Timer>}
   * @readonly
   */
  private readonly timers: Map<string, Timer> = new Map<string, Timer>();

  /**
   * Property durations
   *
   * @description
   * Default duration in milliseconds for each tone.
   *
   * @type {Readonly<Record<CwToastTone, number>>}
   */
  private durations: Readonly<Record<CwToastTone, number>> = CW_TOAST_DURATIONS;

  /**
   * Property visible
   *
   * @description
   * Maximum number of recent toasts whose timers can run.
   *
   * @type {number}
   */
  private visible: number = 3;

  /**
   * Property paused
   *
   * @description
   * Whether all toast countdowns are paused.
   *
   * @type {boolean}
   */
  private paused: boolean = false;

  /**
   * Property hosts
   *
   * @description
   * Number of attached toaster hosts.
   *
   * @type {number}
   */
  private hosts: number = 0;

  /**
   * Property sequence
   *
   * @description
   * Counter used to generate unique identifiers within this service instance.
   *
   * @type {number}
   */
  private sequence: number = 0;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Clears outstanding timers when the service is destroyed.
   *
   * @constructor
   */
  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers.values()) if (timer.handle) clearTimeout(timer.handle);
      this.timers.clear();
    });
  }
  // #endregion

  // #region Methods
  /**
   * Method show
   *
   * @description
   * A neutral toast (« Lien copié »); returns its id.
   *
   * @param {string} title - Text displayed as the toast title.
   * @param {CwToastOptions} options - Optional content and behavior for the toast.
   * @returns {string} Identifier of the new toast.
   */
  public show(title: string, options: CwToastOptions = {}): string {
    return this.add('default', title, options);
  }

  /**
   * Method success
   *
   * @description
   * A successful action, often with `undo` (« Tâche déplacée vers Terminé »); returns its id.
   *
   * @param {string} title - Text displayed as the toast title.
   * @param {CwToastOptions} options - Optional content and behavior for the toast.
   * @returns {string} Identifier of the new toast.
   */
  public success(title: string, options: CwToastOptions = {}): string {
    return this.add('success', title, options);
  }

  /**
   * Method info
   *
   * @description
   * An information (« Synchronisation reprise »); returns its id.
   *
   * @param {string} title - Text displayed as the toast title.
   * @param {CwToastOptions} options - Optional content and behavior for the toast.
   * @returns {string} Identifier of the new toast.
   */
  public info(title: string, options: CwToastOptions = {}): string {
    return this.add('info', title, options);
  }

  /**
   * Method warning
   *
   * @description
   * A warning (« Connexion instable »); returns its id.
   *
   * @param {string} title - Text displayed as the toast title.
   * @param {CwToastOptions} options - Optional content and behavior for the toast.
   * @returns {string} Identifier of the new toast.
   */
  public warning(title: string, options: CwToastOptions = {}): string {
    return this.add('warning', title, options);
  }

  /**
   * Method error
   *
   * @description
   * A failure, `role="alert"`, kept until closed (« Impossible d'enregistrer »); returns its id.
   *
   * @param {string} title - Text displayed as the toast title.
   * @param {CwToastOptions} options - Optional content and behavior for the toast.
   * @returns {string} Identifier of the new toast.
   */
  public error(title: string, options: CwToastOptions = {}): string {
    return this.add('error', title, options);
  }

  /**
   * Method loading
   *
   * @description
   * A running operation with the spinner, kept until `update()` or `dismiss()`; returns its id.
   *
   * @param {string} title - Text displayed as the toast title.
   * @param {CwToastOptions} options - Optional content and behavior for the toast.
   * @returns {string} Identifier of the new toast.
   */
  public loading(title: string, options: CwToastOptions = {}): string {
    return this.add('loading', title, options);
  }

  /**
   * Method promise
   *
   * @description
   * Follows a promise in one toast: `loading` while it runs, then `success` or `error` in place (« Export de 120 tâches… » → « Export prêt »). Returns the toast's id.
   *
   * @param {Promise<T>} promise - Operation whose state is reflected in the toast.
   * @param {CwToastPromiseMessages<T>} messages - Titles for the pending, fulfilled and rejected states.
   * @returns {string} Identifier of the toast tracking the operation.
   */
  public promise<T>(promise: Promise<T>, messages: CwToastPromiseMessages<T>): string {
    const id: string = this.loading(messages.loading, { description: messages.description });
    promise.then(
      (value) => {
        const title: string =
          typeof messages.success === 'function' ? messages.success(value) : messages.success;
        this.update(id, { tone: 'success', title });
      },
      (reason: unknown) => {
        const title: string =
          typeof messages.error === 'function' ? messages.error(reason) : messages.error;
        this.update(id, { tone: 'error', title });
      },
    );
    return id;
  }

  /**
   * Method update
   *
   * @description
   * Replaces fields of a toast still shown; a new tone or duration restarts its timer.
   *
   * @param {string} id - Identifier of the toast to update.
   * @param {CwToastChanges} changes - Fields to replace on the toast.
   */
  public update(id: string, changes: CwToastChanges): void {
    const current: CwToast | undefined = this.list().find((toast) => toast.id === id);
    if (current?.state !== 'open') return;
    const next: CwToast = {
      ...current,
      ...(changes.title === undefined ? {} : { title: changes.title }),
      ...(changes.tone === undefined ? {} : { tone: changes.tone }),
      ...(changes.description === undefined ? {} : { description: changes.description }),
      ...(changes.duration === undefined ? {} : { duration: changes.duration }),
      ...(changes.closable === undefined ? {} : { closable: changes.closable }),
      ...(changes.action || changes.undo ? { action: actionOf(changes) } : {}),
    };
    this.list.update((toasts) => toasts.map((toast) => (toast.id === id ? next : toast)));
    if (changes.tone !== undefined || changes.duration !== undefined) {
      this.clearTimer(id);
      this.timers.set(id, { remaining: null, startedAt: 0, handle: null });
    }
    this.sync();
  }

  /**
   * Method dismiss
   *
   * @description
   * Closes one toast, or every toast without an id.
   *
   * @param {string} id - Identifier of the affected toast; omit it when dismissing all toasts.
   */
  public dismiss(id?: string): void {
    const ids: string[] = id === undefined ? this.list().map((toast) => toast.id) : [id];
    for (const each of ids) this.clearTimer(each);
    if (this.hosts === 0) {
      this.list.update((toasts) => toasts.filter((toast) => !ids.includes(toast.id)));
      return;
    }
    this.list.update((toasts) =>
      toasts.map((toast) =>
        ids.includes(toast.id) && toast.state === 'open' ? { ...toast, state: 'closed' } : toast,
      ),
    );
    this.sync();
  }

  /**
   * Method ɵconfigure
   *
   * @description
   * Used by `cw-toaster`: the durations per tone and how many toasts it shows. Not public API.
   *
   * @param {Readonly<Record<CwToastTone, number>>} durations - Default duration in milliseconds for each tone.
   * @param {number} visible - Maximum number of toasts whose timers can run.
   */
  public ɵconfigure(durations: Readonly<Record<CwToastTone, number>>, visible: number): void {
    this.durations = durations;
    this.visible = visible;
    this.sync();
  }

  /**
   * Method ɵpause
   *
   * @description
   * Used by `cw-toaster`: pauses or resumes every duration. Not public API.
   *
   * @param {boolean} paused - Whether countdowns should be paused.
   */
  public ɵpause(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    this.sync();
  }

  /**
   * Method ɵattach
   *
   * @description
   * Used by `cw-toaster`: registers a toaster; returns the function that unregisters it.
   * @returns {() => void} Callback that unregisters the host.
   */
  public ɵattach(): () => void {
    this.hosts += 1;
    return () => {
      this.hosts -= 1;
    };
  }

  /**
   * Method ɵremove
   *
   * @description
   * Used by `cw-toaster` once a toast's exit animation has ended. Not public API.
   *
   * @param {string} id - Identifier of the toast to remove.
   */
  public ɵremove(id: string): void {
    this.clearTimer(id);
    this.list.update((toasts) => toasts.filter((toast) => toast.id !== id));
    this.sync();
  }

  /**
   * Method add
   *
   * @description
   * Creates a toast, initializes its timer and synchronizes the visible stack.
   *
   * @param {CwToastTone} tone - Visual tone of the toast.
   * @param {string} title - Text displayed as the toast title.
   * @param {CwToastOptions} options - Optional content and behavior for the toast.
   * @returns {string} Identifier of the new toast.
   */
  private add(tone: CwToastTone, title: string, options: CwToastOptions): string {
    this.sequence += 1;
    const id: string = `cw-toast-${String(this.sequence)}`;
    const action: CwToast['action'] = actionOf(options);
    const toast: CwToast = {
      id,
      tone,
      title,
      closable: options.closable ?? false,
      state: 'open',
      ...(options.description === undefined ? {} : { description: options.description }),
      ...(options.duration === undefined ? {} : { duration: options.duration }),
      ...(action ? { action } : {}),
    };
    this.timers.set(id, { remaining: null, startedAt: 0, handle: null });
    this.list.update((toasts) => [...toasts, toast]);
    this.sync();
    return id;
  }

  /**
   * Method sync
   *
   * @description
   * Runs timers for visible toasts unless paused, retaining the remaining delay otherwise.
   */
  private sync(): void {
    const open: CwToast[] = this.list().filter((toast) => toast.state === 'open');
    const shown: Set<string> = new Set<string>(open.slice(-this.visible).map((toast) => toast.id));
    for (const toast of open) {
      const timer: Timer | undefined = this.timers.get(toast.id);
      if (!timer) continue;
      timer.remaining ??= toast.duration ?? this.durations[toast.tone];
      const run: boolean = !this.paused && shown.has(toast.id) && Number.isFinite(timer.remaining);
      if (run && !timer.handle) {
        timer.startedAt = Date.now();
        timer.handle = setTimeout(() => {
          this.dismiss(toast.id);
        }, timer.remaining);
      } else if (!run && timer.handle) {
        clearTimeout(timer.handle);
        timer.handle = null;
        timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
      }
    }
  }

  /**
   * Method clearTimer
   *
   * @description
   * Cancels and removes the timer associated with a toast.
   *
   * @param {string} id - Identifier of the toast whose timer is cleared.
   */
  private clearTimer(id: string): void {
    const timer: Timer | undefined = this.timers.get(id);
    if (timer?.handle) clearTimeout(timer.handle);
    this.timers.delete(id);
  }
  // #endregion
}

/**
 * Function actionOf
 *
 * @description
 * Selects the explicit action or builds one from the undo callback.
 *
 * @param {CwToastOptions} options - Optional content and behavior for the toast.
 * @returns {CwToast['action']} Selected action, or undefined when no action is provided.
 */
function actionOf(options: CwToastOptions): CwToast['action'] {
  if (options.action) return options.action;
  return options.undo ? { label: UNDO_LABEL, run: options.undo } : undefined;
}
