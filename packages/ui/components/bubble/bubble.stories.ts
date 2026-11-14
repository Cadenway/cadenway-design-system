import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwBubble } from './bubble.component';
import { CwBubbleGroup } from './bubble-group/bubble-group.component';
import { CwBubbleQuote } from './bubble-quote/bubble-quote.component';
import { CwBubbleReaction } from './bubble-reaction/bubble-reaction.component';
import { CwBubbleReactions } from './bubble-reactions/bubble-reactions.component';

/**
 * Constant meta
 *
 * @description
 * Bubble, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the mockup (`App.dc.html`, comments tab).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Bubble',
  decorators: [
    moduleMetadata({
      imports: [CwBubble, CwBubbleGroup, CwBubbleQuote, CwBubbleReaction, CwBubbleReactions],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story configuration for bubble examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Selects the light theme copy for interaction checks.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing the themed examples.
 *
 * @returns {HTMLElement} Light theme section used for interaction checks.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The five variants at both sizes: `muted` for the others, `secondary` for oneself. */
export const Variants: Story = {
  render: () => ({
    template: `
      <div class="grid gap-3">
        <div class="flex flex-wrap items-start gap-3">
          <cw-bubble variant="default">Créer une sous-tâche</cw-bubble>
          <cw-bubble variant="secondary">Je relis ce soir.</cw-bubble>
          <cw-bubble variant="muted">Correctif en revue.</cw-bubble>
          <cw-bubble variant="outline">Message transféré</cw-bubble>
          <cw-bubble variant="ghost">Épinglé par Léa</cw-bubble>
        </div>
        <div class="flex flex-wrap items-start gap-3">
          <cw-bubble size="sm" variant="default">Créer une sous-tâche</cw-bubble>
          <cw-bubble size="sm" variant="secondary">Je relis ce soir.</cw-bubble>
          <cw-bubble size="sm" variant="muted">Correctif en revue.</cw-bubble>
          <cw-bubble size="sm" variant="outline">Message transféré</cw-bubble>
          <cw-bubble size="sm" variant="ghost">Épinglé par Léa</cw-bubble>
        </div>
      </div>`,
  }),
};

/** Tones: information, success, warning, error, and warning at the `sm` size. */
export const Tones: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-start gap-3">
        <cw-bubble tone="info" title="Lecture seule">Vous êtes invité sur ce fil.</cw-bubble>
        <cw-bubble tone="success" title="Sous-tâche créée">CAD-492 ajoutée au sprint.</cw-bubble>
        <cw-bubble tone="warning" title="Réponse tronquée">Limite de contexte atteinte.</cw-bubble>
        <cw-bubble tone="error" title="Action impossible">Droits insuffisants sur cette liste.</cw-bubble>
        <cw-bubble size="sm" tone="warning" title="Réponse tronquée">Limite de contexte atteinte.</cw-bubble>
      </div>`,
  }),
};

/** Alignment and groups: inner corners tighten, 2 px between bubbles. */
export const Groups: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-md gap-4">
        <cw-bubble-group>
          <cw-bubble>La maquette est prête.</cw-bubble>
          <cw-bubble>Vue semaine ajoutée.</cw-bubble>
          <cw-bubble>Retours avant jeudi ?</cw-bubble>
        </cw-bubble-group>
        <cw-bubble-group>
          <cw-bubble variant="secondary" align="end">Vu, merci.</cw-bubble>
          <cw-bubble variant="secondary" align="end">Je regarde la vue semaine.</cw-bubble>
          <cw-bubble variant="secondary" align="end">Retour jeudi matin.</cw-bubble>
        </cw-bubble-group>
      </div>`,
  }),
};

/** A reply quoting a message, inline code, a mention. */
export const QuoteAndCode: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-md gap-3">
        <div class="flex justify-end">
          <cw-bubble variant="secondary" align="end">
            <cw-bubble-quote author="Karim Benali">J'ai reproduit le bug : Excel ouvre le CSV en Windows-1252.</cw-bubble-quote>
            Bien vu. On force l'UTF-8 avec BOM ?
          </cw-bubble>
        </div>
        <cw-bubble><a href="#karim">@Karim Benali</a> ajoutez <code>charset=utf-8</code> à <code>Content-Type</code>.</cw-bubble>
        <cw-bubble variant="default">Lancer <code>cadenway export --bom</code></cw-bubble>
      </div>`,
  }),
};

/** Reactions: pressed, at rest, and the add button; Space toggles the focused one. */
export const Reactions: Story = {
  render: () => ({
    props: { liked: true, clapped: false },
    template: `
      <cw-bubble>
        Export corrigé et déployé.
        <cw-bubble-reactions>
          <button cwBubbleReaction icon="thumbs-up" label="D'accord" [count]="3" [(pressed)]="liked"></button>
          <button cwBubbleReaction icon="hands-clapping" label="Bravo" [count]="2" [(pressed)]="clapped"></button>
          <button cwBubbleReaction icon="eyes" label="Je regarde" [count]="1"></button>
          <button cwBubbleReaction icon="heart" label="J'aime" [count]="1"></button>
        </cw-bubble-reactions>
      </cw-bubble>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: { getByRole(role: string, options?: { name?: string }): HTMLElement } = within(
      light(canvasElement),
    );
    const bravo: HTMLElement = scope.getByRole('button', { name: 'Bravo : 2' });
    await expect(scope.getByRole('button', { name: "D'accord : 3, dont vous" })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.tab();
    await userEvent.tab();
    await expect(bravo).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(bravo).toHaveAttribute('aria-pressed', 'true');
  },
};
