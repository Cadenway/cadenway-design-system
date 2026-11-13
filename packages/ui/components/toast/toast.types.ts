/**
 * Tone of a toast, shared with Message, Banner and Alert: it picks the filled icon and the default
 * duration, never a colored background. `loading` shows the spinner and waits for `update()` or
 * `promise()`.
 */
export type CwToastTone = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

/** Corner or edge of the screen that holds the toasts; at the top the stack opens downwards. */
export type CwToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** The one action of a toast (« Annuler », « Ouvrir », « Réessayer »); running it closes the toast. */
export interface CwToastAction {
  readonly label: string;
  readonly run: () => void;
}

/** What a toast shows besides its title. */
export interface CwToastOptions {
  /** One line, truncated: the object concerned (« CAD-466 · Doc d'installation Docker »). */
  readonly description?: string;
  /** The one action; takes precedence over `undo`. */
  readonly action?: CwToastAction;
  /** Shorthand for an action labelled « Annuler » that runs this function. */
  readonly undo?: () => void;
  /** Milliseconds before it closes; `Infinity` keeps it until closed. Defaults to the tone's. */
  readonly duration?: number;
  /** Adds the close button to this toast (`cw-toaster`'s `closeButton` adds it to all). */
  readonly closable?: boolean;
}

/** The fields `update()` replaces on a toast already shown; a new tone restarts its duration. */
export interface CwToastChanges extends CwToastOptions {
  readonly title?: string;
  readonly tone?: CwToastTone;
}

/** The three titles of `promise()`: while running, on success and on failure. */
export interface CwToastPromiseMessages<T> {
  readonly loading: string;
  readonly success: string | ((value: T) => string);
  readonly error: string | ((reason: unknown) => string);
  readonly description?: string;
}

/** Duration in milliseconds per tone; `Infinity` keeps the toast until closed. */
export type CwToastDurations = Partial<Record<CwToastTone, number>>;

/** A toast as `CwToastService` holds it: read-only, replaced on every change. */
export interface CwToast {
  readonly id: string;
  readonly tone: CwToastTone;
  readonly title: string;
  readonly description?: string;
  readonly action?: CwToastAction;
  readonly duration?: number;
  readonly closable: boolean;
  /** `closed` while its exit animation plays, before it leaves the list. */
  readonly state: 'open' | 'closed';
}
