import { InjectionToken, type Signal } from '@angular/core';

import type { CwQuestionType, CwQuestionnaireShortcuts } from './questionnaire.types';

/** A choice, as its question sees it. Not exported from the entry point. */
export interface ChoiceRef {
  readonly value: Signal<string>;
  readonly isDisabled: Signal<boolean>;
  readonly other: Signal<boolean>;
  readonly otherText: Signal<string>;
  focus(): void;
}

/** Each choice provides itself under this token. Not exported from the entry point. */
export const QUESTIONNAIRE_CHOICE = new InjectionToken<ChoiceRef>('QUESTIONNAIRE_CHOICE');

/** A question, as its questionnaire and its choices see it. Not exported from the entry point. */
export interface QuestionRef {
  readonly type: Signal<CwQuestionType>;
  readonly required: Signal<boolean>;
  readonly hasAnswer: Signal<boolean>;
  readonly groupName: string;
  readonly errorId: string;
  readonly errorVisible: Signal<boolean>;
  readonly isDisabled: Signal<boolean>;
  /** Letter of a choice (« A »), or empty without shortcuts. */
  letterOf(choice: ChoiceRef): string;
  isChecked(choice: ChoiceRef): boolean;
  toggle(choice: ChoiceRef, checked: boolean): void;
  markTouched(): void;
  /** Key of the question in the answers. */
  key(index: number): string;
  /** The answer, « Autre » replaced by its text; `null` when unanswered. */
  answer(): string | string[] | null;
  /** Shows the error and focuses the first choice when a required answer is missing. */
  validate(): boolean;
  /** Picks or toggles the choice of a letter key; returns whether it did. */
  pressLetter(key: string): boolean;
  focusTitle(): void;
}

/** Each question provides itself under this token. Not exported from the entry point. */
export const QUESTIONNAIRE_QUESTION = new InjectionToken<QuestionRef>('QUESTIONNAIRE_QUESTION');

/** The questionnaire, as its parts see it. Not exported from the entry point. */
export interface QuestionnaireRef {
  readonly shortcuts: Signal<CwQuestionnaireShortcuts>;
  readonly step: Signal<number>;
  readonly done: Signal<boolean>;
  readonly title: Signal<string>;
  readonly count: Signal<number>;
  readonly isLast: Signal<boolean>;
  readonly current: Signal<QuestionRef | undefined>;
  indexOf(question: QuestionRef): number;
  isAnswered(index: number): boolean;
  previous(): void;
  next(): void;
  skip(): void;
}

/** The questionnaire provides itself under this token. Not exported from the entry point. */
export const QUESTIONNAIRE = new InjectionToken<QuestionnaireRef>('QUESTIONNAIRE');
