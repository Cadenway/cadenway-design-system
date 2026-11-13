import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';

/**
 * The foundations of `@cadenway/tokens`, rendered in the light and the dark theme side by side:
 * colors, type scale, radii, shadows and motion. Values come from the Design System artifact
 * (`project/tokens.json` version 17); the play functions check that the variables resolve, which
 * proves the import order of `src/styles.css` and the `data-theme` switch.
 */
const meta: Meta = {
  title: 'Foundations',
};

export default meta;

type Story = StoryObj;

interface Swatch {
  readonly name: string;
  readonly utility: string;
  readonly role: string;
}

/** Primitive colors, in the order of tokens.json, with the Tailwind utility that paints them. */
const PRIMITIVES: readonly Swatch[] = [
  { name: 'canvas', utility: 'bg-canvas', role: 'App background behind panels' },
  { name: 'surface', utility: 'bg-surface', role: 'Panels, cards, sidebar' },
  { name: 'surface-muted', utility: 'bg-surface-muted', role: 'Hollows: Kbd, Skeleton' },
  { name: 'surface-overlay', utility: 'bg-surface-overlay', role: 'Menus, dialogs, toasts' },
  { name: 'stone', utility: 'bg-stone', role: 'Neutral fill: secondary' },
  { name: 'hover', utility: 'bg-hover', role: 'Hover veil' },
  { name: 'selected', utility: 'bg-selected', role: 'Selection veil' },
  { name: 'focus', utility: 'bg-focus', role: 'Keyboard focus ring' },
  { name: 'line', utility: 'bg-line', role: 'Separators, cards' },
  { name: 'line-strong', utility: 'bg-line-strong', role: 'Field borders' },
  { name: 'line-control', utility: 'bg-line-control', role: 'Checkbox, radio, switch off' },
  { name: 'track', utility: 'bg-track', role: 'Progress and slider tracks' },
  { name: 'ink', utility: 'bg-ink', role: 'Text' },
  { name: 'ink-muted', utility: 'bg-ink-muted', role: 'Secondary text' },
  { name: 'grenat', utility: 'bg-grenat', role: 'Blocked, urgent, destructive' },
  { name: 'grenat-soft', utility: 'bg-grenat-soft', role: 'Error alert background' },
  { name: 'grenat-text', utility: 'bg-grenat-text', role: 'Error text on canvas' },
  { name: 'amethyste', utility: 'bg-amethyste', role: 'Primary: links, active icon' },
  { name: 'balise', utility: 'bg-balise', role: 'In progress icon' },
  { name: 'jade', utility: 'bg-jade', role: 'Done, progress' },
  { name: 'jade-soft', utility: 'bg-jade-soft', role: 'Added diff lines' },
  { name: 'jade-text', utility: 'bg-jade-text', role: 'Green text' },
];

/** The eight hues the mockup adds for statuses, priorities, spaces and labels. */
const EXTENSION: readonly Swatch[] = [
  { name: 'cornaline', utility: 'bg-cornaline', role: 'In review, high priority' },
  { name: 'indigo', utility: 'bg-indigo', role: 'Space and label color' },
  { name: 'azur', utility: 'bg-azur', role: 'Space and label color' },
  { name: 'lagon', utility: 'bg-lagon', role: 'Space and label color' },
  { name: 'olive', utility: 'bg-olive', role: 'Space and label color' },
  { name: 'rose', utility: 'bg-rose', role: 'Space and label color' },
  { name: 'fuchsia', utility: 'bg-fuchsia', role: 'Space and label color' },
  { name: 'ardoise', utility: 'bg-ardoise', role: 'Space and label color' },
];

const THEMES = ['light', 'dark'] as const;

/** Renders a template once per theme, each inside its own `data-theme` scope. */
function inBothThemes(body: string): string {
  return `
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      @for (theme of themes; track theme) {
        <section [attr.data-theme]="theme" [attr.aria-label]="theme === 'light' ? 'Light theme' : 'Dark theme'"
                 class="rounded-xl bg-background p-6 text-foreground">
          <h2 class="mb-4 text-base font-semibold">{{ theme === 'light' ? 'Light' : 'Dark' }}</h2>
          ${body}
        </section>
      }
    </div>`;
}

const SWATCH_LIST = (list: string): string => `
  <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
    @for (swatch of ${list}; track swatch.name) {
      <li class="flex items-center gap-3">
        <span class="size-8 shrink-0 rounded-lg border border-border {{ swatch.utility }}" [attr.data-token]="swatch.name"></span>
        <span class="flex min-w-0 flex-col">
          <code class="font-mono text-xs">{{ swatch.name }}</code>
          <span class="text-xs text-muted-foreground">{{ swatch.role }}</span>
        </span>
      </li>
    }
  </ul>`;

/** Reads the background color a swatch resolves to in a given theme section. */
function swatchColor(root: HTMLElement, theme: string, token: string): string {
  const swatch = root.querySelector<HTMLElement>(`[data-theme="${theme}"] [data-token="${token}"]`);
  if (!swatch) throw new Error(`Swatch ${token} missing in the ${theme} theme`);
  return getComputedStyle(swatch).backgroundColor;
}

/** Every primitive color of tokens.json, light and dark. */
export const Colors: Story = {
  render: () => ({
    props: { themes: THEMES, primitives: PRIMITIVES },
    template: inBothThemes(SWATCH_LIST('primitives')),
  }),
  play: async ({ canvasElement }) => {
    // tokens.json v17: canvas #f3f4f6 in light, #0d0d10 in dark.
    await expect(swatchColor(canvasElement, 'light', 'canvas')).toBe('rgb(243, 244, 246)');
    await expect(swatchColor(canvasElement, 'dark', 'canvas')).toBe('rgb(13, 13, 16)');
  },
};

/** The mockup's extension hues, absent from tokens.json. */
export const ExtensionHues: Story = {
  render: () => ({
    props: { themes: THEMES, extension: EXTENSION },
    template: inBothThemes(SWATCH_LIST('extension')),
  }),
  play: async ({ canvasElement }) => {
    // Mockup styles/app.css: cornaline #ea580c in light, #fb923c in dark.
    await expect(swatchColor(canvasElement, 'light', 'cornaline')).toBe('rgb(234, 88, 12)');
    await expect(swatchColor(canvasElement, 'dark', 'cornaline')).toBe('rgb(251, 146, 60)');
  },
};

/** The type styles of tokens.json over the recalibrated Tailwind text scale. */
export const Typography: Story = {
  render: () => ({
    props: { themes: THEMES },
    template: inBothThemes(`
      <div class="flex flex-col gap-3">
        <p class="text-2xl font-semibold tracking-tight">Sprint 14</p>
        <p class="text-base font-semibold">Sous-tâches</p>
        <p class="text-sm">Préparer la maquette de l'accueil avant la revue de jeudi.</p>
        <p class="text-sm font-medium">Corriger l'export CSV des tâches</p>
        <p class="text-xs text-muted-foreground">Échéance 14 nov. · 3 sous-tâches</p>
        <p class="font-mono text-xs">CAD-482</p>
      </div>`),
  }),
  play: async ({ canvas }) => {
    const body = canvas.getAllByText(
      "Préparer la maquette de l'accueil avant la revue de jeudi.",
    )[0];
    await expect(body).toHaveStyle({ fontSize: '13px', lineHeight: '20px' });
  },
};

/** The four radii; nothing above `rounded-xl`. */
export const Radii: Story = {
  render: () => ({
    props: {
      themes: THEMES,
      radii: [
        { utility: 'rounded-sm', value: '3 px' },
        { utility: 'rounded-md', value: '4 px' },
        { utility: 'rounded-lg', value: '6 px' },
        { utility: 'rounded-xl', value: '8 px' },
      ],
    },
    template: inBothThemes(`
      <ul class="flex flex-wrap gap-4">
        @for (radius of radii; track radius.utility) {
          <li class="flex flex-col items-center gap-2">
            <span class="size-14 border border-line-strong bg-muted {{ radius.utility }}"></span>
            <code class="font-mono text-xs">{{ radius.utility }}</code>
            <span class="text-xs text-muted-foreground">{{ radius.value }}</span>
          </li>
        }
      </ul>`),
  }),
};

/** The five elevation levels, on the canvas they float over. */
export const Shadows: Story = {
  render: () => ({
    props: {
      themes: THEMES,
      levels: [
        { utility: 'shadow-xs', role: 'Slider thumb, switch knob' },
        { utility: 'shadow-sm', role: 'Tooltip' },
        { utility: 'shadow-md', role: 'Menus, Select, Popover' },
        { utility: 'shadow-lg', role: 'Toasts, lifted card' },
        { utility: 'shadow-xl', role: 'Dialog, command palette' },
      ],
    },
    template: inBothThemes(`
      <ul class="grid grid-cols-2 gap-6 rounded-lg bg-canvas p-6 sm:grid-cols-3">
        @for (level of levels; track level.utility) {
          <li class="flex flex-col gap-1 rounded-xl bg-popover p-4 {{ level.utility }}">
            <code class="font-mono text-xs">{{ level.utility }}</code>
            <span class="text-xs text-muted-foreground">{{ level.role }}</span>
          </li>
        }
      </ul>`),
  }),
};

/** Each entrance animation, replayed by remounting; all off under reduced motion. */
export const Motion: Story = {
  render: () => ({
    props: {
      themes: THEMES,
      animations: [
        { utility: 'animate-menu-in', role: 'Menus, Select, Popover · 300 ms' },
        { utility: 'animate-item-in', role: 'Menu and list items · 340 ms' },
        { utility: 'animate-pop-in', role: 'Dialog, palette, Tooltip · 260 ms' },
        { utility: 'animate-fade-in', role: 'Backdrops · 200 ms' },
        { utility: 'animate-row-in', role: 'Task moved to another group · 460 ms' },
        { utility: 'animate-skeleton', role: 'Skeleton pulse · 1.6 s' },
      ],
    },
    template: inBothThemes(`
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        @for (animation of animations; track animation.utility) {
          <li class="flex flex-col gap-1 rounded-lg border border-border bg-popover p-3 shadow-md {{ animation.utility }}">
            <code class="font-mono text-xs">{{ animation.utility }}</code>
            <span class="text-xs text-muted-foreground">{{ animation.role }}</span>
          </li>
        }
      </ul>`),
  }),
};
