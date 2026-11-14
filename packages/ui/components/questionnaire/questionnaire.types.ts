/**
 * Type CwQuestionnaireShortcuts
 *
 * @description
 * Letter shortcuts A, B, C… with their keys drawn on each choice, or none.
 *
 * @type {'letters' | 'none'}
 */
export type CwQuestionnaireShortcuts = 'letters' | 'none';

/**
 * Type CwQuestionType
 *
 * @description
 * One answer (`single`, radios) or several (`multiple`, checkboxes).
 *
 * @type {'single' | 'multiple'}
 */
export type CwQuestionType = 'single' | 'multiple';

/**
 * Type CwQuestionValue
 *
 * @description
 * The value of a question: a choice value, the values of the ticked choices, or nothing yet.
 *
 * @type {string | readonly string[] | null}
 */
export type CwQuestionValue = string | readonly string[] | null;

/**
 * Type CwQuestionnaireAnswers
 *
 * @description
 * The answers sent by `submitted`, keyed by question name; « Autre » carries its typed text.
 *
 * @type {Record<string, string | string[]>}
 */
export type CwQuestionnaireAnswers = Record<string, string | string[]>;

/**
 * Interface CwQuestionnaireSummaryItem
 *
 * @description
 * One line of the recap of the confirmation screen (« Type : Nouvelle fonctionnalité »).
 */
export interface CwQuestionnaireSummaryItem {
  // #region Properties
  /**
   * Property label
   *
   * @description
   * Question label displayed in the recap.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property value
   *
   * @description
   * Choice value or recap text.
   *
   * @type {string}
   * @readonly
   */
  readonly value: string;
  // #endregion
}
