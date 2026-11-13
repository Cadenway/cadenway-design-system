import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwAvatarAdd } from './avatar-add.component';
import { CwAvatarGroup } from './avatar-group.component';
import { CwAvatar } from './avatar.component';

/**
 * Avatar, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Names and copy from the sheet's preview (comment author, Assignés field).
 */
const meta: Meta = {
  title: 'UI/Avatar',
  decorators: [moduleMetadata({ imports: [CwAvatar, CwAvatarGroup, CwAvatarAdd] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/* A neutral portrait standing for a profile photo; it is picture content, not interface color. */
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
    "<rect width='64' height='64' fill='hsl(0 0% 70%)'/>" +
    "<path d='M9 64c1.6-12.5 10.5-19.5 23-19.5S53.4 51.5 55 64z' fill='hsl(0 0% 25%)'/>" +
    "<ellipse cx='32' cy='27' rx='10.5' ry='12.2' fill='hsl(0 0% 91%)'/>" +
    '</svg>',
)}`;

/** The four sizes, 20 to 40 px. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-5">
        <cw-avatar name="Léa Martin" size="xs" />
        <cw-avatar name="Léa Martin" size="sm" />
        <cw-avatar name="Léa Martin" />
        <cw-avatar name="Léa Martin" size="lg" />
      </div>`,
  }),
};

/** Photo, initials, fallback icon and the « Non assigné » button. */
export const Content: Story = {
  render: () => ({
    props: { photo: PHOTO },
    template: `
      <div class="flex items-end gap-5">
        <cw-avatar name="Inès Duval" [src]="photo" />
        <cw-avatar name="Karim Benali" />
        <cw-avatar />
        <button cwAvatarAdd></button>
      </div>`,
  }),
};

/** A photo that fails: back to the initials. */
export const ImageError: Story = {
  render: () => ({
    template: `<cw-avatar name="Karim Benali" src="data:image/png;base64,AAAA" />`,
  }),
};

/** Presence: online, away, offline; always in the hidden text and the title. */
export const Presence: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-5">
        <cw-avatar name="Samuel Roux" presence="online" />
        <cw-avatar name="Léa Martin" presence="away" />
        <cw-avatar name="Karim Benali" />
      </div>`,
  }),
};

/** A deactivated account. */
export const Disabled: Story = {
  render: () => ({
    template: `<cw-avatar name="Samuel Roux" disabled />`,
  }),
  parameters: {
    // The Avatar sheet dims a deactivated account to 50 %. The initials are decorative
    // (aria-hidden): the name and « (désactivé) » reach assistive technologies through the hidden
    // text, so the dimmed initials are exempt from the text contrast rule.
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', selector: '[aria-hidden="true"]', enabled: false }],
      },
    },
  },
};

/** Stacks of every size: three at most, then « +N » naming the hidden people. */
export const Group: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-5">
        <cw-avatar-group size="xs">
          <cw-avatar name="Inès Duval" /><cw-avatar name="Léa Martin" /><cw-avatar name="Karim Benali" /><cw-avatar name="Samuel Roux" />
        </cw-avatar-group>
        <cw-avatar-group>
          <cw-avatar name="Inès Duval" /><cw-avatar name="Léa Martin" /><cw-avatar name="Karim Benali" /><cw-avatar name="Samuel Roux" />
        </cw-avatar-group>
        <cw-avatar-group size="default" [max]="2">
          <cw-avatar name="Inès Duval" /><cw-avatar name="Léa Martin" /><cw-avatar name="Karim Benali" /><cw-avatar name="Samuel Roux" />
        </cw-avatar-group>
        <cw-avatar-group size="lg" [max]="2">
          <cw-avatar name="Inès Duval" /><cw-avatar name="Léa Martin" /><cw-avatar name="Karim Benali" /><cw-avatar name="Samuel Roux" />
        </cw-avatar-group>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const stacks = within(light(canvasElement)).getAllByRole('group', { name: 'Assignés' });

    await expect(stacks[0]).toHaveTextContent('et Samuel Roux');
    await expect(stacks[2]).toHaveTextContent('et Karim Benali, Samuel Roux');
  },
};

/** The Assignés field: a stack, or « Non assigné » when nobody is assigned. */
export const AssigneesField: Story = {
  render: () => ({
    template: `
      <div class="grid gap-3">
        <div class="flex items-center gap-3">
          <span class="w-20 text-sm text-muted-foreground">Assignés</span>
          <cw-avatar-group>
            <cw-avatar name="Léa Martin" /><cw-avatar name="Karim Benali" />
          </cw-avatar-group>
        </div>
        <div class="flex items-center gap-3">
          <span class="w-20 text-sm text-muted-foreground">Assignés</span>
          <cw-avatar-group><button cwAvatarAdd></button></cw-avatar-group>
        </div>
      </div>`,
  }),
};

/** A comment author: `default` size next to the name and time. */
export const CommentAuthor: Story = {
  render: () => ({
    template: `
      <div class="flex items-start gap-2.5">
        <cw-avatar name="Inès Duval" />
        <div class="grid min-w-0 gap-0.5">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">Inès Duval</span>
            <span class="text-xs text-muted-foreground">il y a 5 min</span>
          </div>
          <p class="text-sm">L'export est relu : il manque la colonne Échéance.</p>
        </div>
      </div>`,
  }),
};

/** Keyboard: Tab reaches « Non assigné », Enter activates it; a plain avatar is not focusable. */
export const Keyboard: Story = {
  render: () => ({
    props: { picks: 0 },
    template: `
      <div class="flex items-center gap-3">
        <cw-avatar name="Inès Duval" />
        <button cwAvatarAdd (click)="picks = picks + 1"></button>
        <span class="text-sm text-muted-foreground" role="status">{{ picks }} ouverture(s)</span>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));

    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Assigner' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByRole('status')).toHaveTextContent('1 ouverture(s)');
  },
};
