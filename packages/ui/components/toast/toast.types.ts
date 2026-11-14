/**
 * Type CwToastTone
 *
 * @description
 * Selects its icon and default duration; loading uses a spinner and stays until updated.
 * @type {'default' | 'success' | 'info' | 'warning' | 'error' | 'loading'}
 */
export type CwToastTone = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

/**
 * Type CwToastPosition
 *
 * @description
 * A stack at the top opens downwards.
 * @type {'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'}
 */
export type CwToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * Interface CwToastAction
 *
 * @description
 * Running the action closes the toast.
 */
export interface CwToastAction {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Names the operation available to the user.
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property run
   *
   * @description
   * Invoked when the user selects the action button.
   * @type {() => void}
   * @readonly
   */
  readonly run: () => void;
  // #endregion
}

/**
 * Interface CwToastOptions
 *
 * @description
 * Defines optional content, action, duration and close button.
 */
export interface CwToastOptions {
  // #region Properties
  /**
   * Property description
   *
   * @description
   * Displayed on one truncated line beneath the title.
   * @type {string | undefined}
   * @readonly
   */
  readonly description?: string;

  /**
   * Property action
   *
   * @description
   * Takes precedence over the undo shorthand when both are supplied.
   * @type {CwToastAction | undefined}
   * @readonly
   */
  readonly action?: CwToastAction;

  /**
   * Property undo
   *
   * @description
   * Creates an action labelled « Annuler » unless an explicit action is supplied.
   * @type {(() => void) | undefined}
   * @readonly
   */
  readonly undo?: () => void;

  /**
   * Property duration
   *
   * @description
   * Expressed in milliseconds; Infinity keeps the toast open. Defaults to the tone duration.
   * @type {number | undefined}
   * @readonly
   */
  readonly duration?: number;

  /**
   * Property closable
   *
   * @description
   * Adds a close button independently of the toaster-wide setting.
   * @type {boolean | undefined}
   * @readonly
   */
  readonly closable?: boolean;
  // #endregion
}

/**
 * Interface CwToastChanges
 *
 * @description
 * A new tone or duration restarts its timer.
 */
export interface CwToastChanges extends CwToastOptions {
  // #region Properties
  /**
   * Property title
   *
   * @description
   * Leaves the existing title unchanged when omitted.
   * @type {string | undefined}
   * @readonly
   */
  readonly title?: string;

  /**
   * Property tone
   *
   * @description
   * Leaves the existing tone unchanged when omitted.
   * @type {CwToastTone | undefined}
   * @readonly
   */
  readonly tone?: CwToastTone;
  // #endregion
}

/**
 * Interface CwToastPromiseMessages
 *
 * @description
 * Completion titles can derive their text from the resolved value or rejection reason.
 */
export interface CwToastPromiseMessages<T> {
  // #region Properties
  /**
   * Property loading
   *
   * @description
   * Shown with the loading tone until the promise settles.
   * @type {string}
   * @readonly
   */
  readonly loading: string;

  /**
   * Property success
   *
   * @description
   * A callback receives the resolved value.
   * @type {string | ((value: T) => string)}
   * @readonly
   */
  readonly success: string | ((value: T) => string);

  /**
   * Property error
   *
   * @description
   * A callback receives the rejection reason.
   * @type {string | ((reason: unknown) => string)}
   * @readonly
   */
  readonly error: string | ((reason: unknown) => string);

  /**
   * Property description
   *
   * @description
   * Applies to the toast while it follows the promise.
   * @type {string | undefined}
   * @readonly
   */
  readonly description?: string;
  // #endregion
}

/**
 * Type CwToastDurations
 *
 * @description
 * Values are milliseconds; Infinity keeps the corresponding toast open.
 * @type {Partial<Record<CwToastTone, number>>}
 */
export type CwToastDurations = Partial<Record<CwToastTone, number>>;

/**
 * Interface CwToast
 *
 * @description
 * The service replaces the read-only record whenever its content changes.
 */
export interface CwToast {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Used to update or dismiss this record.
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property tone
   *
   * @description
   * Determines its icon and default duration.
   * @type {CwToastTone}
   * @readonly
   */
  readonly tone: CwToastTone;

  /**
   * Property title
   *
   * @description
   * Displayed as the primary notification text.
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property description
   *
   * @description
   * Displayed beneath the title when supplied.
   * @type {string | undefined}
   * @readonly
   */
  readonly description?: string;

  /**
   * Property action
   *
   * @description
   * Provides the label and callback for the action button.
   * @type {CwToastAction | undefined}
   * @readonly
   */
  readonly action?: CwToastAction;

  /**
   * Property duration
   *
   * @description
   * Expressed in milliseconds; Infinity disables automatic closing.
   * @type {number | undefined}
   * @readonly
   */
  readonly duration?: number;

  /**
   * Property closable
   *
   * @description
   * The toaster can also enable close buttons for all toasts.
   * @type {boolean}
   * @readonly
   */
  readonly closable: boolean;

  /**
   * Property state
   *
   * @description
   * Closed toasts remain in the list until their exit animation finishes.
   * @type {'open' | 'closed'}
   * @readonly
   */
  readonly state: 'open' | 'closed';
  // #endregion
}
