import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CwDropzone } from './dropzone.component';
import { CwDropzoneFile } from './dropzone-file/dropzone-file.component';

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Missing element');
  return value;
}

/**
 * Dropzone, every state of its sheet in the Design System artifact, in the light and the dark
 * theme. Copy from the mockup (`App.dc.html`, attachments tab and request form).
 */
const meta: Meta = {
  title: 'UI/Dropzone',
  decorators: [moduleMetadata({ imports: [CwDropzone, CwDropzoneFile] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

function dragOver(zone: Element, files: File[]): void {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  zone.dispatchEvent(
    new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: transfer }),
  );
}

/** At rest: icon tile, title, « parcourez » and the limit. */
export const Idle: Story = {
  render: () => ({
    template: `<cw-dropzone class="max-w-sm" accept=".png,.jpg,.pdf,.fig,.csv" />`,
  }),
};

/** Compact: one 48 px line, under a comment composer. */
export const Compact: Story = {
  render: () => ({
    template: `<cw-dropzone class="max-w-md" size="compact" />`,
  }),
};

/** Files dragged over the zone: « Relâchez pour joindre » and their number. */
export const DragOver: Story = {
  render: () => ({
    template: `<cw-dropzone class="max-w-sm" accept=".png,.pdf" />`,
  }),
  play: async ({ canvasElement }) => {
    const zone = required(light(canvasElement).querySelector('cw-dropzone'));
    dragOver(zone, [
      new File(['a'], 'capture.png', { type: 'image/png' }),
      new File(['b'], 'specs.pdf', { type: 'application/pdf' }),
    ]);

    await waitFor(() => expect(zone).toHaveAttribute('data-state', 'over'));
    await expect(zone).toHaveTextContent('2 fichiers');
  },
};

/** A refused type dragged over the zone: error tone, announced as an alert. */
export const RejectWhileDragging: Story = {
  render: () => ({
    template: `<cw-dropzone class="max-w-sm" accept=".png,.pdf" />`,
  }),
  play: async ({ canvasElement }) => {
    const zone = required(light(canvasElement).querySelector('cw-dropzone'));
    dragOver(zone, [new File(['a'], 'installateur.exe', { type: 'application/x-msdownload' })]);

    await waitFor(() => expect(zone).toHaveAttribute('data-state', 'reject'));
    await expect(zone).toHaveAttribute('role', 'alert');
  },
};

/** Keyboard: Tab reaches « parcourez » and the whole zone shows the focus ring. */
export const Keyboard: Story = {
  render: () => ({
    template: `<cw-dropzone class="max-w-sm" />`,
  }),
  play: async ({ canvasElement }) => {
    const browse = within(light(canvasElement)).getByRole('button', {
      name: 'parcourez les fichiers (50 Mo max.)',
    });
    await userEvent.tab();
    await expect(browse).toHaveFocus();
  },
};

/** Disabled once the limit is reached: « Limite atteinte : 10 fichiers », `aria-disabled`. */
export const LimitReached: Story = {
  render: () => ({
    template: `
      <div class="grid max-w-md gap-3">
        <cw-dropzone [maxFiles]="10" [fileCount]="10" />
        <cw-dropzone size="compact" [maxFiles]="10" [fileCount]="10" />
      </div>`,
  }),
};

/** The upload queue: sent, uploading and queued files. */
export const UploadQueue: Story = {
  render: () => ({
    template: `
      <ul class="grid max-w-md gap-2">
        <cw-dropzone-file name="maquette-accueil.fig" [size]="2516582" state="done" />
        <cw-dropzone-file name="export-taches.csv" [size]="499712" state="uploading" [progress]="64" />
        <cw-dropzone-file name="captures-sprint-14.zip" [size]="7340032" state="queued" />
      </ul>`,
  }),
};

/** Errors: size and type refused locally (remove only), network error (retry and remove). */
export const Errors: Story = {
  render: () => ({
    template: `
      <ul class="grid max-w-md gap-2">
        <cw-dropzone-file name="demo-import.mp4" [size]="85983232" state="error" error="Trop volumineux : 50 Mo maximum." />
        <cw-dropzone-file name="installateur.exe" [size]="4194304" state="error" error="Type non accepté." />
        <cw-dropzone-file name="rapport-sprint.pdf" [size]="1153434" state="error" error="Envoi interrompu : connexion perdue." retryable />
      </ul>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(
      scope.getByRole('button', { name: "Réessayer l'envoi de rapport-sprint.pdf" }),
    ).toBeInTheDocument();
  },
};
