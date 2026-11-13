import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwTimeline } from './timeline.component';
import type {
  CwDependency,
  CwMilestone,
  CwTimelineConflict,
  CwTimelineGroup,
  CwTimelineItem,
  CwTimelineItemChange,
  CwTimelineRange,
  CwTimelineScale,
  CwTimelineSchedule,
} from './timeline.types';

function day(date: number): Date {
  return new Date(2026, 10, date);
}

const GROUPS: CwTimelineGroup[] = [{ id: 's14', label: 'Sprint 14' }];

const ITEMS: CwTimelineItem[] = [
  {
    id: 'csv',
    name: "Corriger l'export CSV",
    status: 'progress',
    progress: 40,
    start: day(10),
    end: day(13),
    group: 's14',
  },
  {
    id: 's3',
    name: 'Migrer vers S3',
    status: 'blocked',
    progress: 30,
    start: day(9),
    end: day(11),
    group: 's14',
  },
  {
    id: 'import',
    name: 'Importer les espaces',
    status: 'todo',
    progress: 0,
    start: day(16),
    end: day(18),
    group: 's14',
  },
  { id: 'shortcuts', name: 'Raccourcis de la Liste', status: 'todo', group: 's14' },
];

const DEPENDENCIES: CwDependency[] = [{ from: 'csv', to: 'import' }];

const MILESTONES: CwMilestone[] = [
  { id: 'review', label: 'Revue de sprint 14', date: day(20), group: 's14' },
];

@Component({
  imports: [CwTimeline],
  template: `
    <cw-timeline
      ariaLabel="Timeline de Produit"
      [items]="items()"
      [groups]="groups"
      [dependencies]="dependencies"
      [milestones]="milestones"
      [today]="today"
      [(scale)]="scale"
      [(zoom)]="zoom"
      [(range)]="range"
      [(selection)]="selection"
      [(collapsedGroups)]="collapsed"
      (itemChange)="apply($event)"
      (schedule)="scheduled.push($event)"
      (conflict)="conflicts.push($event)"
      (open)="opened.push($event.id)"
    />
  `,
})
class Host {
  readonly items = signal<readonly CwTimelineItem[]>(ITEMS);
  readonly groups = GROUPS;
  readonly dependencies = DEPENDENCIES;
  readonly milestones = MILESTONES;
  readonly today = day(12);
  readonly scale = signal<CwTimelineScale>('day');
  readonly zoom = signal(1);
  readonly range = signal<CwTimelineRange | null>({ start: day(9), end: day(29) });
  readonly selection = signal<readonly string[]>([]);
  readonly collapsed = signal<readonly string[]>([]);
  readonly changes: CwTimelineItemChange[] = [];
  readonly scheduled: CwTimelineSchedule[] = [];
  readonly conflicts: CwTimelineConflict[] = [];
  readonly opened: string[] = [];

  // The timeline is controlled: the consumer writes the new dates back.
  apply(change: CwTimelineItemChange): void {
    this.changes.push(change);
    this.items.update((items) =>
      items.map((item) =>
        item.id === change.item.id ? { ...item, start: change.start, end: change.end } : item,
      ),
    );
  }
}

function key(element: Element, name: string, init: KeyboardEventInit = {}): void {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }),
  );
}

function pointer(element: Element, type: string, clientX: number): void {
  element.dispatchEvent(
    new MouseEvent(type, { bubbles: true, cancelable: true, clientX, button: 0 }),
  );
}

describe('CwTimeline', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  function bar(name: string): HTMLElement {
    const found = Array.from(host.querySelectorAll<HTMLElement>('[role="button"]')).find(
      (element) => element.getAttribute('aria-label')?.startsWith(name),
    );
    if (!found) throw new Error(`No bar named ${name}`);
    return found;
  }

  function row(name: string): HTMLElement {
    const found = Array.from(host.querySelectorAll<HTMLElement>('[role="row"]')).find((element) =>
      element.querySelector('[role="gridcell"]')?.textContent.includes(name),
    );
    if (!found) throw new Error(`No row named ${name}`);
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('is a named tree grid whose bars carry their status, progress, dates, delay and conflicts', () => {
    expect(host.querySelector('[role="treegrid"]')?.getAttribute('aria-label')).toBe(
      'Timeline de Produit',
    );
    expect(bar("Corriger l'export CSV").getAttribute('aria-label')).toBe(
      "Corriger l'export CSV, 40 %, En cours, du 10 au 13 nov.",
    );
    expect(bar('Migrer vers S3').getAttribute('aria-label')).toBe(
      'Migrer vers S3, 30 %, Bloqué, du 9 au 11 nov., en retard de 1 jour',
    );
    expect(bar('Migrer vers S3').dataset['late']).toBe('');
    expect(
      host.querySelector('[role="img"][aria-label="Jalon Revue de sprint 14, 20 nov."]'),
    ).not.toBeNull();
    expect(host.querySelector('[aria-current="date"]')?.textContent).toContain('12');
  });

  it('keeps one tab stop and moves between rows with the arrows', async () => {
    const group = row('Sprint 14');
    expect(group.tabIndex).toBe(0);
    expect(bar("Corriger l'export CSV").tabIndex).toBe(-1);

    group.focus();
    key(group, 'ArrowDown');
    await fixture.whenStable();

    expect(document.activeElement).toBe(bar("Corriger l'export CSV"));
    expect(bar("Corriger l'export CSV").tabIndex).toBe(0);
  });

  it('collapses and expands a group with the arrows', async () => {
    const group = row('Sprint 14');
    key(group, 'ArrowLeft');
    await fixture.whenStable();

    expect(component.collapsed()).toEqual(['s14']);
    expect(group.getAttribute('aria-expanded')).toBe('false');

    key(group, 'ArrowRight');
    await fixture.whenStable();
    expect(component.collapsed()).toEqual([]);
  });

  it('moves a bar by one day, changes its end with Shift and its start with Alt', async () => {
    const csv = bar("Corriger l'export CSV");

    key(csv, 'ArrowRight');
    await fixture.whenStable();
    key(csv, 'ArrowRight', { shiftKey: true });
    await fixture.whenStable();
    key(csv, 'ArrowLeft', { altKey: true });
    await fixture.whenStable();

    expect(
      component.changes.map((change) => [change.start.getDate(), change.end.getDate()]),
    ).toEqual([
      [11, 14],
      [11, 15],
      [10, 15],
    ]);
    expect(component.changes[0].previous.start.getDate()).toBe(10);
  });

  it('reports a change that makes a successor start before its predecessor ends', async () => {
    const csv = bar("Corriger l'export CSV");

    key(csv, 'ArrowRight', { shiftKey: true });
    await fixture.whenStable();
    key(csv, 'ArrowRight', { shiftKey: true });
    await fixture.whenStable();
    key(csv, 'ArrowRight', { shiftKey: true });
    await fixture.whenStable();

    expect(component.conflicts).toEqual([
      { dependency: { from: 'csv', to: 'import' }, overlapDays: 1 },
    ]);
  });

  it('moves a bar by whole days under the pointer', async () => {
    const csv = bar("Corriger l'export CSV");

    pointer(csv, 'pointerdown', 100);
    pointer(csv, 'pointermove', 172);
    await fixture.whenStable();
    expect(csv.dataset['dragging']).toBe('');
    pointer(csv, 'pointerup', 172);

    expect(component.changes).toHaveLength(1);
    expect(component.changes[0].start.getDate()).toBe(12);
    expect(component.changes[0].end.getDate()).toBe(15);
  });

  it('selects with Space or a click, opens with Enter and clears with Escape', async () => {
    const csv = bar("Corriger l'export CSV");

    key(csv, ' ');
    await fixture.whenStable();
    expect(component.selection()).toEqual(['csv']);
    expect(csv.getAttribute('aria-pressed')).toBe('true');

    key(bar('Migrer vers S3'), ' ', { ctrlKey: true });
    expect(component.selection()).toEqual(['csv', 's3']);

    key(csv, 'Enter');
    expect(component.opened).toEqual(['csv']);

    key(csv, 'Escape');
    expect(component.selection()).toEqual([]);

    pointer(csv, 'pointerdown', 100);
    pointer(csv, 'pointerup', 100);
    expect(component.selection()).toEqual(['csv']);
  });

  it('schedules an undated item for today on Enter', () => {
    const undated = row('Raccourcis de la Liste');
    expect(undated.textContent).toContain('Sans date');

    key(undated, 'Enter');

    expect(component.scheduled).toHaveLength(1);
    expect(component.scheduled[0].start.getDate()).toBe(12);
    expect(component.scheduled[0].end.getDate()).toBe(12);
  });

  it('changes the scale with J, S and M and the period with Page Down', () => {
    const grid = row('Sprint 14');

    key(grid, 'm');
    expect(component.scale()).toBe('month');
    key(grid, 's');
    expect(component.scale()).toBe('week');
    key(grid, 'j');
    expect(component.scale()).toBe('day');

    const before = component.range()?.start.getTime() ?? 0;
    key(grid, 'PageDown');
    expect((component.range()?.start.getTime() ?? 0) - before).toBe(7 * 86_400_000);
  });

  it('walks the zoom steps with Ctrl + wheel and Ctrl + / −', () => {
    const grid = host.querySelector('[role="treegrid"]');
    if (!grid) throw new Error('No grid');

    grid.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, cancelable: true }));
    expect(component.scale()).toBe('week');
    expect(component.zoom()).toBe(1.5);

    key(row('Sprint 14'), '+', { ctrlKey: true });
    expect(component.scale()).toBe('day');
    expect(component.zoom()).toBe(1);

    key(row('Sprint 14'), '+', { ctrlKey: true });
    expect(component.zoom()).toBe(1.5);
  });
});
