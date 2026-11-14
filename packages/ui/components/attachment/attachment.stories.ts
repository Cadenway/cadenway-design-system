import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwAttachment } from './attachment.component';

/**
 * Constant meta
 *
 * @description
 * Attachment, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the mockup (`App.dc.html`, attachments tab and comments).
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/Attachment',
  decorators: [moduleMetadata({ imports: [CwAttachment] })],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook story for the attachment examples.
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
 * @param {HTMLElement} canvasElement - Story canvas containing the theme scopes.
 * @returns {HTMLElement} Container for the light theme.
 *
 * @throws {Error} When the light-theme container is missing.
 */
function light(canvasElement: HTMLElement): HTMLElement {
  const scope: HTMLElement | null =
    canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** The four types as cards: image, PDF, file (icon by extension), link (domain). */
export const Types: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-2xl grid-cols-2 gap-3">
        <cw-attachment name="capture-excel.png" [fileSize]="319488" href="#capture" />
        <cw-attachment name="specs-export.pdf" [fileSize]="2516582" href="#specs" />
        <cw-attachment name="export-taches.csv" [fileSize]="49152" href="#export" />
        <cw-attachment name="PR #412 · Forcer l'UTF-8" type="link" href="https://github.com/cadenway/web/pull/412" />
      </div>`,
  }),
};

/** Upload states: progress and cancel, preview generation, error with retry and remove. */
export const UploadStates: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-3xl grid-cols-3 gap-3">
        <cw-attachment name="export-sprint-14.csv" state="uploading" [progress]="64" />
        <cw-attachment name="guide-installation.pdf" state="processing" />
        <cw-attachment name="demo-import.mp4" state="error" error="Trop volumineux (max. 50 Mo)" />
      </div>`,
  }),
};

/** Compact chips of the composer, in every type and state. */
export const Compact: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-2xl flex-wrap gap-2">
        <cw-attachment size="sm" name="capture-excel.png" [fileSize]="319488" />
        <cw-attachment size="sm" name="specs-export.pdf" [fileSize]="2516582" />
        <cw-attachment size="sm" name="export-taches.csv" [fileSize]="49152" />
        <cw-attachment size="sm" name="PR #412" type="link" href="https://github.com/cadenway/web/pull/412" />
        <cw-attachment size="sm" name="export-sprint-14.csv" state="uploading" [progress]="64" />
        <cw-attachment size="sm" name="guide-installation.pdf" state="processing" />
        <cw-attachment size="sm" name="demo-import.mp4" state="error" />
      </div>`,
  }),
};

/** Thumbnails (`orientation="vertical"`): files, link, upload and error. */
export const Thumbnails: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-3">
        <cw-attachment orientation="vertical" name="maquette-calendrier.png" [fileSize]="1258291" />
        <cw-attachment orientation="vertical" name="specs-export.pdf" [fileSize]="2516582" />
        <cw-attachment orientation="vertical" name="export-taches.csv" [fileSize]="49152" />
        <cw-attachment orientation="vertical" name="PR #412 · Forcer l'UTF-8" type="link" href="https://github.com/cadenway/web/pull/412" />
        <cw-attachment orientation="vertical" name="vue-semaine.png" state="uploading" [progress]="40" />
        <cw-attachment orientation="vertical" name="demo-import.mp4" state="error" error="Trop volumineux" />
      </div>`,
  }),
};

/** Keyboard: Tab reaches the name, then the actions that appear with the focus. */
export const Keyboard: Story = {
  render: () => ({
    template: `<cw-attachment class="max-w-xs" name="specs-export.pdf" [fileSize]="2516582" href="#specs" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: {
      getByRole: (role: string, options: { name: string }) => HTMLElement;
    } = within(light(canvasElement));
    await userEvent.tab();
    await expect(scope.getByRole('link', { name: 'specs-export.pdf' })).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('link', { name: 'Télécharger specs-export.pdf' })).toHaveFocus();
    await userEvent.tab();
    await expect(scope.getByRole('button', { name: 'Retirer specs-export.pdf' })).toHaveFocus();
  },
};
