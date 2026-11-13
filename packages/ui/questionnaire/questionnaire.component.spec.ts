import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwQuestionnaire } from './questionnaire.component';
import { CwQuestionnaireActions } from './questionnaire-actions/questionnaire-actions.component';
import { CwQuestionnaireChoice } from './questionnaire-choice/questionnaire-choice.component';
import { CwQuestionnaireDone } from './questionnaire-done/questionnaire-done.component';
import { CwQuestionnaireProgress } from './questionnaire-progress/questionnaire-progress.component';
import { CwQuestionnaireQuestion } from './questionnaire-question/questionnaire-question.component';
import { CwQuestionnaireTitle } from './questionnaire-title/questionnaire-title.directive';
import type { CwQuestionnaireAnswers } from './questionnaire.types';

function present<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Missing element');
  return value;
}

const PARTS = [
  CwQuestionnaire,
  CwQuestionnaireActions,
  CwQuestionnaireChoice,
  CwQuestionnaireDone,
  CwQuestionnaireProgress,
  CwQuestionnaireQuestion,
  CwQuestionnaireTitle,
];

const QUESTION_PARTS = [CwQuestionnaireChoice, CwQuestionnaireQuestion, CwQuestionnaireTitle];

@Component({
  imports: PARTS,
  template: `
    <!-- eslint-disable @angular-eslint/template/label-has-associated-control -- the choice renders its native input -->
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
  readonly step = signal(0);
  readonly otherView = signal('');
  readonly answers = signal<CwQuestionnaireAnswers | null>(null);
}

function radio(host: HTMLElement, name: string): HTMLInputElement {
  const found = Array.from(
    host.querySelectorAll<HTMLInputElement>('input[type="radio"], input[type="checkbox"]'),
  ).find((input) => input.closest('label')?.textContent.includes(name));
  if (!found) throw new Error(`No choice named ${name}`);
  return found;
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim() === name && !element.closest('[hidden]'),
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

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
    const [first, second] = Array.from(host.querySelectorAll('fieldset'));
    const bar = host.querySelector('[role="progressbar"]');

    expect(first.hidden).toBe(false);
    expect(second.hidden).toBe(true);
    expect(bar?.getAttribute('aria-valuetext')).toBe('Question 1 sur 2');
    expect(host.textContent).toContain('Signaler un bug');
  });

  it('blocks a required question without answer and says why', async () => {
    button(host, 'Suivant').click();
    await fixture.whenStable();

    const fieldset = present(host.querySelector('fieldset'));
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
    @Component({
      imports: [...QUESTION_PARTS, ReactiveFormsModule],
      template: `
        <!-- eslint-disable @angular-eslint/template/label-has-associated-control -- the choice renders its native input -->
        <fieldset cwQuestionnaireQuestion [formControl]="severity">
          <legend cwQuestionnaireTitle>Quelle gravité ?</legend>
          <label cwQuestionnaireChoice value="blocking">Bloquant</label>
          <label cwQuestionnaireChoice value="minor">Mineur</label>
        </fieldset>
      `,
    })
    class ReactiveHost {
      readonly severity = new FormControl<string | null>('minor');
    }

    const reactive = TestBed.createComponent(ReactiveHost);
    reactive.autoDetectChanges();
    const element = reactive.nativeElement as HTMLElement;
    expect(radio(element, 'Mineur').checked).toBe(true);

    radio(element, 'Bloquant').click();
    await reactive.whenStable();
    expect(reactive.componentInstance.severity.value).toBe('blocking');

    key(radio(element, 'Bloquant'), 'b');
    await reactive.whenStable();
    expect(reactive.componentInstance.severity.value).toBe('minor');
  });

  it('is a Signal Forms value control', async () => {
    @Component({
      imports: [...QUESTION_PARTS, FormField],
      template: `
        <!-- eslint-disable @angular-eslint/template/label-has-associated-control -- the choice renders its native input -->
        <fieldset cwQuestionnaireQuestion type="multiple" [formField]="request.views">
          <legend cwQuestionnaireTitle>Quelles vues ?</legend>
          <label cwQuestionnaireChoice value="list">Liste</label>
          <label cwQuestionnaireChoice value="board">Tableau</label>
        </fieldset>
      `,
    })
    class SignalHost {
      readonly model = signal<{ views: readonly string[] }>({ views: ['board'] });
      readonly request = form(this.model, (path) => {
        required(path.views);
      });
    }

    const signalHost = TestBed.createComponent(SignalHost);
    signalHost.autoDetectChanges();
    const element = signalHost.nativeElement as HTMLElement;
    expect(radio(element, 'Tableau').checked).toBe(true);

    radio(element, 'Liste').click();
    await signalHost.whenStable();
    expect(signalHost.componentInstance.model().views).toEqual(['board', 'list']);
  });
});
