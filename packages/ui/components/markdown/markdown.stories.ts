import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwMarkdown } from './markdown.component';

/**
 * Constant meta
 *
 * @description
 * Markdown, the read view of rich text in the light and the dark theme. Copy from the mockup
 * (`App.dc.html`: documents, task description, comments).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Markdown',
  decorators: [moduleMetadata({ imports: [CwMarkdown] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story for Markdown rendering examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Function light
 *
 * @description
 * Returns the light-theme story container.
 *
 * @param {HTMLElement} canvasElement - Story canvas containing theme scopes.
 *
 * @returns {HTMLElement} Container for the light theme.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/**
 * Constant DOCUMENT
 *
 * @description
 * Markdown document shown in the example.
 *
 * @type {string}
 */
const DOCUMENT: string = [
  '# Export CSV des tâches',
  '',
  'Les équipes exportent leurs tâches pour les **revues de sprint**. Le fichier doit garder les',
  'accents dans *Excel* et __LibreOffice__.',
  '',
  '## Étapes',
  '',
  '1. Choisir les colonnes',
  '2. Lancer l’export',
  '3. Vérifier l’encodage',
  '',
  '### Points ouverts',
  '',
  '- Séparateur `;` pour Excel en français',
  '- ~~Export XLSX~~ reporté au Sprint 15',
  '- Voir la [note de cadrage](https://cadenway.fr/docs/export)',
  '',
  '> Le séparateur doit être un point-virgule pour Excel en français.',
  '',
  '---',
  '',
  '- [x] Forcer l’UTF-8 avec BOM',
  '- [ ] Tester sur LibreOffice',
  '',
  '```ts',
  "const header = '\\uFEFF' + columns.join(';');",
  '```',
].join('\n');

/** A document in reading mode: headings, lists, tasks, quote, separator and code block. */
export const Document: Story = {
  render: () => ({
    props: { source: DOCUMENT },
    template: `<cw-markdown class="max-w-2xl" [source]="source" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options: { name: string; level?: number }) => HTMLElement;
    } = within(light(canvasElement));
    await expect(
      scope.getByRole('heading', { level: 1, name: 'Export CSV des tâches' }),
    ).toBeVisible();
    await expect(scope.getByRole('checkbox', { name: 'Forcer l’UTF-8 avec BOM' })).toBeChecked();
    await expect(scope.getByRole('link', { name: 'note de cadrage' })).toHaveAttribute(
      'href',
      'https://cadenway.fr/docs/export',
    );
  },
};

/** A comment: inline marks, a mention and inline code. */
export const Comment: Story = {
  render: () => ({
    props: {
      source:
        'Correctif prêt sur `fix/csv-utf8` : l’export force désormais l’UTF-8 avec BOM. @[Karim Benali](karim), peux-tu **relire avant vendredi** ?',
    },
    template: `<cw-markdown class="max-w-md" [source]="source" />`,
  }),
};

/** Markup and dangerous links are shown as text, never run. */
export const UnsafeInput: Story = {
  render: () => ({
    props: {
      source: 'Texte <b>gras</b> <img src=x onerror="alert(1)"> et [lien](javascript:alert(1)).',
    },
    template: `<cw-markdown class="max-w-md" [source]="source" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: HTMLElement = light(canvasElement);
    await expect(scope.querySelector('img')).toBeNull();
    await expect(within(scope).queryByRole('link')).toBeNull();
  },
};
