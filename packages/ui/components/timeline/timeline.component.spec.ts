import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal, viewChild, type Signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideCwLocale } from '@cadenway/ui/core';

import { provideCwTimelineLabels } from './timeline.providers';
import { CwTimeline } from './timeline.component';
import { CwTimelineNameDef } from './timeline-name/timeline-name.directive';
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

/**
 * Function day
 *
 * @description
 * Creates a local November 2026 date for the fixture.
 *
 * @param {number} date - Day of November 2026.
 *
 * @returns {Date} Local fixture date.
 */
function day(date: number): Date {
  return new Date(2026, 10, date);
}

/**
 * Constant GROUPS
 *
 * @description
 * Groups used in the timeline fixture.
 *
 * @type {CwTimelineGroup[]}
 */
const GROUPS: CwTimelineGroup[] = [{ id: 's14', label: 'Sprint 14' }];

/**
 * Constant ITEMS
 *
 * @description
 * Dated and undated timeline fixture items.
 *
 * @type {CwTimelineItem[]}
 */
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

/**
 * Constant DEPENDENCIES
 *
 * @description
 * Finish-to-start links used in the fixture.
 *
 * @type {CwDependency[]}
 */
const DEPENDENCIES: CwDependency[] = [{ from: 'csv', to: 'import' }];

/**
 * Constant MILESTONES
 *
 * @description
 * Milestones used in the fixture.
 *
 * @type {CwMilestone[]}
 */
const MILESTONES: CwMilestone[] = [
  { id: 'review', label: 'Revue de sprint 14', date: day(20), group: 's14' },
];

/**
 * Class Host
 *
 * @description
 * Hosts a controlled timeline and records emitted changes.
 */
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
  // #region Properties
  /**
   * Property items
   * @readonly
   *
   * @description
   * Items displayed and updated by the fixture.
   *
   * @type {WritableSignal<readonly CwTimelineItem[]>}
   */
  public readonly items: WritableSignal<readonly CwTimelineItem[]> =
    signal<readonly CwTimelineItem[]>(ITEMS);

  /**
   * Property groups
   * @readonly
   *
   * @description
   * Groups displayed by the timeline.
   *
   * @type {CwTimelineGroup[]}
   */
  public readonly groups: CwTimelineGroup[] = GROUPS;

  /**
   * Property dependencies
   * @readonly
   *
   * @description
   * Dependencies displayed by the timeline.
   *
   * @type {CwDependency[]}
   */
  public readonly dependencies: CwDependency[] = DEPENDENCIES;

  /**
   * Property milestones
   * @readonly
   *
   * @description
   * Milestones displayed by the timeline.
   *
   * @type {CwMilestone[]}
   */
  public readonly milestones: CwMilestone[] = MILESTONES;

  /**
   * Property today
   * @readonly
   *
   * @description
   * Current day used by the fixture.
   *
   * @type {Date}
   */
  public readonly today: Date = day(12);

  /**
   * Property scale
   * @readonly
   *
   * @description
   * Selected axis scale.
   *
   * @type {WritableSignal<CwTimelineScale>}
   */
  public readonly scale: WritableSignal<CwTimelineScale> = signal<CwTimelineScale>('day');

  /**
   * Property zoom
   * @readonly
   *
   * @description
   * Selected axis zoom.
   *
   * @type {WritableSignal<number>}
   */
  public readonly zoom: WritableSignal<number> = signal(1);

  /**
   * Property range
   * @readonly
   *
   * @description
   * Visible date range.
   *
   * @type {WritableSignal<CwTimelineRange | null>}
   */
  public readonly range: WritableSignal<CwTimelineRange | null> = signal<CwTimelineRange | null>({
    start: day(9),
    end: day(29),
  });

  /**
   * Property selection
   * @readonly
   *
   * @description
   * Selected item identifiers.
   *
   * @type {WritableSignal<readonly string[]>}
   */
  public readonly selection: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property collapsed
   * @readonly
   *
   * @description
   * Collapsed group identifiers.
   *
   * @type {WritableSignal<readonly string[]>}
   */
  public readonly collapsed: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property changes
   * @readonly
   *
   * @description
   * Recorded item changes.
   *
   * @type {CwTimelineItemChange[]}
   */
  public readonly changes: CwTimelineItemChange[] = [];

  /**
   * Property scheduled
   * @readonly
   *
   * @description
   * Recorded scheduling requests.
   *
   * @type {CwTimelineSchedule[]}
   */
  public readonly scheduled: CwTimelineSchedule[] = [];

  /**
   * Property conflicts
   * @readonly
   *
   * @description
   * Recorded dependency conflicts.
   *
   * @type {CwTimelineConflict[]}
   */
  public readonly conflicts: CwTimelineConflict[] = [];

  /**
   * Property opened
   * @readonly
   *
   * @description
   * Identifiers of opened items.
   *
   * @type {string[]}
   */
  public readonly opened: string[] = [];
  // #endregion

  // #region Methods
  /**
   * Method apply
   * @method apply
   *
   * @description
   * Records a change and writes the new dates back to the controlled items.
   *
   * @param {CwTimelineItemChange} change - Date change to apply to controlled fixture items.
   */
  public apply(change: CwTimelineItemChange): void {
    this.changes.push(change);
    this.items.update((items) =>
      items.map((item) =>
        item.id === change.item.id ? { ...item, start: change.start, end: change.end } : item,
      ),
    );
  }
  // #endregion
}

/**
 * Function key
 *
 * @description
 * Dispatches a keyboard event to a fixture element.
 *
 * @param {Element} element - Element receiving the event.
 * @param {string} name - Keyboard key to dispatch.
 * @param {KeyboardEventInit} [init] - Additional keyboard event options.
 */
function key(element: Element, name: string, init: KeyboardEventInit = {}): void {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...init }),
  );
}

/**
 * Function pointer
 *
 * @description
 * Dispatches a pointer-like mouse event at the given horizontal position.
 *
 * @param {Element} element - Element receiving the event.
 * @param {string} type - Mouse event type.
 * @param {number} clientX - Horizontal pointer position in pixels.
 */
function pointer(element: Element, type: string, clientX: number): void {
  element.dispatchEvent(
    new MouseEvent(type, { bubbles: true, cancelable: true, clientX, button: 0 }),
  );
}

describe('CwTimeline', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  /**
   * Function bar
   *
   * @description
   * Finds a bar by its accessible name.
   *
   * @param {string} name - Accessible name of the bar.
   *
   * @returns {HTMLElement} Matching timeline bar.
   */
  function bar(name: string): HTMLElement {
    const found: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>('[role="button"]'),
    ).find((element) => element.getAttribute('aria-label')?.startsWith(name));
    if (!found) throw new Error(`No bar named ${name}`);
    return found;
  }

  /**
   * Function row
   *
   * @description
   * Finds a row by the text of its first cell.
   *
   * @param {string} name - Text of the first row cell.
   *
   * @returns {HTMLElement} Matching timeline row.
   */
  function row(name: string): HTMLElement {
    const found: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>('[role="row"]'),
    ).find((element) => element.querySelector('[role="gridcell"]')?.textContent.includes(name));
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
    const group: HTMLElement = row('Sprint 14');
    expect(group.tabIndex).toBe(0);
    expect(bar("Corriger l'export CSV").tabIndex).toBe(-1);

    group.focus();
    key(group, 'ArrowDown');
    await fixture.whenStable();

    expect(document.activeElement).toBe(bar("Corriger l'export CSV"));
    expect(bar("Corriger l'export CSV").tabIndex).toBe(0);
  });

  it('collapses and expands a group with the arrows', async () => {
    const group: HTMLElement = row('Sprint 14');
    key(group, 'ArrowLeft');
    await fixture.whenStable();

    expect(component.collapsed()).toEqual(['s14']);
    expect(group.getAttribute('aria-expanded')).toBe('false');

    key(group, 'ArrowRight');
    await fixture.whenStable();
    expect(component.collapsed()).toEqual([]);
  });

  it('moves a bar by one day, changes its end with Shift and its start with Alt', async () => {
    const csv: HTMLElement = bar("Corriger l'export CSV");

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
    const csv: HTMLElement = bar("Corriger l'export CSV");

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
    const csv: HTMLElement = bar("Corriger l'export CSV");

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
    const csv: HTMLElement = bar("Corriger l'export CSV");

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
    const undated: HTMLElement = row('Raccourcis de la Liste');
    expect(undated.textContent).toContain('Sans date');

    key(undated, 'Enter');

    expect(component.scheduled).toHaveLength(1);
    expect(component.scheduled[0].start.getDate()).toBe(12);
    expect(component.scheduled[0].end.getDate()).toBe(12);
  });

  it('changes the scale with J, S and M and the period with Page Down', () => {
    const grid: HTMLElement = row('Sprint 14');

    key(grid, 'm');
    expect(component.scale()).toBe('month');
    key(grid, 's');
    expect(component.scale()).toBe('week');
    key(grid, 'j');
    expect(component.scale()).toBe('day');

    const before: number = component.range()?.start.getTime() ?? 0;
    key(grid, 'PageDown');
    expect((component.range()?.start.getTime() ?? 0) - before).toBe(7 * 86_400_000);
  });

  it('walks the zoom steps with Ctrl + wheel and Ctrl + / −', () => {
    const grid: Element | null = host.querySelector('[role="treegrid"]');
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

describe('provideCwLocale', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideCwLocale('en-US')] });
  });

  it('names milestones and bar dates in English', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(
      host.querySelector('[role="img"][aria-label="Jalon Revue de sprint 14, Nov 20"]'),
    ).not.toBeNull();
    const bar: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>('[role="button"]'),
    ).find(
      (element) =>
        element.getAttribute('aria-label') ===
        "Corriger l'export CSV, 40 %, En cours, du Nov 10 au Nov 13",
    );
    expect(bar).toBeDefined();
  });
});

describe('provideCwTimelineLabels', () => {
  it('renders the provided text', async () => {
    TestBed.configureTestingModule({
      providers: [provideCwTimelineLabels({ nameHeader: 'Task', range: () => 'custom range' })],
    });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Task');
    expect(element.querySelector('[aria-label*="custom range"]')).toBeTruthy();
  });
});

/**
 * Class PlanningHost
 *
 * @description
 * Hosts a Gantt-like timeline: durations, a name-cell template, milestone lines, off-window chips,
 * the loading and empty states, and `fit()`.
 */
@Component({
  imports: [CwTimeline, CwTimelineNameDef],
  template: `
    <cw-timeline
      #timeline
      ariaLabel="Diagramme de Gantt"
      showDuration
      showOffWindow
      milestoneDisplay="lines"
      [items]="items()"
      [milestones]="milestones"
      [today]="today"
      [loading]="loading()"
      [(scale)]="scale"
      [(range)]="range"
    >
      <ng-template cwTimelineName let-item let-dates="dates">
        <span class="truncate">{{ item.name }}</span>
        <span>{{ item.id }}</span>
        @if (!dates) {
          <span>—</span>
        }
      </ng-template>
    </cw-timeline>
  `,
})
class PlanningHost {
  // #region Properties
  /**
   * Property timeline
   * @readonly
   *
   * @description
   * The timeline under test.
   *
   * @type {Signal<CwTimeline>}
   */
  public readonly timeline: Signal<CwTimeline> = viewChild.required(CwTimeline);

  /**
   * Property items
   * @readonly
   *
   * @description
   * Items of the fixture, one of them after the window.
   *
   * @type {WritableSignal<readonly CwTimelineItem[]>}
   */
  public readonly items: WritableSignal<readonly CwTimelineItem[]> = signal<
    readonly CwTimelineItem[]
  >([
    ...ITEMS.slice(0, 2),
    { id: 'later', name: 'Préparer la version', status: 'todo', start: day(30), end: day(30) },
    ITEMS[3],
  ]);

  /**
   * Property milestones
   * @readonly
   *
   * @description
   * Milestones drawn as lines.
   *
   * @type {CwMilestone[]}
   */
  public readonly milestones: CwMilestone[] = MILESTONES;

  /**
   * Property today
   * @readonly
   *
   * @description
   * Current day of the fixture.
   *
   * @type {Date}
   */
  public readonly today: Date = day(12);

  /**
   * Property loading
   * @readonly
   *
   * @description
   * Whether the timeline shows its skeleton.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property scale
   * @readonly
   *
   * @description
   * Selected axis scale.
   *
   * @type {WritableSignal<CwTimelineScale>}
   */
  public readonly scale: WritableSignal<CwTimelineScale> = signal<CwTimelineScale>('day');

  /**
   * Property range
   * @readonly
   *
   * @description
   * Visible window: 9 to 22 November.
   *
   * @type {WritableSignal<CwTimelineRange | null>}
   */
  public readonly range: WritableSignal<CwTimelineRange | null> = signal<CwTimelineRange | null>({
    start: day(9),
    end: day(22),
  });
  // #endregion
}

describe('CwTimeline planning', () => {
  let host: HTMLElement;
  let component: PlanningHost;
  let fixture: ComponentFixture<PlanningHost>;
  let announce: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    announce = vi.fn(() => Promise.resolve());
    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
    });
    fixture = TestBed.createComponent(PlanningHost);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  /**
   * Function nameCell
   *
   * @description
   * Finds the name cell of the row whose cell text contains a name.
   *
   * @param {string} name - Item name.
   *
   * @returns {HTMLElement} Matching name cell.
   */
  function nameCell(name: string): HTMLElement {
    const found: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>('[role="row"] > [role="gridcell"]:first-child'),
    ).find((element) => element.textContent.includes(name));
    if (!found) throw new Error(`No name cell ${name}`);
    return found;
  }

  it('draws the name template and the duration column', () => {
    expect(host.querySelector('[role="columnheader"]')?.textContent).toContain('Duration');
    const csv: HTMLElement = nameCell("Corriger l'export CSV");
    expect(csv.textContent).toContain('csv');
    expect(csv.textContent).toContain('4 d');
    expect(nameCell('Raccourcis de la Liste').textContent).toContain('—');
  });

  it('draws milestones as lines with a named marker in the ruler, not as rows', () => {
    expect(
      host.querySelector('[role="img"][aria-label="Jalon Revue de sprint 14, 20 nov."]'),
    ).not.toBeNull();
    expect(host.querySelector('svg line[stroke-dasharray]')).not.toBeNull();
    expect(
      Array.from(host.querySelectorAll('[role="row"]')).some((row) =>
        row.textContent.includes('Revue de sprint 14'),
      ),
    ).toBe(false);
  });

  it('marks a bar outside the window with a chip that brings it into view', async () => {
    const chip: HTMLButtonElement | null = host.querySelector<HTMLButtonElement>(
      'button[aria-label^="Show Préparer la version"]',
    );
    expect(chip?.textContent).toContain('30 nov.');

    chip?.click();
    await fixture.whenStable();

    expect(component.range()).toEqual({ start: day(19), end: day(32) });
    expect(host.querySelector('button[aria-label^="Show Préparer la version"]')).toBeNull();
  });

  it('reveals an off-window bar with Enter on its row', async () => {
    const row: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>('[role="row"][data-focus-key]'),
    ).find((element) => element.textContent.includes('Préparer la version'));
    if (!row) throw new Error('Row missing');
    row.focus();
    row.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();

    expect(component.range()?.start).toEqual(day(19));
  });

  it('fits the window to the dated items and announces it', async () => {
    expect(component.timeline().fit()).toBe(true);
    await fixture.whenStable();

    expect(component.scale()).toBe('week');
    expect(component.range()?.start).toEqual(day(2));
    expect(announce).toHaveBeenLastCalledWith('Window fitted to 3 dated items', 'polite');
  });

  it('does not fit without a dated item', () => {
    component.items.set([ITEMS[3]]);
    fixture.detectChanges();

    expect(component.timeline().fit()).toBe(false);
    expect(component.range()).toEqual({ start: day(9), end: day(22) });
  });

  it('draws a named busy skeleton while loading, and the empty text without rows', async () => {
    component.loading.set(true);
    await fixture.whenStable();
    const status: HTMLElement | null = host.querySelector('[role="status"]');
    expect(status?.getAttribute('aria-label')).toBe('Loading the timeline');
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('[role="treegrid"]')).toBeNull();

    component.loading.set(false);
    component.items.set([]);
    await fixture.whenStable();
    const grid: HTMLElement | null = host.querySelector('[role="treegrid"]');
    expect(grid?.textContent).toContain('No items to show.');
    expect(grid?.tabIndex).toBe(0);
  });
});
