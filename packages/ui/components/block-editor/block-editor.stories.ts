import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { of, type Observable } from 'rxjs';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwBlockEditor } from './block-editor.component';
import type { CwMentionPerson, CwMentionSearch } from './block-editor.types';

/**
 * Constant meta
 *
 * @description
 * Markdown block editor examples in light and dark themes.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/BlockEditor',
  decorators: [moduleMetadata({ imports: [CwBlockEditor] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for block editor examples.
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
 * Constant PEOPLE
 *
 * @description
 * People offered by the sample mention search.
 *
 * @type {CwMentionPerson[]}
 */
const PEOPLE: CwMentionPerson[] = [
  { id: 'karim', name: 'Karim Benali', role: 'Développement' },
  { id: 'ines', name: 'Inès Duval', role: 'Design' },
  { id: 'lea', name: 'Léa Martin', role: 'Produit' },
  { id: 'hugo', name: 'Hugo Dubois', role: 'Support' },
];

/**
 * Function searchPeople
 *
 * @description
 * Searches sample people by name.
 *
 * @param {string} query - Name fragment to search.
 * @returns {Observable<readonly CwMentionPerson[]>} Matching people.
 */
const searchPeople: CwMentionSearch = (query: string): Observable<readonly CwMentionPerson[]> =>
  of(PEOPLE.filter((person) => person.name.toLowerCase().includes(query.toLowerCase())));

/**
 * Constant DOCUMENT
 *
 * @description
 * Markdown document displayed in the editing example.
 *
 * @type {string}
 */
const DOCUMENT: string = [
  '# Export CSV des tâches',
  '',
  'Les équipes exportent leurs tâches pour les **revues de sprint**. Le fichier garde les accents',
  'dans *Excel* et __LibreOffice__.',
  '',
  '## Étapes',
  '',
  '1. Choisir les colonnes',
  '2. Lancer l’export',
  '',
  '- [x] Forcer l’UTF-8 avec BOM',
  '- [ ] Tester sur LibreOffice',
  '',
  '> Le séparateur doit être un point-virgule pour Excel en français.',
  '',
  '```',
  "const header = columns.join(';');",
  '```',
].join('\n');

/** A document being edited: the toolbar above the text, every block type. */
export const Document: Story = {
  render: () => ({
    props: { value: DOCUMENT },
    template: `<cw-block-editor class="max-w-2xl" [(value)]="value" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      findByRole: (role: string, options?: { name?: string | RegExp }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    await waitFor(() =>
      expect(scope.getByRole('textbox', { name: 'Contenu du document' })).toHaveTextContent(
        'Export CSV des tâches',
      ),
    );
    await expect(scope.getByRole('toolbar', { name: 'Mise en forme' })).toBeVisible();
  },
};

/** An empty document: the placeholder of the mockup. */
export const Empty: Story = {
  render: () => ({
    props: { value: '' },
    template: `<cw-block-editor class="max-w-2xl" [(value)]="value" />`,
  }),
};

/** The task description: no toolbar, framed like a field, with its own placeholder. */
export const Field: Story = {
  render: () => ({
    props: { value: 'Le séparateur doit être un **point-virgule** pour Excel en français.' },
    template: `
      <div class="max-w-md rounded-lg border border-input bg-background transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
        <cw-block-editor
          variant="field"
          [toolbar]="false"
          ariaLabel="Description"
          placeholder="Ajoutez une description, ou tapez « / » pour insérer un bloc"
          [(value)]="value"
        />
      </div>`,
  }),
};

/** « / » at the start of a line opens the block menu; ↓ and Entrée insert a heading. */
export const SlashMenu: Story = {
  render: () => ({
    props: { value: '' },
    template: `<cw-block-editor class="max-w-2xl" [(value)]="value" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      findByRole: (role: string, options?: { name?: string | RegExp }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    const surface: HTMLElement = await scope.findByRole('textbox', { name: 'Contenu du document' });
    await userEvent.click(surface);
    await userEvent.keyboard('/');
    const listbox: HTMLElement = await scope.findByRole('listbox', { name: 'Blocs' });
    await expect(within(listbox).getAllByRole('option')).toHaveLength(10);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(scope.queryByRole('listbox')).toBeNull());
    await userEvent.keyboard('Objectif');
    await waitFor(() => expect(surface.querySelector('h1')).toHaveTextContent('Objectif'));
  },
};

/** « @ » opens the people menu; the found part of the name is bold. */
export const Mentions: Story = {
  render: () => ({
    props: { value: '', searchPeople },
    template: `
      <div class="max-w-md rounded-lg border border-input bg-background">
        <cw-block-editor variant="field" [toolbar]="false" ariaLabel="Commentaire" placeholder="Écrire un commentaire…" [mentionSearch]="searchPeople" [(value)]="value" />
      </div>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      findByRole: (role: string, options?: { name?: string | RegExp }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    const surface: HTMLElement = await scope.findByRole('textbox', { name: 'Commentaire' });
    await userEvent.click(surface);
    await userEvent.keyboard('Merci @in');
    const listbox: HTMLElement = await scope.findByRole('listbox', { name: 'Personnes' });
    await waitFor(() => expect(within(listbox).getAllByRole('option')).toHaveLength(2));
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(surface.querySelector('[data-mention]')).toHaveTextContent('@Inès Duval'),
    );
  },
};

/** Ctrl + B toggles bold on the selection; the Gras button reads pressed. */
export const Keyboard: Story = {
  render: () => ({
    props: { value: 'relire avant vendredi' },
    template: `<cw-block-editor class="max-w-2xl" [(value)]="value" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options?: { name?: string | RegExp }) => HTMLElement;
      findByRole: (role: string, options?: { name?: string | RegExp }) => Promise<HTMLElement>;
      queryByRole: (role: string) => HTMLElement | null;
    } = within(light(canvasElement));
    const surface: HTMLElement = await scope.findByRole('textbox', { name: 'Contenu du document' });
    await userEvent.click(surface);
    await userEvent.keyboard('{Control>}a{/Control}{Control>}b{/Control}');
    await waitFor(() => expect(surface.querySelector('strong')).toHaveTextContent('relire'));
    await expect(scope.getByRole('button', { name: 'Gras' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

/** Read-only: the text stays, nothing can change. */
export const Disabled: Story = {
  render: () => ({
    props: { value: 'Un espace en lecture seule : la description ne peut pas changer.' },
    template: `<cw-block-editor class="max-w-2xl" disabled [value]="value" />`,
  }),
};
