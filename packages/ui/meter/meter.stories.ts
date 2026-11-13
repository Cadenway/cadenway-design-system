import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CwMeter } from './meter/meter.component';
import type { CwMeterFormat, CwMeterZone } from './meter.types';

/**
 * Meter, every state of its sheet in the Design System artifact, in the light and the dark theme.
 * Copy from the sheet's "Dans Cadenway" section; the password strength from the mockup
 * (`Inscription.dc.html`).
 */
const meta: Meta = {
  title: 'UI/Meter',
  decorators: [moduleMetadata({ imports: [CwMeter] })],
};

export default meta;

type Story = StoryObj;

function light(canvasElement: HTMLElement): HTMLElement {
  const scope = canvasElement.querySelector<HTMLElement>('[data-theme="light"]');
  if (!scope) throw new Error('Light theme scope missing');
  return scope;
}

const decimal = (value: number): string =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
const gigabytes: CwMeterFormat = (value, max) => `${decimal(value)} Go sur ${decimal(max)} Go`;
const seats: CwMeterFormat = (value, max) => `${String(value)} sur ${String(max)}`;
const points: CwMeterFormat = (value) => `${String(value)} pts`;

/** The three forms: a continuous bar, whole blocks, series in one track with their legend. */
export const Variants: Story = {
  render: () => ({
    props: {
      gigabytes,
      seats,
      amount: (value: number) => `${decimal(value)} Go`,
      series: [
        { label: 'Pièces jointes', value: 4.1 },
        { label: 'Documents', value: 2.3 },
        { label: 'Autres', value: 0.8 },
      ],
    },
    template: `
      <div class="grid w-full max-w-4xl gap-8 lg:grid-cols-3">
        <cw-meter label="Stockage de l'instance" [value]="6.4" [max]="10" [format]="gigabytes" note="Barre — une valeur dans une plage" />
        <cw-meter label="Sièges" variant="segmented" [segments]="10" [value]="7" [max]="10" [format]="seats" />
        <cw-meter label="Stockage par type" variant="stacked" [value]="7.2" [max]="10" [format]="gigabytes" [formatAmount]="amount" [series]="series" />
      </div>`,
  }),
};

/** The four zones: normal, high from 80 %, critical from 95 %, optimum around the optimum. */
export const Zones: Story = {
  render: () => ({
    props: { points: (value: number, max: number) => `${String(value)} / ${String(max)} pts` },
    template: `
      <div class="grid w-full max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <cw-meter label="Appels à l'API" [value]="42" note="4 200 sur 10 000 ce mois-ci" />
        <cw-meter label="Stockage" [value]="82" note="Bientôt plein" />
        <cw-meter label="Membres invités" [value]="97" note="Limite presque atteinte" />
        <cw-meter label="Charge du sprint" [value]="40" [max]="45" [low]="30" [high]="45" [optimum]="40" [format]="points" note="Charge idéale" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = light(canvasElement);
    const zones = Array.from(scope.querySelectorAll('cw-meter')).map((meter) =>
      meter.getAttribute('data-zone'),
    );
    await expect(zones).toEqual(['normal', 'high', 'critical', 'optimum']);
  },
};

/** A capacity below the scale: the mark, the overrun in grenat and « +7 » in the header. */
export const ThresholdAndOverrun: Story = {
  render: () => ({
    props: { points, amount: (value: number) => (value === 60 ? '60 pts' : String(value)) },
    template: `
      <div class="w-full max-w-md">
        <cw-meter label="Charge du sprint 14" [value]="52" [max]="60" [threshold]="45" [format]="points" [formatAmount]="amount" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    await expect(within(light(canvasElement)).getByRole('meter')).toHaveAttribute(
      'aria-valuetext',
      '52 pts, +7',
    );
  },
};

/** The three track heights: 4, 6 and 10 px. */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-md grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-4 text-xs text-muted-foreground">
        <span>sm · 4 px</span><cw-meter size="sm" ariaLabel="Exemple sm" [value]="58" />
        <span>défaut · 6 px</span><cw-meter ariaLabel="Exemple défaut" [value]="58" />
        <span>lg · 10 px</span><cw-meter size="lg" ariaLabel="Exemple lg" [value]="58" />
      </div>`,
  }),
};

/** In a table cell: `sm`, fixed width, named by `ariaLabel`, the value written next to it. */
export const InTable: Story = {
  render: () => ({
    props: {
      rows: [
        { name: 'Léa Martin', load: 18 },
        { name: 'Karim Benali', load: 24 },
        { name: 'Inès Duval', load: 8 },
        { name: 'Samuel Roux', load: 19 },
      ],
    },
    template: `
      <table class="w-full max-w-sm text-sm">
        <thead>
          <tr class="border-b text-left text-xs text-muted-foreground">
            <th scope="col" class="pb-1.5 font-medium">Membre</th>
            <th scope="col" class="pb-1.5 font-medium">Charge du sprint</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.name) {
            <tr class="border-b last:border-0">
              <td class="py-1.5">{{ row.name }}</td>
              <td class="py-1.5">
                <div class="flex items-center gap-2">
                  <cw-meter class="w-20" size="sm" [value]="row.load" [max]="20" [ariaLabel]="'Charge de ' + row.name" />
                  <span class="w-12 text-right text-xs tabular-nums" [class.text-destructive]="row.load > 20" [class.text-muted-foreground]="row.load <= 20">{{ row.load }}/20</span>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>`,
  }),
};

const levels = ['Trop court', 'Faible', 'Moyen', 'Bon', 'Excellent'] as const;
// Meter sheet, "Dans Cadenway": four notches grenat, balise, foreground, jade. A low score is the bad
// one, the reverse of a quota, so the zone is given rather than derived from the value.
const strengthZones: readonly CwMeterZone[] = ['critical', 'critical', 'high', 'normal', 'optimum'];

/** The four rules of the mockup (`Inscription.dc.html`), one point each. */
function score(password: string): number {
  return [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

/**
 * Password strength (mockup `Inscription.dc.html`): `segmented` in four notches, the level written
 * above. A typed password shows at least one notch; the level is the `aria-valuetext`.
 */
export const PasswordStrength: Story = {
  render: () => ({
    props: {
      password: '',
      fixed: [1, 2, 3, 4].map((points) => ({
        points,
        zone: strengthZones[points],
        format: () => levels[points],
      })),
      score,
      level: (password: string) => levels[score(password)],
      notches: (password: string) => (password ? Math.max(score(password), 1) : 0),
      zone: (password: string) => strengthZones[score(password)],
      formatFor: (password: string) => () => levels[score(password)],
    },
    template: `
      <div class="grid w-full max-w-sm gap-6">
        <div class="grid grid-cols-[4.5rem_1fr] items-center gap-x-3 gap-y-3 text-xs">
          @for (row of fixed; track row.points) {
            <span class="text-muted-foreground">{{ row.format() }}</span>
            <cw-meter variant="segmented" size="sm" [segments]="4" [max]="4" [value]="row.points" [zone]="row.zone" [format]="row.format" ariaLabel="Robustesse du mot de passe" />
          }
        </div>
        <label class="grid gap-2">
          <span class="flex h-4 items-center justify-between gap-3">
            <span class="text-sm leading-none font-medium">Mot de passe</span>
            @if (password) {
              <span class="text-xs font-medium" [class.text-destructive]="score(password) <= 1" [class.text-muted-foreground]="score(password) === 2" [class.text-jade-text]="score(password) >= 3">{{ level(password) }}</span>
            }
          </span>
          <input type="password" autocomplete="new-password" placeholder="12 caractères minimum"
                 class="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
                 [value]="password" (input)="password = $any($event.target).value" />
        </label>
        <cw-meter variant="segmented" size="sm" [segments]="4" [max]="4" [value]="notches(password)" [zone]="zone(password)" [format]="formatFor(password)" ariaLabel="Robustesse du mot de passe" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    const field = scope.getByLabelText('Mot de passe');
    const meters = scope.getAllByRole('meter', { name: 'Robustesse du mot de passe' });
    const live = meters.at(-1);

    await userEvent.type(field, 'cadenway');
    await expect(live).toHaveAttribute('aria-valuetext', 'Trop court');
    await expect(live).toHaveAttribute('aria-valuenow', '1');
    await userEvent.type(field, 'Durable2026!');
    await expect(live).toHaveAttribute('aria-valuetext', 'Excellent');
    await expect(live).toHaveAttribute('aria-valuenow', '4');
  },
};

/** Loading (skeletons, `aria-busy`) and not measured (« — », « Aucune mesure »). */
export const States: Story = {
  render: () => ({
    template: `
      <div class="grid w-full max-w-sm gap-6">
        <cw-meter label="Chargement" [value]="null" loading />
        <cw-meter label="Non mesuré" [value]="null" note="Aucune donnée pour cette période" />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const scope = within(light(canvasElement));
    await expect(scope.getByRole('meter', { name: 'Non mesuré' })).toHaveAttribute(
      'aria-valuetext',
      'Aucune mesure',
    );
  },
};
