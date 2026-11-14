/**
 * Type CwInlineEditState
 *
 * @description
 * Reading, editing or saving state of an inline edit.
 *
 * @type {'reading' | 'editing' | 'saving'}
 */
export type CwInlineEditState = 'reading' | 'editing' | 'saving';

/**
 * Interface CwInlineEditLabels
 *
 * @description
 * French labels used by an inline edit.
 */
export interface CwInlineEditLabels {
  // #region Properties
  /**
   * Property editHint
   * @readonly
   *
   * @description
   * Hint describing how to edit.
   *
   * @type {string}
   */
  readonly editHint: string;

  /**
   * Property enterKey
   * @readonly
   *
   * @description
   * Name of the Enter key.
   *
   * @type {string}
   */
  readonly enterKey: string;

  /**
   * Property escapeKey
   * @readonly
   *
   * @description
   * Name of the Escape key.
   *
   * @type {string}
   */
  readonly escapeKey: string;

  /**
   * Property controlKey
   * @readonly
   *
   * @description
   * Name of the Control key.
   *
   * @type {string}
   */
  readonly controlKey: string;

  /**
   * Property submit
   * @readonly
   *
   * @description
   * Action described for the Enter key.
   *
   * @type {string}
   */
  readonly submit: string;

  /**
   * Property cancel
   * @readonly
   *
   * @description
   * Action described for the Escape key.
   *
   * @type {string}
   */
  readonly cancel: string;

  /**
   * Property submitMultiline
   * @readonly
   *
   * @description
   * Submit action in multiline mode.
   *
   * @type {string}
   */
  readonly submitMultiline: string;

  /**
   * Property cancelMultiline
   * @readonly
   *
   * @description
   * Cancel action in multiline mode.
   *
   * @type {string}
   */
  readonly cancelMultiline: string;

  /**
   * Property saving
   * @readonly
   *
   * @description
   * Text shown while saving.
   *
   * @type {string}
   */
  readonly saving: string;

  /**
   * Property saved
   * @readonly
   *
   * @description
   * Announcement after a successful save.
   *
   * @type {string}
   */
  readonly saved: string;

  /**
   * Property required
   * @readonly
   *
   * @description
   * Message for an empty required value.
   *
   * @type {string}
   */
  readonly required: string;

  /**
   * Property readonly
   * @readonly
   *
   * @description
   * Accessible label of the read-only indicator.
   *
   * @type {string}
   */
  readonly readonly: string;
  // #endregion
}
