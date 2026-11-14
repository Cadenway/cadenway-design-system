import {
  Component,
  Injector,
  afterNextRender,
  computed,
  contentChildren,
  inject,
  input,
  model,
  output,
  type InputSignal,
  type ModelSignal,
  type OutputEmitterRef,
  type Signal,
} from '@angular/core';

import {
  QUESTIONNAIRE,
  QUESTIONNAIRE_QUESTION,
  type QuestionRef,
  type QuestionnaireRef,
} from './questionnaire.token';
import type { CwQuestionnaireAnswers, CwQuestionnaireShortcuts } from './questionnaire.types';

/**
 * Component CwQuestionnaire
 *
 * @description
 * A step-by-step form, one question per screen: request forms, assistant questions, first setup (Questionnaire sheet of the Design System artifact; mockup `App.dc.html`, onboarding, and `Organisations.dc.html`). Put it on a native `<form>`; project a `cw-questionnaire-progress`, the `fieldset[cwQuestionnaireQuestion]`s, a `cw-questionnaire-actions` and a `cw-questionnaire-done`. Only the question at `[(step)]` (0-based) shows; `stepChange` follows every move. « Suivant » and Enter (outside a text area or a button) check the current question: a missing required answer shows its error and focuses its first choice; otherwise the next question shows and its legend takes the focus. On the last question, « Envoyer » (or a native submit) checks every required question, emits `submitted` with the answers keyed by question name (« Autre » replaced by its text), and sets `[(done)]`, which swaps the questions for the confirmation screen. With `shortcuts="letters"`, the letter keys pick (single) or toggle (multiple) the matching choice of the current question, outside text fields. The browser's own validation is off (`novalidate`).
 */
@Component({
  selector: 'form[cwQuestionnaire]',
  providers: [{ provide: QUESTIONNAIRE, useExisting: CwQuestionnaire }],
  host: {
    class: 'flex min-w-0 flex-col gap-4',
    novalidate: '',
    '[attr.data-done]': 'done() ? "" : null',
    '(submit)': 'submitEvent($event)',
    '(keydown)': 'key($event)',
  },
  templateUrl: './questionnaire.component.html',
})
export class CwQuestionnaire implements QuestionnaireRef {
  // #region Properties
  /**
   * Property step
   *
   * @description
   * Index of the question shown; `[(step)]`.
   *
   * @type {ModelSignal<number>}
   * @readonly
   */
  public readonly step: ModelSignal<number> = model(0);

  /**
   * Property done
   *
   * @description
   * Whether the answers were sent: the confirmation screen shows; `[(done)]`.
   *
   * @type {ModelSignal<boolean>}
   * @readonly
   */
  public readonly done: ModelSignal<boolean> = model(false);

  /**
   * Property shortcuts
   *
   * @description
   * Letter shortcuts A, B, C… and their keys.
   *
   * @type {InputSignal<CwQuestionnaireShortcuts>}
   * @readonly
   */
  public readonly shortcuts: InputSignal<CwQuestionnaireShortcuts> =
    input<CwQuestionnaireShortcuts>('letters');

  /**
   * Property title
   *
   * @description
   * Name of the form, shown next to the progress (« Signaler un bug »).
   *
   * @type {InputSignal<string>}
   * @readonly
   */
  public readonly title: InputSignal<string> = input('');

  /**
   * Property submitted
   *
   * @description
   * Every required answer is there: the answers, keyed by question name.
   *
   * @type {OutputEmitterRef<CwQuestionnaireAnswers>}
   * @readonly
   */
  public readonly submitted: OutputEmitterRef<CwQuestionnaireAnswers> =
    output<CwQuestionnaireAnswers>();

  /**
   * Property injector
   *
   * @description
   * Injector used for work scheduled after rendering.
   *
   * @type {Injector}
   * @readonly
   */
  private readonly injector: Injector = inject(Injector);

  /**
   * Property questions
   *
   * @description
   * Questions belonging to the questionnaire.
   *
   * @type {Signal<readonly QuestionRef[]>}
   * @readonly
   */
  private readonly questions: Signal<readonly QuestionRef[]> = contentChildren(
    QUESTIONNAIRE_QUESTION,
    { descendants: true },
  );

  /**
   * Property count
   *
   * @description
   * Number of questions.
   *
   * @type {Signal<number>}
   * @readonly
   */
  public readonly count: Signal<number> = computed(() => this.questions().length);

  /**
   * Property isLast
   *
   * @description
   * Whether the question shown is the last one.
   *
   * @type {Signal<boolean>}
   * @readonly
   */
  public readonly isLast: Signal<boolean> = computed(() => this.step() >= this.count() - 1);

  /**
   * Property current
   *
   * @description
   * The question shown.
   *
   * @type {Signal<QuestionRef | undefined>}
   * @readonly
   */
  public readonly current: Signal<QuestionRef | undefined> = computed<QuestionRef | undefined>(() =>
    this.questions().at(this.step()),
  );
  // #endregion

  // #region Methods
  /**
   * Method indexOf
   *
   * @description
   * Index of a question of this questionnaire.
   *
   * @param {QuestionRef} question - Question whose index is requested.
   * @returns {number} Index of the question, or minus one when absent.
   */
  public indexOf(question: QuestionRef): number {
    return this.questions().indexOf(question);
  }

  /**
   * Method isAnswered
   *
   * @description
   * Whether the question at an index has an answer.
   *
   * @param {number} index - Question index in the questionnaire.
   * @returns {boolean} Whether the indexed question has an answer.
   */
  public isAnswered(index: number): boolean {
    return this.questions().at(index)?.hasAnswer() === true;
  }

  /**
   * Method previous
   *
   * @description
   * Shows the previous question.
   */
  public previous(): void {
    if (this.step() > 0) this.go(this.step() - 1);
  }

  /**
   * Method next
   *
   * @description
   * Checks the current question, then shows the next one or sends the answers.
   */
  public next(): void {
    const question: QuestionRef | undefined = this.current();
    if (question && !question.validate()) return;
    if (this.isLast()) this.submit();
    else this.go(this.step() + 1);
  }

  /**
   * Method skip
   *
   * @description
   * Leaves an optional question unanswered and moves on.
   */
  public skip(): void {
    if (this.current()?.required()) return;
    if (this.isLast()) this.submit();
    else this.go(this.step() + 1);
  }

  /**
   * Method submitEvent
   *
   * @description
   * Handles a form submission event.
   *
   * @param {Event} event - Browser event associated with the interaction.
   */
  protected submitEvent(event: Event): void {
    // The questionnaire sends through `submitted`, never through a page load.
    event.preventDefault();
    if (!this.done()) this.next();
  }

  /**
   * Method key
   *
   * @description
   * Handles questionnaire keyboard navigation.
   *
   * @param {KeyboardEvent} event - Browser event associated with the interaction.
   */
  protected key(event: KeyboardEvent): void {
    if (this.done() || event.defaultPrevented) return;
    const target: HTMLElement = event.target as HTMLElement;
    const typing: boolean =
      target.isContentEditable ||
      target.tagName === 'TEXTAREA' ||
      (target.tagName === 'INPUT' &&
        !['radio', 'checkbox'].includes((target as HTMLInputElement).type));
    if (event.key === 'Enter') {
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.tagName === 'A') {
        return;
      }
      event.preventDefault();
      this.next();
      return;
    }
    if (
      this.shortcuts() === 'letters' &&
      !typing &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      this.current()?.pressLetter(event.key)
    ) {
      event.preventDefault();
    }
  }

  /**
   * Method submit
   *
   * @description
   * Collects answers and emits the completed questionnaire.
   */
  private submit(): void {
    const questions: readonly QuestionRef[] = this.questions();
    const missing: number = questions.findIndex(
      (question) => question.required() && !question.hasAnswer(),
    );
    if (missing >= 0) {
      this.step.set(missing);
      afterNextRender(() => questions[missing].validate(), { injector: this.injector });
      return;
    }
    const answers: CwQuestionnaireAnswers = {};
    questions.forEach((question, index) => {
      const answer: string | string[] | null = question.answer();
      if (answer !== null) answers[question.key(index)] = answer;
    });
    this.submitted.emit(answers);
    this.done.set(true);
  }

  /**
   * Method go
   *
   * @description
   * Moves to the requested question and updates focus.
   *
   * @param {number} step - Index of the question to show.
   */
  private go(step: number): void {
    this.step.set(step);
    // Questionnaire sheet, "Accessibilité": on each question the focus goes to its legend.
    afterNextRender(
      () => {
        this.current()?.focusTitle();
      },
      { injector: this.injector },
    );
  }
  // #endregion
}
