import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwFilterBar } from './filter-bar.component';
import type { CwFilter, CwFilterField, CwSavedFilter } from './filter-bar.types';
import { CwFilterValueDef } from './filter-value/filter-value.directive';

/* The mockup's fields (`App.dc.html`), given as data: the bar knows none of them. */
const FIELDS: CwFilterField[] = [
  {
    key: 'status',
    label: 'Statut',
    type: 'status',
    operators: [
      { value: 'is', label: 'est' },
      { value: 'not', label: 'n’est pas' },
    ],
    options: [
      { value: 'todo', label: 'À faire' },
      { value: 'progress', label: 'En cours' },
      { value: 'blocked', label: 'Bloqué' },
      { value: 'done', label: 'Terminé' },
    ],
  },
  {
    key: 'priority',
    label: 'Priorité',
    type: 'select',
    operators: [{ value: 'is', label: 'est' }],
    options: [
      { value: 'urgente', label: 'Urgente' },
      { value: 'haute', label: 'Haute' },
    ],
  },
  {
    key: 'people',
    label: 'Assigné',
    type: 'person',
    operators: [{ value: 'is', label: 'est' }],
    options: [
      { value: 'CM', label: 'Moi' },
      { value: 'LM', label: 'Léa Martin' },
      { value: 'KB', label: 'Karim Benali' },
    ],
    manyLabel: (count) => `${String(count)} personnes`,
  },
  {
    key: 'due',
    label: 'Échéance',
    type: 'date',
    operators: [
      { value: 'before', label: 'avant le' },
      { value: 'after', label: 'après le' },
    ],
  },
  {
    key: 'labels',
    label: 'Étiquette',
    type: 'select',
    operators: [
      { value: 'is', label: 'est' },
      { value: 'empty', label: 'est vide', valueless: true },
    ],
    options: [{ value: 'bug', label: 'bug' }],
  },
  {
    key: 'title',
    label: 'Titre',
    type: 'text',
    operators: [{ value: 'contains', label: 'contient' }],
  },
];

const SAVED: CwSavedFilter[] = [
  {
    id: 'late',
    label: 'Mes tâches en retard',
    filters: [{ field: 'people', operator: 'is', value: ['CM'] }],
  },
  { id: 'review', label: 'Revue du sprint', filters: [] },
];

@Component({
  imports: [CwFilterBar, CwFilterValueDef],
  template: `
    <cw-filter-bar
      [fields]="fields"
      [(filters)]="filters"
      [savedFilters]="saved()"
      [dirty]="dirty()"
      [total]="64"
      (filtersChange)="changes.push($event)"
      (saveView)="events.push('saveView')"
      (applySaved)="events.push('applySaved:' + $event.id)"
      (saveFilter)="events.push('saveFilter')"
      (manageSaved)="events.push('manageSaved')"
    >
      <ng-template cwFilterValue="title" let-filter>{{
        filter.value ? '« ' + filter.value + ' »' : '…'
      }}</ng-template>
    </cw-filter-bar>
  `,
})
class Host {
  readonly fields = FIELDS;
  readonly filters = signal<readonly CwFilter[]>([]);
  readonly saved = signal<readonly CwSavedFilter[]>([]);
  readonly dirty = signal(false);
  readonly changes: (readonly CwFilter[])[] = [];
  readonly events: string[] = [];
}

function key(target: Element, value: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

function named(container: ParentNode, selector: string, name: string): HTMLElement {
  const found = Array.from(container.querySelectorAll<HTMLElement>(selector)).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

function menuNamed(name: string): HTMLElement {
  const found = Array.from(document.querySelectorAll<HTMLElement>('[role="menu"]')).find(
    (menu) => menu.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No open menu named ${name}`);
  return found;
}

describe('CwFilterBar', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;
  let announced: string[];

  beforeEach(async () => {
    announced = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LiveAnnouncer,
          useValue: {
            announce: (message: string) => {
              announced.push(message);
              return Promise.resolve();
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(Host);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  async function withFilters(filters: readonly CwFilter[]): Promise<void> {
    component.filters.set(filters);
    await fixture.whenStable();
  }

  function region(): HTMLElement {
    const found = host.querySelector<HTMLElement>('[role="region"]');
    if (!found) throw new Error('No region');
    return found;
  }

  it('shrinks to « Ajouter un filtre » and the total without filters', () => {
    expect(region().getAttribute('aria-label')).toBe('Filtres actifs');
    expect(region().hasAttribute('data-empty')).toBe(true);
    expect(named(host, 'button', 'Ajouter un filtre')).toBeTruthy();
    expect(host.textContent).toContain('Aucun filtre · 64 résultats');
    expect(host.querySelector('[role="group"]')).toBeNull();
    expect(() => named(host, 'button', 'Tout effacer')).toThrow();
  });

  it('renders each filter as a segmented chip', async () => {
    await withFilters([
      { field: 'status', operator: 'is', value: ['progress', 'blocked'] },
      { field: 'people', operator: 'is', value: ['CM', 'LM', 'KB'] },
      { field: 'due', operator: 'before', value: '2026-11-30' },
      { field: 'labels', operator: 'empty', value: null },
      { field: 'title', operator: 'contains', value: 'export' },
    ]);

    const status = named(host, '[role="group"]', 'Filtre Statut');
    expect(status.textContent).toContain('Statut');
    expect(named(status, 'button', 'Opérateur : est').getAttribute('aria-haspopup')).toBe('menu');
    expect(named(status, 'button', 'En cours, Bloqué')).toBeTruthy();
    expect(named(status, 'button', 'Retirer le filtre Statut')).toBeTruthy();

    const people = named(host, '[role="group"]', 'Filtre Assigné');
    expect(named(people, 'button', '3 personnes')).toBeTruthy();
    const due = named(host, '[role="group"]', 'Filtre Échéance');
    expect(named(due, 'button', '30 nov.').getAttribute('aria-haspopup')).toBe('dialog');
    // « est vide » needs no value: operator and remove only.
    const labels = named(host, '[role="group"]', 'Filtre Étiquette');
    expect(labels.querySelectorAll('button')).toHaveLength(2);
    const title = named(host, '[role="group"]', 'Filtre Titre');
    expect(named(title, 'button', '« export »')).toBeTruthy();

    expect(region().hasAttribute('data-empty')).toBe(false);
    expect(named(host, 'button', 'Filtre')).toBeTruthy();
  });

  it('changes the operator from its menu, dropping the value for a valueless one', async () => {
    await withFilters([{ field: 'labels', operator: 'is', value: ['bug'] }]);
    const chip = named(host, '[role="group"]', 'Filtre Étiquette');
    named(chip, 'button', 'Opérateur : est').click();
    await fixture.whenStable();

    const menu = document.querySelector('[role="menu"]');
    const empty = named(menu ?? document, '[role="menuitem"]', 'est vide');
    expect(named(menu ?? document, '[role="menuitem"]', 'est').getAttribute('aria-current')).toBe(
      'true',
    );
    empty.click();
    await fixture.whenStable();

    expect(component.filters()).toEqual([{ field: 'labels', operator: 'empty', value: null }]);
    expect(component.changes).toHaveLength(1);
    expect(named(chip, 'button', 'Opérateur : est vide')).toBeTruthy();
    expect(chip.querySelectorAll('button')).toHaveLength(2);
  });

  it('ticks values in a menu that stays open, in the order of the field', async () => {
    await withFilters([{ field: 'status', operator: 'is', value: ['blocked'] }]);
    const chip = named(host, '[role="group"]', 'Filtre Statut');
    const value = named(chip, 'button', 'Bloqué');
    value.click();
    await fixture.whenStable();

    const menu = menuNamed('Valeurs du filtre Statut');
    const progress = named(menu, '[role="menuitemcheckbox"]', 'En cours');
    expect(named(menu, '[role="menuitemcheckbox"]', 'Bloqué').getAttribute('aria-checked')).toBe(
      'true',
    );
    progress.click();
    await fixture.whenStable();

    expect(component.filters()[0].value).toEqual(['progress', 'blocked']);
    expect(progress.getAttribute('aria-checked')).toBe('true');
    expect(value.getAttribute('aria-expanded')).toBe('true');
    expect(value.textContent.trim()).toBe('En cours, Bloqué');
  });

  it('applies a typed text on Enter', async () => {
    await withFilters([{ field: 'title', operator: 'contains', value: null }]);
    const chip = named(host, '[role="group"]', 'Filtre Titre');
    const value = named(chip, 'button', '…');
    value.click();
    await fixture.whenStable();

    const field = document.querySelector<HTMLInputElement>(
      'input[aria-label="Valeurs du filtre Titre"]',
    );
    if (!field) throw new Error('No text field');
    field.value = '  export ';
    key(field, 'Enter');
    await fixture.whenStable();

    expect(component.filters()[0].value).toBe('export');
    expect(value.getAttribute('aria-expanded')).toBe('false');
  });

  it('removes a filter and moves the focus to the next chip', async () => {
    await withFilters([
      { field: 'status', operator: 'is', value: ['progress'] },
      { field: 'people', operator: 'is', value: ['CM'] },
    ]);
    const remove = named(host, 'button', 'Retirer le filtre Statut');
    remove.focus();
    expect(key(remove, 'Backspace').defaultPrevented).toBe(true);
    await fixture.whenStable();

    expect(component.filters()).toEqual([{ field: 'people', operator: 'is', value: ['CM'] }]);
    expect(announced).toContain('Filtre Statut retiré');
    const people = named(host, '[role="group"]', 'Filtre Assigné');
    expect(document.activeElement).toBe(named(people, 'button', 'Opérateur : est'));

    named(host, 'button', 'Retirer le filtre Assigné').click();
    await fixture.whenStable();
    expect(component.filters()).toEqual([]);
    expect(document.activeElement).toBe(named(host, 'button', 'Ajouter un filtre'));
  });

  it('adds a filter from the menu of the fields and opens its values', async () => {
    named(host, 'button', 'Ajouter un filtre').click();
    await fixture.whenStable();

    const fields = menuNamed('Champs');
    named(fields, '[role="menuitem"]', 'Priorité').click();
    await fixture.whenStable();

    expect(component.filters()).toEqual([{ field: 'priority', operator: 'is', value: null }]);
    expect(announced).toContain('Filtre Priorité ajouté');
    const chip = named(host, '[role="group"]', 'Filtre Priorité');
    expect(named(chip, 'button', 'Choisir…').getAttribute('aria-expanded')).toBe('true');
    expect(menuNamed('Valeurs du filtre Priorité')).toBeTruthy();
  });

  it('clears every filter and saves the modified view', async () => {
    await withFilters([{ field: 'status', operator: 'is', value: ['progress'] }]);
    expect(() => named(host, 'button', 'Enregistrer la vue')).toThrow();
    component.dirty.set(true);
    await fixture.whenStable();
    expect(region().hasAttribute('data-dirty')).toBe(true);

    named(host, 'button', 'Enregistrer la vue').click();
    expect(component.events).toEqual(['saveView']);

    named(host, 'button', 'Tout effacer').click();
    await fixture.whenStable();
    expect(component.filters()).toEqual([]);
    expect(announced).toContain('Filtres effacés');
  });

  it('lists the saved filters, checks the applied one and applies another', async () => {
    component.saved.set(SAVED);
    await withFilters([{ field: 'people', operator: 'is', value: ['CM'] }]);

    const button = named(host, 'button', 'Mes tâches en retard');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    button.click();
    await fixture.whenStable();

    const menu = menuNamed('Filtres enregistrés');
    expect(menu.textContent).toContain('Mes filtres');
    expect(
      named(menu, '[role="menuitem"]', 'Mes tâches en retard').getAttribute('aria-current'),
    ).toBe('true');
    named(menu, '[role="menuitem"]', 'Revue du sprint').click();
    await fixture.whenStable();

    expect(component.filters()).toEqual([]);
    expect(component.events).toEqual(['applySaved:review']);
    expect(named(host, 'button', 'Revue du sprint')).toBeTruthy();

    named(host, 'button', 'Revue du sprint').click();
    await fixture.whenStable();
    named(menuNamed('Filtres enregistrés'), '[role="menuitem"]', 'Gérer les filtres').click();
    expect(component.events).toEqual(['applySaved:review', 'manageSaved']);
  });
});
