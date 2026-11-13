import { CwAttachment } from '@cadenway/ui/attachment';
import { CwAvatar } from '@cadenway/ui/avatar';
import { CwBubble, CwBubbleQuote, CwBubbleReaction, CwBubbleReactions } from '@cadenway/ui/bubble';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwMessage } from './message.component';
import { CwMessageAvatar } from './message-avatar/message-avatar.component';
import { CwMessageGroup } from './message-group/message-group.component';
import { CwMessageNote } from './message-note/message-note.component';
import { CwMessageThread } from './message-thread/message-thread.component';

/**
 * Message, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the mockup (`App.dc.html`, comments tab). Times are relative to the moment the story
 * renders.
 */
const meta: Meta = {
  title: 'UI/Message',
  decorators: [
    moduleMetadata({
      imports: [
        CwAttachment,
        CwAvatar,
        CwBubble,
        CwBubbleQuote,
        CwBubbleReaction,
        CwBubbleReactions,
        CwMessage,
        CwMessageAvatar,
        CwMessageGroup,
        CwMessageNote,
        CwMessageThread,
      ],
    }),
  ],
};

export default meta;

type Story = StoryObj;

function ago(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Incoming, outgoing and a `default` system notice. */
export const Variants: Story = {
  render: () => ({
    props: { incoming: ago(90), outgoing: ago(85) },
    template: `
      <cw-message-group class="max-w-xl">
        <cw-message author="Karim Benali" [time]="incoming">
          <cw-message-avatar><cw-avatar name="Karim Benali" /></cw-message-avatar>
          <cw-bubble>J'ai reproduit le bug : Excel ouvre le CSV en Windows-1252.</cw-bubble>
        </cw-message>
        <cw-message variant="outgoing" [time]="outgoing">
          <cw-bubble>Merci, je relis dès que c'est en revue.</cw-bubble>
        </cw-message>
        <cw-message variant="system" icon="lightning" title="Automatisation « Terminé → archiver » active">
          La tâche sera archivée 7 jours après son passage à Terminé.
        </cw-message>
      </cw-message-group>`,
  }),
};

/** Consecutive messages of one person: one avatar and header, tightened corners, reactions. */
export const Grouped: Story = {
  render: () => ({
    props: { first: ago(30), second: ago(28), liked: true },
    template: `
      <cw-message-group class="max-w-xl">
        <cw-message author="Inès Duval" [time]="first" edited>
          <cw-message-avatar><cw-avatar name="Inès Duval" /></cw-message-avatar>
          <cw-bubble>La maquette du Calendrier est prête.</cw-bubble>
        </cw-message>
        <cw-message author="Inès Duval" [time]="second">
          <cw-message-avatar><cw-avatar name="Inès Duval" /></cw-message-avatar>
          <cw-bubble>
            <a href="#karim">@Karim Benali</a> tu peux vérifier le glisser-déposer ?
            <cw-bubble-reactions>
              <button cwBubbleReaction icon="thumbs-up" label="D'accord" [count]="2" [(pressed)]="liked"></button>
              <button cwBubbleReaction icon="eyes" label="Je regarde" [count]="1"></button>
            </cw-bubble-reactions>
          </cw-bubble>
        </cw-message>
      </cw-message-group>`,
  }),
};

/** The assistant: writing (`busy`), then an answer with a warning tone. */
export const Assistant: Story = {
  render: () => ({
    props: { writing: ago(1), answer: ago(0) },
    template: `
      <cw-message-group class="max-w-xl">
        <cw-message author="Assistant Cadenway" [time]="writing" busy>
          <cw-message-avatar icon="sparkle" />
          <cw-bubble>Lecture des 48 commentaires…</cw-bubble>
        </cw-message>
        <cw-message author="Assistant Cadenway" [time]="answer">
          <cw-message-avatar icon="sparkle" />
          <cw-bubble tone="warning" title="Réponse incomplète">La limite de contexte est atteinte : seuls les 40 derniers commentaires ont été lus.</cw-bubble>
        </cw-message>
      </cw-message-group>`,
  }),
};

/** Attachments after the bubble, a state note and the thread summary. */
export const AttachmentsAndThread: Story = {
  render: () => ({
    props: { time: ago(70), lastReply: ago(65) },
    template: `
      <cw-message class="max-w-xl" author="Karim Benali" [time]="time" tone="warning" title="1 pièce jointe bloquée : migrer.exe, type de fichier refusé.">
        <cw-message-avatar><cw-avatar name="Karim Benali" /></cw-message-avatar>
        <cw-bubble>Avant et après le correctif :</cw-bubble>
        <cw-attachment name="capture-excel.png" [fileSize]="319488" />
        <cw-attachment name="specs-export.pdf" [fileSize]="188416" />
        <cw-message-thread [count]="3" [lastReplyAt]="lastReply" [participants]="['Karim Benali', 'Inès Duval']" />
      </cw-message>`,
  }),
};

/** State notes under the bubble: information, success, warning. */
export const StateNotes: Story = {
  render: () => ({
    props: { time: ago(20) },
    template: `
      <div class="flex max-w-xl flex-col gap-4">
        <cw-message variant="outgoing" [time]="time" tone="info" title="Modifié · visible par vous seul">
          <cw-bubble>Je relis la PR après le déjeuner.</cw-bubble>
        </cw-message>
        <cw-message variant="outgoing" [time]="time" tone="success" title="Converti en tâche CAD-493">
          <cw-bubble>Ajouter un test sur les accents.</cw-bubble>
        </cw-message>
        <cw-message author="Léa Martin" [time]="time">
          <cw-message-avatar><cw-avatar name="Léa Martin" /></cw-message-avatar>
          <cw-bubble>Maquettes ici : drive-partage.example/cal</cw-bubble>
          <cw-message-note tone="warning">Lien externe signalé : domaine non approuvé par l'instance.</cw-message-note>
        </cw-message>
      </div>`,
  }),
};

/** Sending (« Envoi… ») and failed sending (Réessayer, Supprimer). */
export const SendingAndFailed: Story = {
  render: () => ({
    props: { time: ago(0) },
    template: `
      <div class="flex max-w-xl flex-col gap-4">
        <cw-message variant="outgoing" [time]="time" status="sending">
          <cw-bubble>Testé sur Excel 2019 : les accents passent.</cw-bubble>
        </cw-message>
        <cw-message variant="outgoing" [time]="time" status="failed">
          <cw-bubble>Je fusionne ce soir.</cw-bubble>
        </cw-message>
      </div>`,
  }),
};

/** System notices in every tone; the error one is an alert with Réessayer. */
export const SystemTones: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-3xl grid-cols-2 gap-3">
        <cw-message variant="system" tone="info" title="Ce fil est visible par toute l'équipe Produit.">12 personnes peuvent lire et répondre.</cw-message>
        <cw-message variant="system" tone="success" title="Tâche fusionnée avec CAD-471.">Commentaires et pièces jointes sont regroupés ici.</cw-message>
        <cw-message variant="system" tone="warning" action="Inviter" title="Ce commentaire mentionne une personne qui n'a pas accès à l'espace.">Samuel Roux ne recevra pas de notification.</cw-message>
        <cw-message variant="system" tone="error" action="Réessayer" title="Impossible de charger les 12 messages précédents.">Vérifiez votre connexion, puis réessayez.</cw-message>
      </div>`,
  }),
};

/** Keyboard: Tab reaches the action bar, which appears; the arrows move through it. */
export const Keyboard: Story = {
  render: () => ({
    props: { time: ago(10) },
    template: `
      <cw-message class="max-w-xl" author="Karim Benali" [time]="time">
        <cw-message-avatar><cw-avatar name="Karim Benali" /></cw-message-avatar>
        <cw-bubble>J'ai reproduit le bug.</cw-bubble>
      </cw-message>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const toolbar = scope.getByRole('toolbar', { name: 'Actions du message' });

    await userEvent.tab();
    await expect(within(toolbar).getByRole('button', { name: 'Réagir' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(toolbar).getByRole('button', { name: 'Répondre' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(within(toolbar).getByRole('button', { name: "Plus d'actions" })).toHaveFocus();
  },
};
