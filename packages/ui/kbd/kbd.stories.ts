import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwKbdGroup } from './kbd-group/kbd-group.directive';
import { CwKbd } from './kbd.directive';
import { CwShortcut } from './shortcut/shortcut.component';

/**
 * Kbd, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the mockup (`App.dc.html`) and the sheet.
 */
const meta: Meta = {
  title: 'UI/Kbd',
  decorators: [moduleMetadata({ imports: [CwKbd, CwKbdGroup, CwShortcut] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

/** Single keys: letters, named keys in full, arrows. */
export const Keys: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <kbd cwKbd>C</kbd><kbd cwKbd>?</kbd><kbd cwKbd>Échap</kbd><kbd cwKbd>Entrée</kbd>
        <kbd cwKbd>Tab</kbd><kbd cwKbd>Suppr</kbd><kbd cwKbd>↑</kbd><kbd cwKbd>↓</kbd>
      </div>`,
  }),
};

/** A combination (keys side by side, no « + ») and a sequence (« puis » between the steps). */
export const CombinationAndSequence: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
        <kbd cwKbdGroup><kbd cwKbd>Ctrl</kbd><kbd cwKbd>K</kbd></kbd>
        <span class="text-xs text-muted-foreground">Windows, Linux</span>
        <kbd cwKbdGroup><kbd cwKbd>⌘</kbd><kbd cwKbd>K</kbd></kbd>
        <span class="text-xs text-muted-foreground">macOS</span>
        <kbd cwKbdGroup><kbd cwKbd>Ctrl</kbd><kbd cwKbd>Maj</kbd><kbd cwKbd>P</kbd></kbd>
        <span class="text-xs text-muted-foreground">trois touches</span>
        <cw-shortcut keys="g i" />
        <span class="text-xs text-muted-foreground">séquence</span>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(light(canvasElement)).getByText('G puis I')).toBeInTheDocument();
  },
};

/** The three sizes: `sm` 16 px, `default` 18 px, `lg` 20 px. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex items-end gap-6">
        <cw-shortcut keys="ctrl+K" size="sm" />
        <cw-shortcut keys="ctrl+K" />
        <cw-shortcut keys="ctrl+K" size="lg" />
      </div>`,
  }),
};

/** In a menu item, on the right (`ml-auto`). */
export const InMenu: Story = {
  render: () => ({
    template: `
      <div class="w-60 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
        <div class="flex items-center gap-2 rounded-md bg-accent px-2 py-1.5 text-sm">
          Supprimer <cw-shortcut class="ml-auto" keys="delete" />
        </div>
      </div>`,
  }),
};

/** `inverse` inside a tooltip: name of the action, then its shortcut. */
export const InTooltip: Story = {
  render: () => ({
    template: `
      <div class="flex w-max items-center gap-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background dark:border dark:bg-popover dark:text-popover-foreground">
        Rechercher <cw-shortcut keys="mod+K" variant="inverse" size="sm" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(light(canvasElement)).getByText('Contrôle K')).toBeInTheDocument();
  },
};

/** In a sentence (`align-middle`) and in the shortcut help (`lg` in the help dialog). */
export const InText: Story = {
  render: () => ({
    template: `
      <div class="grid gap-3">
        <p class="text-sm text-muted-foreground">Appuyez sur <kbd cwKbd>?</kbd> pour afficher tous les raccourcis.</p>
        <dl class="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 text-sm [&>dd]:justify-self-end">
          <dt>Créer une tâche</dt><dd><cw-shortcut keys="c" size="lg" /></dd>
          <dt>Aller à la boîte de réception</dt><dd><cw-shortcut keys="g i" size="lg" /></dd>
          <dt>Fermer le panneau</dt><dd><cw-shortcut keys="esc" size="lg" /></dd>
        </dl>
      </div>`,
  }),
};
