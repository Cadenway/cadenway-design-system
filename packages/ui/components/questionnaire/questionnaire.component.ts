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
} from '@angular/core';

import {
  QUESTIONNAIRE,
  QUESTIONNAIRE_QUESTION,
  type QuestionRef,
  type QuestionnaireRef,
} from './questionnaire.token';
import type { CwQuestionnaireAnswers, CwQuestionnaireShortcuts } from './questionnaire.types';

/**
 * A step-by-step form, one question per screen: request forms, assistant questions, first setup
 * (Questionnaire sheet of the Design System artifact; mockup `App.dc.html`, onboarding, and
 * `Organisations.dc.html`).
 *
 * Put it on a native `<form>`; project a `cw-questionnaire-progress`, the
 * `fieldset[cwQuestionnaireQuestion]`s, a `cw-questionnaire-actions` and a `cw-questionnaire-done`.
 * Only the question at `[(step)]` (0-based) shows; `stepChange` follows every move. « Suivant »
 * and Enter (outside a text area or a button) check the current question: a missing required answer
 * shows its error and focuses its first choice; otherwise the next question shows and its legend
 * takes the focus. On the last question, « Envoyer » (or a native submit) checks every required
 * question, emits `submitted` with the answers keyed by question name (« Autre » replaced by its
 * text), and sets `[(done)]`, which swaps the questions for the confirmation screen. With
 * `shortcuts="letters"`, the letter keys pick (single) or toggle (multiple) the matching choice of
 * the current question, outside text fields. The browser's own validation is off (`novalidate`).
 */
@Component({
  // A component on a native element (attribute selector), as its sheet requires: the element keeps
  // its native role, focus and form behavior. The lint rule only knows element selectors.
  // eslint-disable-next-line @angular-eslint/component-selector
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
  /** Index of the question shown; `[(step)]`. */
  readonly step = model(0);
  /** Whether the answers were sent: the confirmation screen shows; `[(done)]`. */
  readonly done = model(false);
  /** Letter shortcuts A, B, C… and their keys. */
  readonly shortcuts = input<CwQuestionnaireShortcuts>('letters');
  /** Name of the form, shown next to the progress (« Signaler un bug »). */
  readonly title = input('');

  /** Every required answer is there: the answers, keyed by question name. */
  readonly submitted = output<CwQuestionnaireAnswers>();

  private readonly injector = inject(Injector);
  private readonly questions = contentChildren(QUESTIONNAIRE_QUESTION, { descendants: true });

  /** Number of questions. */
  readonly count = computed(() => this.questions().length);
  /** Whether the question shown is the last one. */
  readonly isLast = computed(() => this.step() >= this.count() - 1);
  /** The question shown. */
  readonly current = computed<QuestionRef | undefined>(() => this.questions().at(this.step()));

  /** Index of a question of this questionnaire. */
  indexOf(question: QuestionRef): number {
    return this.questions().indexOf(question);
  }

  /** Whether the question at an index has an answer. */
  isAnswered(index: number): boolean {
    return this.questions().at(index)?.hasAnswer() === true;
  }

  /** Shows the previous question. */
  previous(): void {
    if (this.step() > 0) this.go(this.step() - 1);
  }

  /** Checks the current question, then shows the next one or sends the answers. */
  next(): void {
    const question = this.current();
    if (question && !question.validate()) return;
    if (this.isLast()) this.submit();
    else this.go(this.step() + 1);
  }

  /** Leaves an optional question unanswered and moves on. */
  skip(): void {
    if (this.current()?.required()) return;
    if (this.isLast()) this.submit();
    else this.go(this.step() + 1);
  }

  protected submitEvent(event: Event): void {
    // The questionnaire sends through `submitted`, never through a page load.
    event.preventDefault();
    if (!this.done()) this.next();
  }

  protected key(event: KeyboardEvent): void {
    if (this.done() || event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    const typing =
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

  private submit(): void {
    const questions = this.questions();
    const missing = questions.findIndex((question) => question.required() && !question.hasAnswer());
    if (missing >= 0) {
      this.step.set(missing);
      afterNextRender(() => questions[missing].validate(), { injector: this.injector });
      return;
    }
    const answers: CwQuestionnaireAnswers = {};
    questions.forEach((question, index) => {
      const answer = question.answer();
      if (answer !== null) answers[question.key(index)] = answer;
    });
    this.submitted.emit(answers);
    this.done.set(true);
  }

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
}
