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

/**
 * Interface CwQuestionnaireLabels
 *
 * @description
 * Default texts replaced for an application or subtree with `provideCwQuestionnaireLabels`.
 */
export interface CwQuestionnaireLabels {
  // #region Properties
  /**
   * Property previousLabel
   *
   * @description
   * Default text for the `previousLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly previousLabel: string;

  /**
   * Property skipLabel
   *
   * @description
   * Default text for the `skipLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly skipLabel: string;

  /**
   * Property nextLabel
   *
   * @description
   * Default text for the `nextLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly nextLabel: string;

  /**
   * Property submitLabel
   *
   * @description
   * Default text for the `submitLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly submitLabel: string;

  /**
   * Property otherPlaceholder
   *
   * @description
   * Default text for the `otherPlaceholder` input.
   *
   * @type {string}
   * @readonly
   */
  readonly otherPlaceholder: string;

  /**
   * Property otherLabel
   *
   * @description
   * Default text for the `otherLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly otherLabel: string;

  /**
   * Property title
   *
   * @description
   * Default text for the `title` input.
   *
   * @type {string}
   * @readonly
   */
  readonly title: string;

  /**
   * Property label
   *
   * @description
   * Default text for the `label` input.
   *
   * @type {string}
   * @readonly
   */
  readonly label: string;

  /**
   * Property ofLabel
   *
   * @description
   * Default text for the `ofLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly ofLabel: string;

  /**
   * Property ariaLabel
   *
   * @description
   * Default text for the `ariaLabel` input.
   *
   * @type {string}
   * @readonly
   */
  readonly ariaLabel: string;

  /**
   * Property errorText
   *
   * @description
   * Default text for the `errorText` input.
   *
   * @type {string}
   * @readonly
   */
  readonly errorText: string;
  // #endregion
}
