import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import type { CwFilter, CwFilterField } from '../filter-bar.types';
import { CwFilterOptionDef } from '../filter-option/filter-option.directive';
import { CwFilterChip } from './filter-chip.component';

/**
 * Constant STATUS
 *
 * @description
 * Status field supplied to the chip fixture.
 *
 * @type {CwFilterField}
 */
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

/**
 * Constant DUE
 *
 * @description
 * Due date field supplied to the chip fixture.
 *
 * @type {CwFilterField}
 */
const DUE: CwFilterField = {
  key: 'due',
  label: 'Échéance',
  type: 'date',
  operators: [{ value: 'before', label: 'avant le' }],
};

/**
 * Component Host
 *
 * @description
 * Hosts filter controls and records emitted changes for the fixture.
 */
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
  // #region Properties
  /**
   * Property status
   *
   * @description
   * Status field displayed by the fixture.
   *
   * @type {CwFilterField}
   * @readonly
   */
  public readonly status: CwFilterField = STATUS;

  /**
   * Property due
   *
   * @description
   * Due date field displayed by the fixture.
   *
   * @type {CwFilterField}
   * @readonly
   */
  public readonly due: CwFilterField = DUE;

  /**
   * Property statusFilter
   *
   * @description
   * Current status filter.
   *
   * @type {WritableSignal<CwFilter>}
   * @readonly
   */
  public readonly statusFilter: WritableSignal<CwFilter> = signal<CwFilter>({
    field: 'status',
    operator: 'is',
    value: ['progress'],
  });

  /**
   * Property dueFilter
   *
   * @description
   * Current due date filter.
   *
   * @type {WritableSignal<CwFilter>}
   * @readonly
   */
  public readonly dueFilter: WritableSignal<CwFilter> = signal<CwFilter>({
    field: 'due',
    operator: 'before',
    value: null,
  });

  /**
   * Property removed
   *
   * @description
   * Fields whose filter removal was emitted.
   *
   * @type {string[]}
   * @readonly
   */
  public readonly removed: string[] = [];

  /**
   * Property removeLabel
   *
   * @description
   * Custom label for removing a filter.
   *
   * @type {(field: string) => string}
   * @readonly
   */
  public readonly removeLabel: (field: string) => string = (field: string): string =>
    `Supprimer ${field}`;
  // #endregion
}

/**
 * Function named
 *
 * @description
 * Finds an element with the given accessible name.
 *
 * @param {ParentNode} container - Parent searched for the element.
 * @param {string} selector - Selector identifying candidate elements.
 * @param {string} name - Accessible name to find.
 * @returns {HTMLElement} Matching element.
 */
function named(container: ParentNode, selector: string, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    container.querySelectorAll<HTMLElement>(selector),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
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
    const chip: HTMLElement = named(host, '[role="group"]', 'Filtre Statut');
    const value: HTMLButtonElement = Array.from(chip.querySelectorAll('button'))[1];
    expect(value.textContent).toContain('En cours');
    expect(value.querySelector('[aria-hidden="true"]')?.textContent).toContain('progress');

    named(chip, 'button', 'Supprimer Statut').click();
    expect(fixture.componentInstance.removed).toEqual(['status']);
  });

  it('picks a day in a calendar popover and closes it', async () => {
    const chip: HTMLElement = named(host, '[role="group"]', 'Filtre Échéance');
    const value: HTMLElement = named(chip, 'button', 'Choisir…');
    value.click();
    await fixture.whenStable();

    const panel: Element | null = document.querySelector(
      '[role="dialog"][aria-label="Valeurs du filtre Échéance"]',
    );
    expect(panel).not.toBeNull();
    const day: HTMLButtonElement | null | undefined = panel?.querySelector<HTMLButtonElement>(
      '[role="grid"] tbody button:not([disabled])',
    );
    if (!day) throw new Error('No day in the calendar');
    day.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.dueFilter().value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(value.getAttribute('aria-expanded')).toBe('false');
  });
});
