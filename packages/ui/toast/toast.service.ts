import { DestroyRef, inject, Service, signal } from '@angular/core';

import { CW_TOAST_DURATIONS } from './toast.constants';
import type {
  CwToast,
  CwToastChanges,
  CwToastOptions,
  CwToastPromiseMessages,
  CwToastTone,
} from './toast.types';

// Mockup App.dc.html: the action of an undoable change reads « Annuler ».
const UNDO_LABEL = 'Annuler';

interface Timer {
  /** Milliseconds left; null until the toast is first shown (the tone's duration then). */
  remaining: number | null;
  startedAt: number;
  handle: ReturnType<typeof setTimeout> | null;
}

/**
 * Shows passing notifications in the `cw-toaster` of the application: confirm an action and offer
 * to undo it, follow a long operation, report a transient error (Toast sheet of the Design System
 * artifact). Inject it anywhere; place one `cw-toaster` in the application template.
 *
 * Every method returns or takes the toast's id. A toast closes after its duration (6 s, see
 * `CW_TOAST_DURATIONS`; `error` and `loading` stay), its close button, Escape, a swipe or
 * `dismiss()`; running its action closes it too. Durations only run for the toasts the toaster
 * shows, and pause while the stack is unfolded (hover, focus, F8) or the window is inactive.
 * Without a toaster on the page, nothing is displayed and dismissed toasts leave at once.
 */
@Service()
export class CwToastService {
  private readonly list = signal<readonly CwToast[]>([]);
  /** The toasts, oldest first, including those playing their exit; read by `cw-toaster`. */
  readonly toasts = this.list.asReadonly();

  private readonly timers = new Map<string, Timer>();
  private durations: Readonly<Record<CwToastTone, number>> = CW_TOAST_DURATIONS;
  private visible = 3;
  private paused = false;
  private hosts = 0;
  private sequence = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers.values()) if (timer.handle) clearTimeout(timer.handle);
      this.timers.clear();
    });
  }

  /** A neutral toast (« Lien copié »); returns its id. */
  show(title: string, options: CwToastOptions = {}): string {
    return this.add('default', title, options);
  }

  /** A successful action, often with `undo` (« Tâche déplacée vers Terminé »); returns its id. */
  success(title: string, options: CwToastOptions = {}): string {
    return this.add('success', title, options);
  }

  /** An information (« Synchronisation reprise »); returns its id. */
  info(title: string, options: CwToastOptions = {}): string {
    return this.add('info', title, options);
  }

  /** A warning (« Connexion instable »); returns its id. */
  warning(title: string, options: CwToastOptions = {}): string {
    return this.add('warning', title, options);
  }

  /** A failure, `role="alert"`, kept until closed (« Impossible d'enregistrer »); returns its id. */
  error(title: string, options: CwToastOptions = {}): string {
    return this.add('error', title, options);
  }

  /** A running operation with the spinner, kept until `update()` or `dismiss()`; returns its id. */
  loading(title: string, options: CwToastOptions = {}): string {
    return this.add('loading', title, options);
  }

  /**
   * Follows a promise in one toast: `loading` while it runs, then `success` or `error` in place
   * (« Export de 120 tâches… » → « Export prêt »). Returns the toast's id.
   */
  promise<T>(promise: Promise<T>, messages: CwToastPromiseMessages<T>): string {
    const id = this.loading(messages.loading, { description: messages.description });
    promise.then(
      (value) => {
        const title =
          typeof messages.success === 'function' ? messages.success(value) : messages.success;
        this.update(id, { tone: 'success', title });
      },
      (reason: unknown) => {
        const title =
          typeof messages.error === 'function' ? messages.error(reason) : messages.error;
        this.update(id, { tone: 'error', title });
      },
    );
    return id;
  }

  /** Replaces fields of a toast still shown; a new tone or duration restarts its timer. */
  update(id: string, changes: CwToastChanges): void {
    const current = this.list().find((toast) => toast.id === id);
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

  /** Closes one toast, or every toast without an id. */
  dismiss(id?: string): void {
    const ids = id === undefined ? this.list().map((toast) => toast.id) : [id];
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

  /** Used by `cw-toaster`: the durations per tone and how many toasts it shows. Not public API. */
  ɵconfigure(durations: Readonly<Record<CwToastTone, number>>, visible: number): void {
    this.durations = durations;
    this.visible = visible;
    this.sync();
  }

  /** Used by `cw-toaster`: pauses or resumes every duration. Not public API. */
  ɵpause(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    this.sync();
  }

  /** Used by `cw-toaster`: registers a toaster; returns the function that unregisters it. */
  ɵattach(): () => void {
    this.hosts += 1;
    return () => {
      this.hosts -= 1;
    };
  }

  /** Used by `cw-toaster` once a toast's exit animation has ended. Not public API. */
  ɵremove(id: string): void {
    this.clearTimer(id);
    this.list.update((toasts) => toasts.filter((toast) => toast.id !== id));
    this.sync();
  }

  private add(tone: CwToastTone, title: string, options: CwToastOptions): string {
    this.sequence += 1;
    const id = `cw-toast-${String(this.sequence)}`;
    const action = actionOf(options);
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

  // Only the toasts the toaster shows (the newest `visible`) count down, and none while paused.
  private sync(): void {
    const open = this.list().filter((toast) => toast.state === 'open');
    const shown = new Set(open.slice(-this.visible).map((toast) => toast.id));
    for (const toast of open) {
      const timer = this.timers.get(toast.id);
      if (!timer) continue;
      timer.remaining ??= toast.duration ?? this.durations[toast.tone];
      const run = !this.paused && shown.has(toast.id) && Number.isFinite(timer.remaining);
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

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer?.handle) clearTimeout(timer.handle);
    this.timers.delete(id);
  }
}

function actionOf(options: CwToastOptions): CwToast['action'] {
  if (options.action) return options.action;
  return options.undo ? { label: UNDO_LABEL, run: options.undo } : undefined;
}
