import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwChart } from './chart.component';
import type {
  CwChartCategorySelect,
  CwChartDatum,
  CwChartOrientation,
  CwChartSeries,
  CwChartType,
} from './chart.types';

const WEEKS: CwChartDatum[] = [
  { week: 'S44', done: 18, late: 1 },
  { week: 'S45', done: 14, late: 2 },
  { week: 'S46', done: 1200, late: 1 },
];

const SERIES: CwChartSeries[] = [
  { key: 'done', label: 'Terminées', color: 'chart-2' },
  { key: 'late', label: 'En retard', color: 'chart-4' },
];

@Component({
  imports: [CwChart],
  template: `
    <cw-chart
      [type]="type()"
      [orientation]="orientation()"
      [data]="data()"
      x="week"
      [series]="series"
      ariaLabel="Tâches terminées et en retard, S44 à S46"
      [loading]="loading()"
      unit="tâches"
      (categorySelect)="selected.set($event)"
    />
  `,
})
class Host {
  readonly type = signal<CwChartType>('bar');
  readonly orientation = signal<CwChartOrientation>('vertical');
  readonly data = signal<readonly CwChartDatum[]>(WEEKS);
  readonly series = SERIES;
  readonly loading = signal(false);
  readonly selected = signal<CwChartCategorySelect | null>(null);
}

function keydown(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CwChart', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  function plot(): HTMLElement {
    const found = host.querySelector<HTMLElement>('[role="img"][tabindex="0"]');
    if (!found) throw new Error('No plot');
    return found;
  }

  function live(): string {
    return host.querySelector('[aria-live="polite"]')?.textContent.trim() ?? '';
  }

  function legendItem(name: string): HTMLButtonElement {
    const found = Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent.includes(name),
    );
    if (!found) throw new Error(`No legend item ${name}`);
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('is one focusable image named by its summary, with every value in a hidden table', () => {
    expect(plot().getAttribute('aria-label')).toBe('Tâches terminées et en retard, S44 à S46');
    expect(plot().tabIndex).toBe(0);

    const table = host.querySelector('table');
    expect(table?.querySelector('caption')?.textContent.trim()).toBe(
      'Tâches terminées et en retard, S44 à S46',
    );
    const headers = Array.from(table?.querySelectorAll('thead th') ?? []).map((th) =>
      th.textContent.trim(),
    );
    expect(headers).toEqual(['Catégorie', 'Terminées', 'En retard']);
    const lastRow = Array.from(table?.querySelectorAll('tbody tr:last-child > *') ?? []).map(
      (cell) => cell.textContent.trim(),
    );
    // French number format: a narrow no-break space groups the thousands.
    expect(lastRow).toEqual(['S46', '1 200', '1']);
  });

  it('moves through the categories with the arrows and announces the active one', async () => {
    keydown(plot(), 'ArrowRight');
    await fixture.whenStable();
    expect(live()).toBe('S44 : Terminées 18, En retard 1');

    keydown(plot(), 'End');
    await fixture.whenStable();
    expect(plot().dataset['active']).toBe('S46');

    keydown(plot(), 'ArrowLeft');
    await fixture.whenStable();
    expect(live()).toBe('S45 : Terminées 14, En retard 2');

    keydown(plot(), 'Escape');
    await fixture.whenStable();
    expect(live()).toBe('');
  });

  it('emits the active category on Enter', async () => {
    keydown(plot(), 'ArrowRight');
    keydown(plot(), 'ArrowRight');
    keydown(plot(), 'Enter');
    await fixture.whenStable();

    expect(component.selected()).toEqual({ x: 'S45', values: { done: 14, late: 2 } });
  });

  it('hides and shows a series from its legend button', async () => {
    const late = legendItem('En retard');
    expect(late.getAttribute('aria-pressed')).toBe('true');

    late.click();
    await fixture.whenStable();
    keydown(plot(), 'ArrowRight');
    await fixture.whenStable();

    expect(late.getAttribute('aria-pressed')).toBe('false');
    expect(live()).toBe('S44 : Terminées 18');
  });

  it('follows ↑ ↓ on horizontal bars', async () => {
    component.orientation.set('horizontal');
    await fixture.whenStable();

    keydown(plot(), 'ArrowDown');
    keydown(plot(), 'ArrowDown');
    await fixture.whenStable();

    expect(plot().dataset['active']).toBe('S45');
  });

  it('moves through the segments of a ring', async () => {
    component.type.set('donut');
    await fixture.whenStable();

    keydown(plot(), 'ArrowRight');
    await fixture.whenStable();

    expect(live()).toBe('Terminées : Terminées 1 232');
    expect(host.textContent).toContain('tâches');
  });

  it('shows the empty state without any value', async () => {
    component.data.set([]);
    await fixture.whenStable();

    expect(host.querySelector('[role="img"][tabindex="0"]')).toBeNull();
    expect(host.textContent).toContain('Aucune donnée sur la période');
  });

  it('is busy while loading', async () => {
    component.loading.set(true);
    await fixture.whenStable();

    expect(host.querySelector('cw-chart')?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('[role="img"][tabindex="0"]')).toBeNull();
  });
});
