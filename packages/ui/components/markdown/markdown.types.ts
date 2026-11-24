/**
 * Interface CwMarkdownLabels
 *
 * @description
 * Text defaults replaceable for an application or subtree with `provideCwMarkdownLabels`.
 */
export interface CwMarkdownLabels {
  // #region Properties
  /**
   * Property mention
   *
   * @description
   * Accessible prefix read before a mention.
   *
   * @type {string}
   * @readonly
   */
  readonly mention: string;
  // #endregion
}
