import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import type { CwFilter, CwFilterField } from '../filter-bar.types';
import { CwFilterOptionDef } from '../filter-option/filter-option.directive';
import { CwFilterChip } from './filter-chip.component';

const STATUS: CwFilterField = {
  key: 'status',
  label: 'Statut',
  type: 'status',
  operators: [{ value: 'is', label: 'est' }],
  options: [
    { value: 'progress', label: 'En cours' },
    { value: 'blocked', label: 'Bloqué' },
  ],
};

const DUE: CwFilterField = {
  key: 'due',
  label: 'Échéance',
  type: 'date',
  operators: [{ value: 'before', label: 'avant le' }],
};

@Component({
  imports: [CwFilterChip, CwFilterOptionDef],
  template: `
    <cw-filter-chip
      [field]="status"
      [(filter)]="statusFilter"
      [labels]="{ remove: removeLabel }"
      (removed)="removed.push('status')"
    >
      <ng-template cwFilterOption="status" let-option>
        <span data-media>{{ option.value }}</span>
      </ng-template>
    </cw-filter-chip>
    <cw-filter-chip [field]="due" [(filter)]="dueFilter" />
  `,
})
class Host {
  readonly status = STATUS;
  readonly due = DUE;
  readonly statusFilter = signal<CwFilter>({
    field: 'status',
    operator: 'is',
    value: ['progress'],
  });
  readonly dueFilter = signal<CwFilter>({ field: 'due', operator: 'before', value: null });
  readonly removed: string[] = [];
  readonly removeLabel = (field: string): string => `Supprimer ${field}`;
}

function named(container: ParentNode, selector: string, name: string): HTMLElement {
  const found = Array.from(container.querySelectorAll<HTMLElement>(selector)).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

describe('CwFilterChip', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('works alone, with its own option template and overridden labels', () => {
    const chip = named(host, '[role="group"]', 'Filtre Statut');
    const value = Array.from(chip.querySelectorAll('button'))[1];
    expect(value.textContent).toContain('En cours');
    expect(value.querySelector('[aria-hidden="true"]')?.textContent).toContain('progress');

    named(chip, 'button', 'Supprimer Statut').click();
    expect(fixture.componentInstance.removed).toEqual(['status']);
  });

  it('picks a day in a calendar popover and closes it', async () => {
    const chip = named(host, '[role="group"]', 'Filtre Échéance');
    const value = named(chip, 'button', 'Choisir…');
    value.click();
    await fixture.whenStable();

    const panel = document.querySelector(
      '[role="dialog"][aria-label="Valeurs du filtre Échéance"]',
    );
    expect(panel).not.toBeNull();
    const day = panel?.querySelector<HTMLButtonElement>(
      '[role="grid"] tbody button:not([disabled])',
    );
    if (!day) throw new Error('No day in the calendar');
    day.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.dueFilter().value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(value.getAttribute('aria-expanded')).toBe('false');
  });
});
