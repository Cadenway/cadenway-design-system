/**
 * Type CwMessageVariant
 *
 * @description
 * Incoming, outgoing or system message layout in a thread.
 *
 * @type {'incoming' | 'outgoing' | 'system'}
 */
export type CwMessageVariant = 'incoming' | 'outgoing' | 'system';

/**
 * Type CwMessageTone
 *
 * @description
 * Tone of a system notice or a state note beneath a bubble.
 *
 * @type {'default' | 'info' | 'success' | 'warning' | 'error'}
 */
export type CwMessageTone = 'default' | 'info' | 'success' | 'warning' | 'error';

/**
 * Type CwMessageStatus
 *
 * @description
 * Sending state of an outgoing message; failed messages offer a retry action.
 *
 * @type {'sent' | 'sending' | 'failed'}
 */
export type CwMessageStatus = 'sent' | 'sending' | 'failed';

/**
 * Type CwMessageTimeFormatter
 *
 * @description
 * Formats a message or reply timestamp relative to the supplied reference time.
 *
 * @type {(time: Date, now: Date) => string}
 */
export type CwMessageTimeFormatter = (time: Date, now: Date) => string;

/**
 * Interface CwMessageLabels
 *
 * @description
 * French message labels that callers can override through the labels input.
 */
export interface CwMessageLabels {
  // #region Properties
  /**
   * Property edited
   * @readonly
   *
   * @description
   * Text after the time of an edited message.
   *
   * @type {string}
   */
  readonly edited: string;

  /**
   * Property sending
   * @readonly
   *
   * @description
   * Footer text while an outgoing message is being sent.
   *
   * @type {string}
   */
  readonly sending: string;

  /**
   * Property failed
   * @readonly
   *
   * @description
   * Note shown when sending a message fails.
   *
   * @type {string}
   */
  readonly failed: string;

  /**
   * Property retry
   * @readonly
   *
   * @description
   * Label of the retry button in a failed message note.
   *
   * @type {string}
   */
  readonly retry: string;

  /**
   * Property remove
   * @readonly
   *
   * @description
   * Label of the delete button in a failed message note.
   *
   * @type {string}
   */
  readonly remove: string;

  /**
   * Property actions
   * @readonly
   *
   * @description
   * Accessible name of the action bar.
   *
   * @type {string}
   */
  readonly actions: string;

  /**
   * Property react
   * @readonly
   *
   * @description
   * Accessible name of the reaction button.
   *
   * @type {string}
   */
  readonly react: string;

  /**
   * Property reply
   * @readonly
   *
   * @description
   * Accessible name of the reply button.
   *
   * @type {string}
   */
  readonly reply: string;

  /**
   * Property more
   * @readonly
   *
   * @description
   * Accessible name of the more-actions button.
   *
   * @type {string}
   */
  readonly more: string;

  /**
   * Property justNow
   * @readonly
   *
   * @description
   * Time text for a message less than a minute old.
   *
   * @type {string}
   */
  readonly justNow: string;
  // #endregion
}

/**
 * Interface CwMessageToneLabels
 *
 * @description
 * Tone words read before a notice or a note, in French by default.
 */
export interface CwMessageToneLabels {
  // #region Properties
  /**
   * Property info
   * @readonly
   *
   * @description
   * Word announcing an informational tone.
   *
   * @type {string}
   */
  readonly info: string;

  /**
   * Property success
   * @readonly
   *
   * @description
   * Word announcing a successful result.
   *
   * @type {string}
   */
  readonly success: string;

  /**
   * Property warning
   * @readonly
   *
   * @description
   * Word announcing a warning.
   *
   * @type {string}
   */
  readonly warning: string;

  /**
   * Property error
   * @readonly
   *
   * @description
   * Word announcing an error.
   *
   * @type {string}
   */
  readonly error: string;
  // #endregion
}

/**
 * Interface CwMessageThreadLabels
 *
 * @description
 * French thread summary labels that callers can override through the labels input.
 */
export interface CwMessageThreadLabels {
  // #region Properties
  /**
   * Property reply
   * @readonly
   *
   * @description
   * Singular word following a count of one reply.
   *
   * @type {string}
   */
  readonly reply: string;

  /**
   * Property replies
   * @readonly
   *
   * @description
   * Plural word following any other reply count.
   *
   * @type {string}
   */
  readonly replies: string;

  /**
   * Property last
   * @readonly
   *
   * @description
   * Text preceding the time of the last reply.
   *
   * @type {string}
   */
  readonly last: string;

  /**
   * Property at
   * @readonly
   *
   * @description
   * Connector between the last-reply label and a time of today.
   *
   * @type {string}
   */
  readonly at: string;

  /**
   * Property justNow
   * @readonly
   *
   * @description
   * Time text for a reply less than a minute old.
   *
   * @type {string}
   */
  readonly justNow: string;
  // #endregion
}
