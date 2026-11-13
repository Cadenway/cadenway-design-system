import { Clipboard } from '@angular/cdk/clipboard';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwCodeBlock } from './code-block/code-block.component';

/**
 * Code Block, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the sheet's preview (Docker Compose diff, automation log, install guide).
 */
const meta: Meta = {
  title: 'UI/CodeBlock',
  decorators: [moduleMetadata({ imports: [CwCodeBlock] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const compose = [
  '# Cadenway — instance de production',
  'services:',
  '  cadenway:',
  '-    image: ghcr.io/cadenway/cadenway:1.3.2',
  '+    image: ghcr.io/cadenway/cadenway:1.4.0',
  '    ports:',
  '      - "8080:8080"',
  '    environment:',
  '      DATABASE_URL: postgres://cadenway@db/cadenway',
].join('\n');

const install =
  'curl -fsSL https://cadenway.exemple.fr/install.sh | CADENWAY_VERSION=1.4.0 sh -s -- --data /srv/cadenway';

/** Header, line numbers, a comment, a diff and a line put forward. */
export const Default: Story = {
  render: () => ({
    props: { compose },
    template: `
      <cw-code-block class="w-full max-w-xl" filename="docker-compose.yml" language="yaml" diff [highlight]="[5]" [code]="compose" />`,
  }),
};

/** The log of a failed run: grenat frame and header, the error line in the error color. */
export const Destructive: Story = {
  render: () => ({
    props: {
      log: '› Connexion à la base…\nError: connect ECONNREFUSED 10.0.0.4:5432',
    },
    template: `
      <cw-code-block class="w-full max-w-md" variant="destructive" filename="Clore les tâches terminées — échec" [lineNumbers]="false" [highlight]="[2]" [code]="log" />`,
  }),
};

/** A terminal: `sm`, without numbers. */
export const Terminal: Story = {
  render: () => ({
    template: `
      <cw-code-block class="w-full max-w-md" size="sm" [lineNumbers]="false" filename="Terminal" language="bash" code="docker compose pull&#10;docker compose up -d" />`,
  }),
};

/** A long line scrolls (the area takes the focus); with `wrap` it folds. */
export const LongLine: Story = {
  render: () => ({
    props: { install },
    template: `
      <div class="grid w-full max-w-sm gap-4">
        <cw-code-block size="sm" [lineNumbers]="false" filename="install.sh" [code]="install" />
        <cw-code-block size="sm" [lineNumbers]="false" filename="install.sh" wrap ariaLabel="install.sh replié, 1 ligne" [code]="install" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getAllByRole('button', { name: 'Copier le code' })[0]).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('group', { name: 'install.sh, 1 ligne' })).toHaveFocus();
  },
};

/**
 * Copy: Enter on the button shows « Copié », then the button comes back after 2 s. The clipboard is
 * stubbed here: a scripted key press carries no user activation, so the browser would refuse the
 * real copy and the story would not reach the copied state.
 */
export const Copy: Story = {
  decorators: [
    applicationConfig({ providers: [{ provide: Clipboard, useValue: { copy: () => true } }] }),
  ],
  render: () => ({
    props: { copies: 0 },
    template: `
      <div class="grid w-full max-w-md gap-2">
        <cw-code-block size="sm" [lineNumbers]="false" language="bash" code="docker compose up -d" (copied)="copies = copies + 1" />
        <p class="text-sm text-muted-foreground">{{ copies }} copie(s)</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(scope.getByRole('button', { name: 'Copié' })).toHaveAttribute(
      'data-state',
      'copied',
    );
    await expect(scope.getByText('1 copie(s)')).toBeVisible();
  },
};
