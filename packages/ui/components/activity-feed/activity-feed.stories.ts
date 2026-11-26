import { CwButton } from '@cadenway/ui/components/button';
import { CwStatusIcon } from '@cadenway/ui/components/status-icon';
import { provideCwLocale } from '@cadenway/ui/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorArrowRightBold, phosphorClipboardTextBold } from '@ng-icons/phosphor-icons/bold';
import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { CwActivityDetailDef } from './activity-detail/activity-detail.directive';
import { CwActivityFeed } from './activity-feed.component';
import { CwActivityFeedEmpty } from './activity-feed-empty/activity-feed-empty.directive';
import { CwActivitySummaryDef } from './activity-summary/activity-summary.directive';
import type { CwActivityEntry } from './activity-feed.types';

/**
 * Constant meta
 *
 * @description
 * Activity feed states from the list activity view of the mockup (`App.dc.html`), in both themes.
 *
 * @type {Meta}
 */
const meta: Meta = {
  title: 'UI/ActivityFeed',
  decorators: [
    moduleMetadata({
      imports: [
        CwActivityDetailDef,
        CwActivityFeed,
        CwActivityFeedEmpty,
        CwActivitySummaryDef,
        CwButton,
        CwStatusIcon,
        NgIcon,
      ],
    }),
    applicationConfig({
      providers: [
        provideCwLocale('fr-FR'),
        provideIcons({ phosphorArrowRightBold, phosphorClipboardTextBold }),
      ],
    }),
  ],
};

export default meta;

/**
 * Type Story
 *
 * @description
 * Storybook configuration for activity feed examples.
 *
 * @type {StoryObj}
 */
type Story = StoryObj;

/**
 * Interface Task
 *
 * @description
 * The task behind an entry of the examples.
 */
interface Task {
  // #region Properties
  /**
   * Property key
   *
   * @description
   * Task key.
   *
   * @type {string}
   * @readonly
   */
  readonly key: string;

  /**
   * Property name
   *
   * @description
   * Task name.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property status
   *
   * @description
   * Current status key of the task.
   *
   * @type {string}
   * @readonly
   */
  readonly status: string;

  /**
   * Property change
   *
   * @description
   * A status change, drawn with its icons by the summary template.
   *
   * @type {{ from: string; fromLabel: string; to: string; toLabel: string } | undefined}
   * @readonly
   */
  readonly change?: { from: string; fromLabel: string; to: string; toLabel: string };
  // #endregion
}

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
 * Constant NOW
 *
 * @description
 * Reference time of the examples: Thursday 26 November 2026, 15:00.
 *
 * @type {Date}
 */
const NOW: Date = new Date(2026, 10, 26, 15, 0);

/**
 * Constant ENTRIES
 *
 * @description
 * Activity of a list over three days (mockup `App.dc.html`, list activity copy).
 *
 * @type {readonly CwActivityEntry<Task>[]}
 */
const ENTRIES: readonly CwActivityEntry<Task>[] = [
  {
    id: 'e1',
    at: new Date(2026, 10, 26, 14, 5),
    actor: { name: 'Camille Martin' },
    summary: ['a changé le statut'],
    data: {
      key: 'CAD-482',
      name: "Corriger l'export CSV des tâches",
      status: 'done',
      change: { from: 'progress', fromLabel: 'En cours', to: 'done', toLabel: 'Terminé' },
    },
  },
  {
    id: 'e2',
    at: new Date(2026, 10, 26, 11, 20),
    actor: { name: 'Inès Roux' },
    summary: ['a passé la priorité à', { text: 'Haute' }],
    data: { key: 'CAD-479', name: 'Maquetter la vue Calendrier', status: 'progress' },
  },
  {
    id: 'e3',
    at: new Date(2026, 10, 26, 9, 2),
    actor: { name: 'Formulaire public', icon: 'phosphorClipboardTextBold' },
    summary: ['a envoyé une demande par le formulaire'],
    data: { key: 'CAD-501', name: 'Accès au portail client', status: 'triage' },
  },
  {
    id: 'e4',
    at: new Date(2026, 10, 25, 17, 45),
    actor: { name: 'Hugo Durand' },
    summary: ['a commenté'],
    quote: 'Je reprends le parcours d’import demain matin, la migration est prête.',
    data: { key: 'CAD-471', name: 'Migrer les pièces jointes', status: 'blocked' },
  },
  {
    id: 'e5',
    at: new Date(2026, 10, 23, 10, 0),
    actor: { name: 'Léa Petit' },
    summary: ['a déplacé l’échéance', { text: '20 nov. → 27 nov.' }],
    data: { key: 'CAD-488', name: 'Importer les espaces', status: 'todo' },
  },
];

/* The task chip and the status change of the mockup (`App.dc.html`, list activity). */
/**
 * Constant TEMPLATES
 *
 * @description
 * Summary and detail templates of the examples.
 *
 * @type {string}
 */
const TEMPLATES: string = `
  <ng-template cwActivitySummary let-entry let-task="data">
    @for (part of entry.summary; track $index) {
      <span [class]="part.text ? 'font-medium' : 'text-muted-foreground'">{{ part.text ?? part }}</span>
    }
    @if (task.change; as change) {
      <span class="inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground">
        <cw-status-icon [status]="change.from" />{{ change.fromLabel }}
      </span>
      <ng-icon name="phosphorArrowRightBold" class="text-muted-foreground [--ng-icon__size:0.75rem]" aria-hidden="true" />
      <span class="sr-only">à</span>
      <span class="inline-flex items-center gap-1 font-medium whitespace-nowrap">
        <cw-status-icon [status]="change.to" />{{ change.toLabel }}
      </span>
    }
  </ng-template>
  <ng-template cwActivityDetail let-task="data">
    <button type="button"
            class="inline-flex h-6 min-w-0 max-w-full items-center gap-1.5 rounded-md border bg-card px-1.5 text-xs hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <cw-status-icon [status]="task.status" size="3" />
      <span class="shrink-0 font-mono text-muted-foreground">{{ task.key }}</span>
      <span class="min-w-0 truncate">{{ task.name }}</span>
    </button>
  </ng-template>`;

/** The list's Activity view: entries grouped by day under « Aujourd’hui », « Hier » and the long day, with their counts. */
export const ListActivity: Story = {
  render: () => ({
    props: { entries: ENTRIES, now: NOW },
    template: `
      <cw-activity-feed class="max-w-3xl" [entries]="entries" groupByDay [now]="now">
        ${TEMPLATES}
      </cw-activity-feed>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: HTMLElement = light(canvasElement);
    await expect(within(scope).getByRole('heading', { name: /Aujourd’hui/ })).toBeVisible();
    await expect(within(scope).getByRole('heading', { name: /Lundi 23 novembre/ })).toBeVisible();
    await expect(within(scope).getByRole('group', { name: /Hier/ })).toBeVisible();
  },
};

/** The task detail's Activity tab: one list, short dates and times, the plain summaries. */
export const TaskActivity: Story = {
  render: () => ({
    props: { entries: ENTRIES.slice(1) },
    template: `
      <cw-activity-feed class="max-w-xl" [entries]="entries" ariaLabel="Activité de CAD-479" />`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(
      within(light(canvasElement)).getByRole('list', { name: 'Activité de CAD-479' }),
    ).toBeVisible();
  },
};

/** Loading: skeleton entries, `aria-busy`. */
export const Loading: Story = {
  render: () => ({
    props: {},
    template: `<cw-activity-feed class="max-w-3xl" [entries]="[]" loading />`,
  }),
};

/** Empty, filtered: the title and « Effacer les filtres ». */
export const Empty: Story = {
  render: () => ({
    props: {},
    template: `
      <cw-activity-feed class="max-w-3xl" [entries]="[]">
        <button cwActivityFeedEmpty cwButton variant="outline" size="sm">Effacer les filtres</button>
      </cw-activity-feed>`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scope: HTMLElement = light(canvasElement);
    await expect(within(scope).getByRole('status')).toHaveTextContent(
      'Aucune activité ne correspond',
    );
    await expect(within(scope).getByRole('button', { name: 'Effacer les filtres' })).toBeVisible();
  },
};
