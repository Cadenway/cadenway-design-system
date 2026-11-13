import { CwStatusIcon } from '@cadenway/ui/status-icon';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwChecklistAdd } from './checklist-add/checklist-add.component';
import { CwChecklist } from './checklist.component';
import { CwChecklistItem } from './checklist-item/checklist-item.component';

/**
 * Checklist, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy and items from the sheet's preview and the mockup (`App.dc.html`, task panel).
 */
const meta: Meta = {
  title: 'UI/Checklist',
  decorators: [
    moduleMetadata({ imports: [CwChecklist, CwChecklistItem, CwChecklistAdd, CwStatusIcon] }),
  ],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const ITEMS = `
  <cw-checklist-item itemId="a" label="Les accents sont conservés dans Excel" [checked]="true" />
  <cw-checklist-item itemId="b" label="Le séparateur suit la langue du compte" [checked]="true" />
  <cw-checklist-item itemId="c" label="Tester 10 000 lignes" [due]="due" [assignee]="karim">
    <cw-checklist-item itemId="c1" label="Excel 365" [checked]="true" />
    <cw-checklist-item itemId="c2" label="LibreOffice Calc" />
  </cw-checklist-item>
  <cw-checklist-item itemId="d" label="Documenter le format dans l'aide" />
  <cw-checklist-item itemId="e" label="Valider avec la Mairie de Lyon" disabled />`;

const PROPS = { due: new Date(2026, 10, 18), karim: { name: 'Karim Benali' } };

/** Items: ticked, assigned with a due date and two sub-items, disabled; the add row. */
export const Items: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `
      <cw-checklist class="w-[23.5rem]" title="Critères d'acceptation" convertible>
        ${ITEMS}
        <cw-checklist-add />
      </cw-checklist>`,
  }),
};

/** Editing: the label in a field at the same place, the help line in keys. */
export const Editing: Story = {
  render: () => ({
    template: `
      <cw-checklist class="w-[23.5rem]" title="Recette">
        <cw-checklist-item itemId="a" label="Mettre à jour le guide d'import" [editing]="true" />
        <cw-checklist-item itemId="b" label="Tester sur Safari" />
      </cw-checklist>`,
  }),
};

/** Completed items hidden: the toggle pressed, the footer counts them. */
export const HideCompleted: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `
      <cw-checklist class="w-[23.5rem]" title="Critères d'acceptation" [hideCompleted]="true">
        ${ITEMS}
      </cw-checklist>`,
  }),
};

/** Complete: « 2 / 2 » in jade, the bar full. */
export const Complete: Story = {
  render: () => ({
    template: `
      <cw-checklist class="w-[23.5rem]" title="Déploiement">
        <cw-checklist-item itemId="a" label="Migrer la base de recette" [checked]="true" />
        <cw-checklist-item itemId="b" label="Prévenir le support" [checked]="true" />
      </cw-checklist>`,
  }),
};

/** Collapsed: only the header stays, the chevron at 0°. */
export const Collapsed: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `
      <cw-checklist class="w-[23.5rem]" title="Critères d'acceptation" [expanded]="false">
        ${ITEMS}
      </cw-checklist>`,
  }),
};

/** Read-only: no handle, menu, edition nor add row. */
export const ReadOnly: Story = {
  render: () => ({
    props: { ...PROPS },
    template: `
      <cw-checklist class="w-[23.5rem]" title="Critères d'acceptation" readonly>
        ${ITEMS}
        <cw-checklist-add />
      </cw-checklist>`,
  }),
};

/** Subtasks: the consumer's status control, the reference, the title as a link, the assignee. */
export const Subtasks: Story = {
  render: () => ({
    props: { lea: { name: 'Léa Martin' }, karim: { name: 'Karim Benali' } },
    template: `
      <cw-checklist class="w-[23.5rem]" title="Sous-tâches" variant="subtasks" addLabel="Ajouter une sous-tâche">
        <cw-checklist-item itemId="CAD-483" label="Ajouter le BOM UTF-8 à l'export" reference="CAD-483"
          href="#CAD-483" [checked]="true" [assignee]="lea">
          <button cwChecklistItemStatus type="button" aria-label="Statut : Terminé"
            class="flex size-5 shrink-0 items-center justify-center rounded-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-hidden">
            <cw-status-icon status="done" />
          </button>
        </cw-checklist-item>
        <cw-checklist-item itemId="CAD-484" label="Choisir le séparateur selon la langue" reference="CAD-484"
          href="#CAD-484" [assignee]="karim">
          <button cwChecklistItemStatus type="button" aria-label="Statut : En cours"
            class="flex size-5 shrink-0 items-center justify-center rounded-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-hidden">
            <cw-status-icon status="progress" />
          </button>
        </cw-checklist-item>
        <cw-checklist-add placeholder="Ajouter une sous-tâche (Entrée)" />
      </cw-checklist>`,
  }),
};

/** Keyboard: Space grabs an item from its handle, ↑ moves it, the move is reported. */
export const Keyboard: Story = {
  render: () => ({
    props: { moved: '' },
    template: `
      <div class="grid w-[23.5rem] gap-2">
        <cw-checklist title="Recette" (itemMove)="moved = $event.id + ' → ' + $event.index">
          <cw-checklist-item itemId="safari" label="Tester sur Safari" />
          <cw-checklist-item itemId="firefox" label="Tester sur Firefox" />
        </cw-checklist>
        <p class="text-xs text-muted-foreground" role="status">{{ moved }}</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const handle = scope.getByRole('button', { name: 'Déplacer « Tester sur Firefox »' });
    handle.focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowUp}');
    await expect(scope.getByRole('status')).toHaveTextContent('firefox → 0');
    await userEvent.keyboard(' ');
  },
};
