import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CwButton } from '@cadenway/ui/button';
import { CwCheckbox } from '@cadenway/ui/checkbox';
import { CwInput } from '@cadenway/ui/input';
import { CwSwitch } from '@cadenway/ui/switch';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwFieldContent } from './field-content/field-content.component';
import { CwFieldDescription } from './field-description/field-description.component';
import { CwFieldError } from './field-error/field-error.component';
import { CwFieldGroup } from './field-group/field-group.component';
import { CwFieldLabel } from './field-label/field-label.directive';
import { CwFieldLegend } from './field-legend/field-legend.directive';
import { CwFieldSeparator } from './field-separator/field-separator.component';
import { CwFieldSet } from './field-set/field-set.directive';
import { CwFieldTitle } from './field-title/field-title.component';
import { CwField } from './field.component';

/**
 * Field, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet and the mockup (space creation and settings in `App.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Field',
  decorators: [
    moduleMetadata({
      imports: [
        CwField,
        CwFieldContent,
        CwFieldDescription,
        CwFieldError,
        CwFieldGroup,
        CwFieldLabel,
        CwFieldLegend,
        CwFieldSeparator,
        CwFieldSet,
        CwFieldTitle,
        CwButton,
        CwCheckbox,
        CwInput,
        CwSwitch,
        ReactiveFormsModule,
      ],
    }),
  ],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** A set under its legend: vertical fields, an error, a separator, a horizontal switch. */
export const FieldSet: Story = {
  render: () => ({
    template: `
      <form class="w-96" (submit)="$event.preventDefault()">
        <fieldset cwFieldSet>
          <legend cwFieldLegend>Nouvel espace</legend>
          <cw-field-description>Un espace regroupe les listes, tableaux et sprints d'une équipe.</cw-field-description>
          <cw-field-group>
            <cw-field>
              <label cwFieldLabel>Nom</label>
              <input cwInput value="Produit" />
            </cw-field>
            <cw-field invalid>
              <label cwFieldLabel>Préfixe des identifiants</label>
              <input cwInput value="CAD" />
              <cw-field-description>2 à 6 lettres majuscules.</cw-field-description>
              <cw-field-error>Ce préfixe est déjà utilisé par l'espace « Plateforme ».</cw-field-error>
            </cw-field>
            <cw-field-separator />
            <cw-field orientation="horizontal">
              <cw-field-content>
                <label cwFieldLabel>Espace privé</label>
                <cw-field-description>Visible uniquement par ses membres.</cw-field-description>
              </cw-field-content>
              <cw-switch [checked]="true" />
            </cw-field>
          </cw-field-group>
          <div class="flex justify-end gap-2 pt-1">
            <button cwButton variant="outline">Annuler</button>
            <button cwButton type="submit">Créer l'espace</button>
          </div>
        </fieldset>
      </form>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));

    await expect(scope.getByRole('group', { name: 'Nouvel espace' })).toBeInTheDocument();
    await expect(scope.getByLabelText('Préfixe des identifiants')).toHaveAccessibleDescription(
      "2 à 6 lettres majuscules. Ce préfixe est déjà utilisé par l'espace « Plateforme ».",
    );
    await expect(scope.getByRole('switch', { name: 'Espace privé' })).toHaveAccessibleDescription(
      'Visible uniquement par ses membres.',
    );
  },
};

/** Horizontal: the box, then its label and description on the first line. */
export const Horizontal: Story = {
  render: () => ({
    template: `
      <cw-field orientation="horizontal" class="w-96">
        <cw-checkbox [checked]="true" />
        <cw-field-content>
          <label cwFieldLabel>Notifier les membres</label>
          <cw-field-description>Un e-mail annonce la création de l'espace.</cw-field-description>
        </cw-field-content>
      </cw-field>`,
  }),
};

/** Choice cards: the label wraps its checkbox; selected, the card turns `bg-selected`. */
export const ChoiceCards: Story = {
  render: () => ({
    template: `
      <div class="grid w-[28rem] grid-cols-2 gap-3">
        <label cwFieldLabel variant="card">
          <cw-checkbox class="mt-0.5" />
          <cw-field-content>
            <cw-field-title>Tableau</cw-field-title>
            <span class="text-xs text-muted-foreground">Colonnes par statut.</span>
          </cw-field-content>
        </label>
        <label cwFieldLabel variant="card">
          <cw-checkbox class="mt-0.5" [checked]="true" />
          <cw-field-content>
            <cw-field-title>Calendrier</cw-field-title>
            <span class="text-xs text-muted-foreground">Tâches par échéance.</span>
          </cw-field-content>
        </label>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const board = within(light(canvasElement)).getByRole('checkbox', { name: /Tableau/ });

    await userEvent.click(board);
    await expect(board).toHaveAttribute('aria-checked', 'true');
  },
};

/** Disabled: the whole field at 50 %. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <cw-field disabled class="w-96">
        <label cwFieldLabel>Propriétaire</label>
        <input cwInput value="Léa Martin" disabled />
        <cw-field-description>Seul un administrateur peut changer le propriétaire.</cw-field-description>
      </cw-field>`,
  }),
};

/** Validation: the error appears once the invalid field is left, and describes the control. */
export const Validation: Story = {
  render: () => ({
    props: {
      prefix: new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      }),
      messages: { required: 'Indiquez un préfixe de 2 à 6 lettres majuscules.' },
    },
    template: `
      <cw-field class="w-96">
        <label cwFieldLabel>Préfixe des identifiants</label>
        <input cwInput [formControl]="prefix" />
        <cw-field-error [errors]="prefix.errors" [messages]="messages" />
      </cw-field>`,
  }),
  play: async ({ canvasElement }) => {
    const prefix = within(light(canvasElement)).getByLabelText('Préfixe des identifiants');

    await userEvent.click(prefix);
    await userEvent.tab();
    await expect(prefix).toHaveAttribute('aria-invalid', 'true');
    await expect(prefix).toHaveAccessibleDescription(
      'Indiquez un préfixe de 2 à 6 lettres majuscules.',
    );
  },
};
