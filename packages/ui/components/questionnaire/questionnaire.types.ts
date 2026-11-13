/** Letter shortcuts A, B, C… with their keys drawn on each choice, or none. */
export type CwQuestionnaireShortcuts = 'letters' | 'none';

/** One answer (`single`, radios) or several (`multiple`, checkboxes). */
export type CwQuestionType = 'single' | 'multiple';

/** The value of a question: a choice value, the values of the ticked choices, or nothing yet. */
export type CwQuestionValue = string | readonly string[] | null;

/** The answers sent by `submitted`, keyed by question name; « Autre » carries its typed text. */
export type CwQuestionnaireAnswers = Record<string, string | string[]>;

/** One line of the recap of the confirmation screen (« Type : Nouvelle fonctionnalité »). */
export interface CwQuestionnaireSummaryItem {
  readonly label: string;
  readonly value: string;
}
