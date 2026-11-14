import { InjectionToken, type Signal } from '@angular/core';

import type { CwQuestionType, CwQuestionnaireShortcuts } from './questionnaire.types';

/**
 * Interface ChoiceRef
 *
 * @description
 * A choice, as its question sees it. Not exported from the entry point.
 */
export interface ChoiceRef {
  // #region Properties
  /**
   * Property value
   *
   * @description
   * Choice value or recap text.
   *
   * @type {Signal<string>}
   * @readonly
   */
  readonly value: Signal<string>;

  /**
   * Property isDisabled
   *
   * @description
   * Whether the question or choice is disabled.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly isDisabled: Signal<boolean>;

  /**
   * Property other
   *
   * @description
   * Whether the choice collects free-form text.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly other: Signal<boolean>;

  /**
   * Property otherText
   *
   * @description
   * Text entered for an other choice.
   *
   * @type {Signal<string>}
   * @readonly
   */
  readonly otherText: Signal<string>;
  // #endregion
  // #region Methods
  /**
   * Method focus
   *
   * @description
   * Focuses the choice control.
   */
  focus(): void;
  // #endregion
}

/**
 * Constant QUESTIONNAIRE_CHOICE
 *
 * @description
 * Each choice provides itself under this token. Not exported from the entry point.
 *
 * @type {InjectionToken<ChoiceRef>}
 */
export const QUESTIONNAIRE_CHOICE: InjectionToken<ChoiceRef> = new InjectionToken<ChoiceRef>(
  'QUESTIONNAIRE_CHOICE',
);

/**
 * Interface QuestionRef
 *
 * @description
 * A question, as its questionnaire and its choices see it. Not exported from the entry point.
 */
export interface QuestionRef {
  // #region Properties
  /**
   * Property type
   *
   * @description
   * Selection mode of the question.
   *
   * @type {Signal<CwQuestionType>}
   * @readonly
   */
  readonly type: Signal<CwQuestionType>;

  /**
   * Property required
   *
   * @description
   * Whether an answer is required.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly required: Signal<boolean>;

  /**
   * Property hasAnswer
   *
   * @description
   * Whether the question has an answer.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly hasAnswer: Signal<boolean>;

  /**
   * Property groupName
   *
   * @description
   * Name shared by the question choice controls.
   *
   * @type {string}
   * @readonly
   */
  readonly groupName: string;

  /**
   * Property errorId
   *
   * @description
   * Identifier of the validation message.
   *
   * @type {string}
   * @readonly
   */
  readonly errorId: string;

  /**
   * Property errorVisible
   *
   * @description
   * Whether the validation message is visible.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly errorVisible: Signal<boolean>;

  /**
   * Property isDisabled
   *
   * @description
   * Whether the question or choice is disabled.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly isDisabled: Signal<boolean>;
  // #endregion
  // #region Methods
  /**
   * Method letterOf
   *
   * @description
   * Letter of a choice (« A »), or empty without shortcuts.
   *
   * @param {ChoiceRef} choice - Choice associated with the operation.
   * @returns {string} Choice shortcut letter, or an empty string when shortcuts are disabled.
   */
  letterOf(choice: ChoiceRef): string;

  /**
   * Method isChecked
   *
   * @description
   * Checks whether the supplied choice is selected.
   *
   * @param {ChoiceRef} choice - Choice associated with the operation.
   * @returns {boolean} Whether the choice is selected.
   */
  isChecked(choice: ChoiceRef): boolean;

  /**
   * Method toggle
   *
   * @description
   * Updates the selected state of a choice.
   *
   * @param {ChoiceRef} choice - Choice associated with the operation.
   * @param {boolean} checked - New checked state for the choice.
   */
  toggle(choice: ChoiceRef, checked: boolean): void;

  /**
   * Method markTouched
   *
   * @description
   * Marks the question as touched.
   */
  markTouched(): void;

  /**
   * Method key
   *
   * @description
   * Key of the question in the answers.
   *
   * @param {number} index - Question index in the questionnaire.
   * @returns {string} Question key used in the answers.
   */
  key(index: number): string;

  /**
   * Method answer
   *
   * @description
   * The answer, « Autre » replaced by its text; `null` when unanswered.
   * @returns {string | string[] | null} Answer value, or null when unanswered.
   */
  answer(): string | string[] | null;

  /**
   * Method validate
   *
   * @description
   * Shows the error and focuses the first choice when a required answer is missing.
   * @returns {boolean} Whether the required answer is valid.
   */
  validate(): boolean;

  /**
   * Method pressLetter
   *
   * @description
   * Picks or toggles the choice of a letter key; returns whether it did.
   *
   * @param {string} key - Letter key used to select a choice.
   * @returns {boolean} Whether the letter selected or toggled a choice.
   */
  pressLetter(key: string): boolean;

  /**
   * Method focusTitle
   *
   * @description
   * Focuses the question title.
   */
  focusTitle(): void;
  // #endregion
}

/**
 * Constant QUESTIONNAIRE_QUESTION
 *
 * @description
 * Each question provides itself under this token. Not exported from the entry point.
 *
 * @type {InjectionToken<QuestionRef>}
 */
export const QUESTIONNAIRE_QUESTION: InjectionToken<QuestionRef> = new InjectionToken<QuestionRef>(
  'QUESTIONNAIRE_QUESTION',
);

/**
 * Interface QuestionnaireRef
 *
 * @description
 * The questionnaire, as its parts see it. Not exported from the entry point.
 */
export interface QuestionnaireRef {
  // #region Properties
  /**
   * Property shortcuts
   *
   * @description
   * Keyboard shortcut mode for choices.
   *
   * @type {Signal<CwQuestionnaireShortcuts>}
   * @readonly
   */
  readonly shortcuts: Signal<CwQuestionnaireShortcuts>;

  /**
   * Property step
   *
   * @description
   * Index of the current questionnaire step.
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly step: Signal<number>;

  /**
   * Property done
   *
   * @description
   * Whether the questionnaire has reached its confirmation screen.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly done: Signal<boolean>;

  /**
   * Property title
   *
   * @description
   * Questionnaire title.
   *
   * @type {Signal<string>}
   * @readonly
   */
  readonly title: Signal<string>;

  /**
   * Property count
   *
   * @description
   * Number of questions.
   *
   * @type {Signal<number>}
   * @readonly
   */
  readonly count: Signal<number>;

  /**
   * Property isLast
   *
   * @description
   * Whether the current question is the last one.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  readonly isLast: Signal<boolean>;

  /**
   * Property current
   *
   * @description
   * Current question, or undefined when absent.
   *
   * @type {Signal<QuestionRef | undefined>}
   * @readonly
   */
  readonly current: Signal<QuestionRef | undefined>;
  // #endregion
  // #region Methods
  /**
   * Method indexOf
   *
   * @description
   * Finds the index of a question.
   *
   * @param {QuestionRef} question - Question whose index is requested.
   * @returns {number} Index of the question, or minus one when absent.
   */
  indexOf(question: QuestionRef): number;

  /**
   * Method isAnswered
   *
   * @description
   * Checks whether the indexed question has an answer.
   *
   * @param {number} index - Question index in the questionnaire.
   * @returns {boolean} Whether the indexed question has an answer.
   */
  isAnswered(index: number): boolean;

  /**
   * Method previous
   *
   * @description
   * Moves to the previous question.
   */
  previous(): void;

  /**
   * Method next
   *
   * @description
   * Moves to the next question or submits the questionnaire.
   */
  next(): void;

  /**
   * Method skip
   *
   * @description
   * Skips the current question.
   */
  skip(): void;
  // #endregion
}

/**
 * Constant QUESTIONNAIRE
 *
 * @description
 * The questionnaire provides itself under this token. Not exported from the entry point.
 *
 * @type {InjectionToken<QuestionnaireRef>}
 */
export const QUESTIONNAIRE: InjectionToken<QuestionnaireRef> = new InjectionToken<QuestionnaireRef>(
  'QUESTIONNAIRE',
);
