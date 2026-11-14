import { CwButton } from '@cadenway/ui/components/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwQuestionnaire } from './questionnaire.component';
import { CwQuestionnaireActions } from './questionnaire-actions/questionnaire-actions.component';
import { CwQuestionnaireChoice } from './questionnaire-choice/questionnaire-choice.component';
import { CwQuestionnaireDescription } from './questionnaire-description/questionnaire-description.component';
import { CwQuestionnaireDone } from './questionnaire-done/questionnaire-done.component';
import { CwQuestionnaireProgress } from './questionnaire-progress/questionnaire-progress.component';
import { CwQuestionnaireQuestion } from './questionnaire-question/questionnaire-question.component';
import { CwQuestionnaireTitle } from './questionnaire-title/questionnaire-title.directive';
import type { CwQuestionnaireSummaryItem } from './questionnaire.types';

/**
 * Constant meta
 *
 * @description
 * Questionnaire states in light and dark themes from the « Signaler un bug » example.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Questionnaire',
  decorators: [
    moduleMetadata({
      imports: [
        CwButton,
        CwQuestionnaire,
        CwQuestionnaireActions,
        CwQuestionnaireChoice,
        CwQuestionnaireDescription,
        CwQuestionnaireDone,
        CwQuestionnaireProgress,
        CwQuestionnaireQuestion,
        CwQuestionnaireTitle,
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for questionnaire examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Finds the light theme section of the story canvas.
 *
 * @param {HTMLElement} canvasElement - Canvas containing the themed examples.
 * @returns {HTMLElement} Light theme section.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Constant FORM
 *
 * @description
 * Shared questionnaire markup for the example stories.
 *
 * @type {string}
 */
const FORM: string = `
  <form cwQuestionnaire class="max-w-sm" title="Signaler un bug" [(step)]="step" [shortcuts]="shortcuts">
    <cw-questionnaire-progress />
    <fieldset cwQuestionnaireQuestion name="type" required [(value)]="type">
      <legend cwQuestionnaireTitle>Quel type de demande ?</legend>
      <cw-questionnaire-description>Elle devient une tâche dans l'espace Produit.</cw-questionnaire-description>
      <label cwQuestionnaireChoice value="bug" description="Quelque chose ne fonctionne pas.">Bug</label>
      <label cwQuestionnaireChoice value="feature" description="Une idée pour améliorer Cadenway.">Nouvelle fonctionnalité</label>
      <label cwQuestionnaireChoice value="question" description="Besoin d'aide pour utiliser Cadenway.">Question</label>
      <label cwQuestionnaireChoice value="access" description="Réservé aux administrateurs." disabled>Demande d'accès</label>
    </fieldset>
    <fieldset cwQuestionnaireQuestion name="views" type="multiple" [(value)]="views">
      <legend cwQuestionnaireTitle>Quelles vues sont concernées ?</legend>
      <cw-questionnaire-description>Plusieurs réponses possibles · facultative.</cw-questionnaire-description>
      <label cwQuestionnaireChoice value="list">Liste</label>
      <label cwQuestionnaireChoice value="board">Tableau</label>
      <label cwQuestionnaireChoice value="calendar">Calendrier</label>
      <label cwQuestionnaireChoice value="other" other [(otherText)]="otherView">Autre</label>
    </fieldset>
    <fieldset cwQuestionnaireQuestion name="severity" required>
      <legend cwQuestionnaireTitle>Quelle gravité ?</legend>
      <cw-questionnaire-description>Obligatoire.</cw-questionnaire-description>
      <label cwQuestionnaireChoice value="blocking">Bloquant</label>
      <label cwQuestionnaireChoice value="annoying">Gênant</label>
      <label cwQuestionnaireChoice value="minor">Mineur</label>
    </fieldset>
    <cw-questionnaire-actions />
    <cw-questionnaire-done [summary]="summary">
      Elle devient la tâche <span class="font-mono text-foreground">CAD-491</span> dans Produit.
      <button cwButton variant="outline" size="sm" type="button">Voir la tâche</button>
    </cw-questionnaire-done>
  </form>`;

/**
 * Constant SUMMARY
 *
 * @description
 * Example answers displayed on the confirmation screen.
 *
 * @type {CwQuestionnaireSummaryItem[]}
 */
const SUMMARY: CwQuestionnaireSummaryItem[] = [
  { label: 'Type', value: 'Nouvelle fonctionnalité' },
  { label: 'Vues', value: 'Liste, Calendrier, Vue Gantt' },
  { label: 'Gravité', value: 'Gênant' },
];

/** Single choice with the letter keys A, B, C; D is disabled. */
export const SingleChoice: Story = {
  render: () => ({
    props: {
      step: 0,
      shortcuts: 'letters',
      type: 'feature',
      views: [],
      otherView: '',
      summary: SUMMARY,
    },
    template: FORM,
  }),
};

/** Multiple choice with « Autre » and its field; « Passer » for an optional question. */
export const MultipleWithOther: Story = {
  render: () => ({
    props: {
      step: 1,
      shortcuts: 'letters',
      type: 'feature',
      views: ['list', 'calendar', 'other'],
      otherView: 'Vue Gantt',
      summary: SUMMARY,
    },
    template: FORM,
  }),
};

/** A required answer missing on « Envoyer », without letter keys. */
export const RequiredError: Story = {
  render: () => ({
    props: {
      step: 2,
      shortcuts: 'none',
      type: 'feature',
      views: [],
      otherView: '',
      summary: SUMMARY,
    },
    template: FORM,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options: { name: string | RegExp }) => HTMLElement;
      getByText: (text: string) => HTMLElement;
    } = within(light(canvasElement));
    await userEvent.click(scope.getByRole('button', { name: 'Envoyer' }));
    await expect(scope.getByText('Choisissez une réponse pour continuer.')).toBeInTheDocument();
    await expect(scope.getByRole('radio', { name: /Bloquant/ })).toHaveFocus();
  },
};

/** Keyboard: letters pick, Enter moves on, the next legend takes the focus; then the confirmation. */
export const Keyboard: Story = {
  render: () => ({
    props: {
      step: 0,
      shortcuts: 'letters',
      type: null,
      views: [],
      otherView: '',
      summary: SUMMARY,
    },
    template: FORM,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name: string | RegExp }) => HTMLElement;
      getByText: (text: string) => HTMLElement;
    } = within(light(canvasElement));
    await userEvent.tab();
    await userEvent.keyboard('b');
    await expect(scope.getByRole('radio', { name: /^B, Nouvelle fonctionnalité/ })).toBeChecked();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByText('Quelles vues sont concernées ?')).toHaveFocus();
    await userEvent.click(scope.getByRole('button', { name: 'Passer' }));
    await userEvent.click(scope.getByRole('radio', { name: /^B, Gênant/ }));
    await userEvent.click(scope.getByRole('button', { name: 'Envoyer' }));
    await expect(scope.getByRole('status')).toHaveTextContent('Demande envoyée');
  },
};
