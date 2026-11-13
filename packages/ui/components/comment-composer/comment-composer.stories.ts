import type { CwMentionSearch } from '@cadenway/ui/components/block-editor';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { of } from 'rxjs';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwCommentComposer } from './comment-composer.component';
import type { CwAttachmentDraft, CwPerson } from './comment-composer.types';

/**
 * Comment composer, every state of its sheet in the Design System artifact, in the light and the
 * dark theme. Copy from the sheet's preview and the mockup (`App.dc.html`, comments of a task).
 */
const meta: Meta = {
  title: 'UI/CommentComposer',
  decorators: [moduleMetadata({ imports: [CwCommentComposer] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const LEA: CwPerson = { id: 'lea', name: 'Léa Martin', role: 'Produit' };

const PEOPLE: CwPerson[] = [
  { id: 'ines', name: 'Inès Duval', role: 'Design' },
  LEA,
  { id: 'karim', name: 'Karim Benali', role: 'Développement' },
  { id: 'hugo', name: 'Hugo Dubois', role: 'Support' },
];

const searchPeople: CwMentionSearch = (query) =>
  of(PEOPLE.filter((person) => person.name.toLowerCase().includes(query.toLowerCase())));

const FILES: CwAttachmentDraft[] = [
  { id: 'f1', name: 'capture-excel.png', mimeType: 'image/png', fileSize: 319_488, state: 'done' },
  { id: 'f2', name: 'export-sprint-14.csv', state: 'uploading', progress: 64 },
];

/** Complete: formatted text, an inserted mention, files being sent. */
export const Full: Story = {
  render: () => ({
    props: {
      author: LEA,
      searchPeople,
      files: FILES,
      value:
        'Correctif prêt sur `fix/csv-utf8` : l’export force désormais l’UTF-8 avec BOM. @[Karim Benali](karim), peux-tu **relire avant vendredi** ?',
    },
    template: `<cw-comment-composer class="max-w-xl" [author]="author" [mentionSearch]="searchPeople" [(attachments)]="files" [(value)]="value" />`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await scope.findByRole('textbox', { name: 'Commentaire' });
    await expect(scope.getByRole('toolbar', { name: 'Mise en forme' })).toBeVisible();
    await expect(scope.getByRole('button', { name: 'Envoyer' })).toBeDisabled();
  },
};

/** Empty: Envoyer stays disabled. */
export const Empty: Story = {
  render: () => ({
    props: { author: LEA, value: '' },
    template: `<cw-comment-composer class="max-w-xl" [author]="author" [(value)]="value" />`,
  }),
};

/** Send failure: the text is kept, the message offers Réessayer. */
export const SendError: Story = {
  render: () => ({
    props: { value: 'Peux-tu relire avant vendredi ?' },
    template: `<cw-comment-composer class="max-w-xl" error="Envoi impossible : connexion perdue. Votre texte est conservé." [(value)]="value" />`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(scope.getByRole('alert')).toHaveTextContent('Envoi impossible');
    await waitFor(() =>
      expect(scope.getByRole('textbox', { name: 'Commentaire' })).toHaveAttribute(
        'aria-invalid',
        'true',
      ),
    );
  },
};

/** Sending: Envoyer shows its spinner. */
export const Sending: Story = {
  render: () => ({
    props: { value: 'L’export garde maintenant les accents.' },
    template: `<cw-comment-composer class="max-w-xl" sending [(value)]="value" />`,
  }),
};

/** Editing a comment: Annuler and Enregistrer. */
export const Edit: Story = {
  render: () => ({
    props: { value: 'L’export garde maintenant les accents dans Excel et LibreOffice.' },
    template: `<cw-comment-composer class="max-w-xl" mode="edit" [(value)]="value" />`,
  }),
};

/** Compact, empty: one line with Joindre and Envoyer. */
export const Compact: Story = {
  render: () => ({
    props: { author: LEA, value: '' },
    template: `<cw-comment-composer class="max-w-md" variant="compact" [author]="author" [(value)]="value" />`,
  }),
};

/** Compact at focus: it grows into the editor with a shorter bar. */
export const CompactFocus: Story = {
  render: () => ({
    props: { author: LEA, value: '' },
    template: `<cw-comment-composer class="max-w-md" variant="compact" [author]="author" [(value)]="value" />`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const surface = await scope.findByRole('textbox', { name: 'Commentaire' });
    await userEvent.click(surface);
    await expect(await scope.findByRole('toolbar', { name: 'Mise en forme' })).toBeVisible();
  },
};

/** Compact and read-only: « Commentaires désactivés ». */
export const Disabled: Story = {
  render: () => ({
    props: { author: LEA },
    template: `<cw-comment-composer class="max-w-md" variant="compact" disabled [author]="author" />`,
  }),
};

/** « @ » then letters: the people menu, the found part in bold; Entrée inserts the mention. */
export const Mentions: Story = {
  render: () => ({
    props: { searchPeople, value: '' },
    template: `<cw-comment-composer class="max-w-xl" [mentionSearch]="searchPeople" [(value)]="value" />`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const surface = await scope.findByRole('textbox', { name: 'Commentaire' });
    await userEvent.click(surface);
    await userEvent.keyboard('Correctif prêt, @in');
    const listbox = await scope.findByRole('listbox', { name: 'Personnes' });
    await waitFor(() => expect(within(listbox).getAllByRole('option')).toHaveLength(2));
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(surface.querySelector('[data-mention]')).toHaveTextContent('@Inès Duval'),
    );
  },
};

/** « / » at the start of a line: the block menu of the composer. */
export const Commands: Story = {
  render: () => ({
    props: { value: '' },
    template: `<cw-comment-composer class="max-w-xl" [(value)]="value" />`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const surface = await scope.findByRole('textbox', { name: 'Commentaire' });
    await userEvent.click(surface);
    await userEvent.keyboard('/');
    const listbox = await scope.findByRole('listbox', { name: 'Blocs' });
    await expect(within(listbox).getAllByRole('option')).toHaveLength(6);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(scope.queryByRole('listbox')).toBeNull());
  },
};
