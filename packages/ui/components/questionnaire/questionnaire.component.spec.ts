import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwQuestionnaire } from './questionnaire.component';
import { CwQuestionnaireActions } from './questionnaire-actions/questionnaire-actions.component';
import { CwQuestionnaireChoice } from './questionnaire-choice/questionnaire-choice.component';
import { CwQuestionnaireDone } from './questionnaire-done/questionnaire-done.component';
import { CwQuestionnaireProgress } from './questionnaire-progress/questionnaire-progress.component';
import { CwQuestionnaireQuestion } from './questionnaire-question/questionnaire-question.component';
import { CwQuestionnaireTitle } from './questionnaire-title/questionnaire-title.directive';
import type { CwQuestionnaireAnswers } from './questionnaire.types';

/**
 * Function present
 *
 * @description
 * Requires a fixture value and throws when it is absent.
 *
 * @param {T | null | undefined} value - Optional fixture value to require.
 * @returns {T} The value when present.
 */
function present<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Missing element');
  return value;
}

/**
 * Constant PARTS
 *
 * @description
 * Questionnaire components used by the complete form fixture.
 *
 * @type {typeof PARTS}
 */
const PARTS: (
  | typeof CwQuestionnaire
  | typeof CwQuestionnaireActions
  | typeof CwQuestionnaireChoice
  | typeof CwQuestionnaireDone
  | typeof CwQuestionnaireProgress
  | typeof CwQuestionnaireQuestion
  | typeof CwQuestionnaireTitle
)[] = [
  CwQuestionnaire,
  CwQuestionnaireActions,
  CwQuestionnaireChoice,
  CwQuestionnaireDone,
  CwQuestionnaireProgress,
  CwQuestionnaireQuestion,
  CwQuestionnaireTitle,
];

/**
 * Constant QUESTION_PARTS
 *
 * @description
 * Question and choice components used by form-control fixtures.
 *
 * @type {typeof QUESTION_PARTS}
 */
const QUESTION_PARTS: (
  typeof CwQuestionnaireChoice | typeof CwQuestionnaireQuestion | typeof CwQuestionnaireTitle
)[] = [CwQuestionnaireChoice, CwQuestionnaireQuestion, CwQuestionnaireTitle];

/**
 * Component Host
 *
 * @description
 * Hosts the questionnaire and captures its answers.
 */
@Component({
  imports: PARTS,
  template: `
    <form cwQuestionnaire title="Signaler un bug" [(step)]="step" (submitted)="answers.set($event)">
      <cw-questionnaire-progress />
      <fieldset cwQuestionnaireQuestion name="type" required>
        <legend cwQuestionnaireTitle>Quel type de demande ?</legend>
        <label cwQuestionnaireChoice value="bug">Bug</label>
        <label cwQuestionnaireChoice value="feature">Nouvelle fonctionnalité</label>
        <label cwQuestionnaireChoice value="access" disabled>Demande d'accès</label>
      </fieldset>
      <fieldset cwQuestionnaireQuestion name="views" type="multiple">
        <legend cwQuestionnaireTitle>Quelles vues sont concernées ?</legend>
        <label cwQuestionnaireChoice value="list">Liste</label>
        <label cwQuestionnaireChoice value="calendar">Calendrier</label>
        <label cwQuestionnaireChoice value="other" other [(otherText)]="otherView">Autre</label>
      </fieldset>
      <cw-questionnaire-actions />
      <cw-questionnaire-done>Elle devient une tâche.</cw-questionnaire-done>
    </form>
  `,
})
class Host {
  // #region Properties
  /**
   * Property step
   *
   * @description
   * Current questionnaire step controlled by the fixture.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly step: WritableSignal<number> = signal(0);

  /**
   * Property otherView
   *
   * @description
   * Free-form text for the other choice.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly otherView: WritableSignal<string> = signal('');

  /**
   * Property answers
   *
   * @description
   * Submitted answers captured by the fixture.
   *
   * @type {WritableSignal<CwQuestionnaireAnswers | null>}
   * @readonly
   */
  public readonly answers: WritableSignal<CwQuestionnaireAnswers | null> =
    signal<CwQuestionnaireAnswers | null>(null);
  // #endregion
}

/**
 * Function radio
 *
 * @description
 * Finds a choice input by its label.
 *
 * @param {HTMLElement} host - Fixture containing the requested control.
 * @param {string} name - Visible label to match.
 * @returns {HTMLInputElement} Matching choice input.
 */
function radio(host: HTMLElement, name: string): HTMLInputElement {
  const found: HTMLInputElement | undefined = Array.from(
    host.querySelectorAll<HTMLInputElement>('input[type="radio"], input[type="checkbox"]'),
  ).find((input: HTMLInputElement) => input.closest('label')?.textContent.includes(name));
  if (!found) throw new Error(`No choice named ${name}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a visible button by its text.
 *
 * @param {HTMLElement} host - Fixture containing the requested control.
 * @param {string} name - Visible label to match.
 * @returns {HTMLButtonElement} Matching visible button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element: HTMLButtonElement) =>
      element.textContent.trim() === name && !element.closest('[hidden]'),
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function key
 *
 * @description
 * Dispatches a keyboard event to a fixture element.
 *
 * @param {HTMLElement} target - Element receiving the keyboard event.
 * @param {string} value - Keyboard key to dispatch.
 */
function key(target: HTMLElement, value: string): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
  );
}

describe('CwQuestionnaire', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('shows one question at a time with its progress', () => {
    const [first, second]: HTMLFieldSetElement[] = Array.from(host.querySelectorAll('fieldset'));
    const bar: Element | null = host.querySelector('[role="progressbar"]');

    expect(first.hidden).toBe(false);
    expect(second.hidden).toBe(true);
    expect(bar?.getAttribute('aria-valuetext')).toBe('Question 1 sur 2');
    expect(host.textContent).toContain('Signaler un bug');
  });

  it('blocks a required question without answer and says why', async () => {
    button(host, 'Suivant').click();
    await fixture.whenStable();

    const fieldset: HTMLFieldSetElement = present(host.querySelector('fieldset'));
    expect(component.step()).toBe(0);
    expect(fieldset.getAttribute('aria-invalid')).toBe('true');
    expect(host.textContent).toContain('Choisissez une réponse pour continuer.');
    expect(document.activeElement).toBe(radio(host, 'Bug'));
    expect(radio(host, 'Bug').getAttribute('aria-invalid')).toBe('true');
  });

  it('names each choice with its letter and picks it with the letter key', async () => {
    expect(radio(host, 'Bug').closest('label')?.textContent).toContain('A, Bug');

    key(radio(host, 'Bug'), 'b');
    await fixture.whenStable();
    expect(radio(host, 'Nouvelle fonctionnalité').checked).toBe(true);

    key(radio(host, 'Bug'), 'c');
    await fixture.whenStable();
    expect(radio(host, "Demande d'accès").checked).toBe(false);
  });

  it('moves on with Enter, focuses the next legend, and sends the answers', async () => {
    radio(host, 'Bug').click();
    key(radio(host, 'Bug'), 'Enter');
    await fixture.whenStable();

    expect(component.step()).toBe(1);
    expect(document.activeElement?.textContent).toBe('Quelles vues sont concernées ?');
    expect(button(host, 'Précédent')).toBeTruthy();

    radio(host, 'Liste').click();
    radio(host, 'Autre').click();
    component.otherView.set('Vue Gantt');
    await fixture.whenStable();
    button(host, 'Envoyer').click();
    await fixture.whenStable();

    expect(component.answers()).toEqual({ type: 'bug', views: ['list', 'Vue Gantt'] });
    expect(host.querySelector('[role="status"]')?.hasAttribute('hidden')).toBe(false);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Demande envoyée');
  });

  it('skips an optional question', async () => {
    radio(host, 'Bug').click();
    button(host, 'Suivant').click();
    await fixture.whenStable();

    button(host, 'Passer').click();
    await fixture.whenStable();

    expect(component.answers()).toEqual({ type: 'bug' });
  });

  it('is the value accessor of a reactive control', async () => {
    /**
     * Component ReactiveHost
     *
     * @description
     * Hosts a question bound to a reactive form control.
     */
    @Component({
      imports: [...QUESTION_PARTS, ReactiveFormsModule],
      template: `
        <fieldset cwQuestionnaireQuestion [formControl]="severity">
          <legend cwQuestionnaireTitle>Quelle gravité ?</legend>
          <label cwQuestionnaireChoice value="blocking">Bloquant</label>
          <label cwQuestionnaireChoice value="minor">Mineur</label>
        </fieldset>
      `,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property severity
       *
       * @description
       * Reactive form control bound to the question.
       *
       * @type {FormControl<string | null>}
       * @readonly
       */
      public readonly severity: FormControl<string | null> = new FormControl<string | null>(
        'minor',
      );
      // #endregion
    }

    const reactive: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    const element: HTMLElement = reactive.nativeElement as HTMLElement;
    expect(radio(element, 'Mineur').checked).toBe(true);

    radio(element, 'Bloquant').click();
    await reactive.whenStable();
    expect(reactive.componentInstance.severity.value).toBe('blocking');

    key(radio(element, 'Bloquant'), 'b');
    await reactive.whenStable();
    expect(reactive.componentInstance.severity.value).toBe('minor');
  });

  it('is a Signal Forms value control', async () => {
    /**
     * Component SignalHost
     *
     * @description
     * Hosts a question bound to a Signal Forms field.
     */
    @Component({
      imports: [...QUESTION_PARTS, FormField],
      template: `
        <fieldset cwQuestionnaireQuestion type="multiple" [formField]="request.views">
          <legend cwQuestionnaireTitle>Quelles vues ?</legend>
          <label cwQuestionnaireChoice value="list">Liste</label>
          <label cwQuestionnaireChoice value="board">Tableau</label>
        </fieldset>
      `,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       *
       * @description
       * Model containing selected views.
       *
       * @type {WritableSignal<{ views: readonly string[]; }>}
       * @readonly
       */
      public readonly model: WritableSignal<{ views: readonly string[] }> = signal<{
        views: readonly string[];
      }>({ views: ['board'] });

      /**
       * Property request
       *
       * @description
       * Signal Forms field tree derived from the model.
       *
       * @type {FieldTree<{ views: readonly string[] }>}
       * @readonly
       */
      public readonly request: FieldTree<{ views: readonly string[] }> = form(
        this.model,
        (path) => {
          required(path.views);
        },
      );
      // #endregion
    }

    const signalHost: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    signalHost.autoDetectChanges();
    const element: HTMLElement = signalHost.nativeElement as HTMLElement;
    expect(radio(element, 'Tableau').checked).toBe(true);

    radio(element, 'Liste').click();
    await signalHost.whenStable();
    expect(signalHost.componentInstance.model().views).toEqual(['board', 'list']);
  });
});
