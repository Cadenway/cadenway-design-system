/**
 * Type CwCodeBlockVariant
 *
 * @description
 * `default` for code, configuration and terminals; `destructive` for the log of a failed run.
 *
 * @type {'default' | 'destructive'}
 */
export type CwCodeBlockVariant = 'default' | 'destructive';

/**
 * Type CwCodeBlockSize
 *
 * @description
 * `default` 12/20 px; `sm` 11/18 px for terminals, logs and comments.
 *
 * @type {'default' | 'sm'}
 */
export type CwCodeBlockSize = 'default' | 'sm';

/**
 * Type CwCodeBlockLineKind
 *
 * @description
 * How a line is drawn: plain, put forward, added or removed (diff), or a comment.
 *
 * @type {'default' | 'highlighted' | 'added' | 'removed' | 'comment'}
 */
export type CwCodeBlockLineKind = 'default' | 'highlighted' | 'added' | 'removed' | 'comment';

/**
 * Interface CwCodeBlockLabels
 *
 * @description
 * Texts used by the code-block controls and their accessible descriptions.
 */
export interface CwCodeBlockLabels {
  // #region Properties
  /**
   * Property code
   *
   * @description
   * Fallback name of the code area.
   *
   * @type {string}
   * @readonly
   */
  readonly code: string;

  /**
   * Property lines
   *
   * @description
   * Formats the line count for the code area name.
   *
   * @type {(count: number) => string}
   * @readonly
   */
  readonly lines: (count: number) => string;

  /**
   * Property copyLabel
   *
   * @description
   * Accessible name of the copy button.
   *
   * @type {string}
   * @readonly
   */
  readonly copyLabel: string;

  /**
   * Property copiedLabel
   *
   * @description
   * Feedback after copying.
   *
   * @type {string}
   * @readonly
   */
  readonly copiedLabel: string;

  /**
   * Property addedLabel
   *
   * @description
   * Screen-reader description of an added line.
   *
   * @type {string}
   * @readonly
   */
  readonly addedLabel: string;

  /**
   * Property removedLabel
   *
   * @description
   * Screen-reader description of a removed line.
   *
   * @type {string}
   * @readonly
   */
  readonly removedLabel: string;
  // #endregion
}
