import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDrag, CdkDropList, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, signal, type DebugElement, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { CwMenu, CwMenuItem } from '@cadenway/ui/components/menu';
import { provideCwLocale } from '@cadenway/ui/core';

import { provideCwCalendarViewLabels } from './calendar-view.providers';
import { CwCalendarItemDef } from './calendar-item-def/calendar-item-def.directive';
import { CwCalendarView } from './calendar-view.component';
import type { DropData } from './calendar-view.token';
import type {
  CwCalendarCreate,
  CwCalendarItemMove,
  CwCalendarItemSchedule,
  CwCalendarSpan,
  CwCalendarViewMode,
} from './calendar-view.types';

/**
 * Interface Task
 *
 * @description
 * Calendar item used by the test fixture.
 */
interface Task {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable identifier of the task.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property name
   *
   * @description
   * Displayed task name.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property span
   *
   * @description
   * Scheduled dates and all-day state of the task.
   *
   * @type {CwCalendarSpan | null}
   * @readonly
   */
  readonly span: CwCalendarSpan | null;
  // #endregion
}

/**
 * Function day
 *
 * @description
 * Creates a date in November 2026 for the fixture.
 *
 * @param {number} date - Day of the month.
 * @param {number} hours - Hour of the date.
 * @param {number} minutes - Minute of the date.
 * @returns {Date} Date in the fixture month.
 */
function day(date: number, hours: number = 0, minutes: number = 0): Date {
  return new Date(2026, 10, date, hours, minutes);
}

/**
 * Function allDay
 *
 * @description
 * Creates an all-day span for the fixture.
 *
 * @param {number} date - Day of the month.
 * @param {number} to - Last day of the all-day span.
 * @returns {CwCalendarSpan} All-day calendar span.
 */
function allDay(date: number, to: number = date): CwCalendarSpan {
  return { start: day(date), end: day(to), allDay: true };
}

/**
 * Constant TASKS
 *
 * @description
 * Sample calendar items used by the fixture.
 *
 * @type {Task[]}
 */
const TASKS: Task[] = [
  { id: 'CAD-482', name: "Corriger l'export CSV", span: allDay(12) },
  {
    id: 'CAD-490',
    name: 'Revue du correctif CSV',
    span: { start: day(12, 11), end: day(12, 12), allDay: false },
  },
  { id: 'CAD-491', name: 'Préparer la démo', span: allDay(12) },
  { id: 'CAD-492', name: 'Relire les maquettes', span: allDay(12) },
  { id: 'CAD-479', name: 'Maquetter la vue Calendrier', span: allDay(16, 18) },
  { id: 'CAD-485', name: 'Notifications par e-mail', span: allDay(17) },
  {
    id: 'CAD-462',
    name: 'Corriger le tri',
    span: { start: day(10, 9), end: day(10, 10), allDay: false },
  },
  { id: 'CAD-500', name: 'Sans échéance', span: null },
];

/**
 * Component Host
 *
 * @description
 * Hosts a calendar view and records emitted interactions.
 */
@Component({
  imports: [CwCalendarView, CwCalendarItemDef],
  template: `
    <cw-calendar-view
      [items]="items"
      [trackBy]="id"
      [itemLabel]="name"
      [itemSpan]="span"
      [today]="today"
      [showWeekends]="weekends()"
      [maxPerDay]="maxPerDay()"
      [readonly]="readonly()"
      [unscheduledCount]="1"
      [(view)]="view"
      [(date)]="date"
      (itemMove)="moves.push($event)"
      (create)="creations.push($event)"
      (open)="opened.push($event)"
      (unscheduledOpen)="unscheduled = unscheduled + 1"
    >
      <ng-template cwCalendarItem [cwCalendarItemOf]="items" let-task>
        <span class="truncate">{{ task.name }}</span>
      </ng-template>
    </cw-calendar-view>
  `,
})
class Host {
  // #region Properties
  /**
   * Property items
   *
   * @description
   * Items supplied to the calendar.
   *
   * @type {Task[]}
   * @readonly
   */
  public readonly items: Task[] = TASKS;

  /**
   * Property today
   *
   * @description
   * Current date supplied to the calendar.
   *
   * @type {Date}
   * @readonly
   */
  public readonly today: Date = day(12, 10, 12);

  /**
   * Property view
   *
   * @description
   * Calendar view selected by the fixture.
   *
   * @type {WritableSignal<CwCalendarViewMode>}
   * @readonly
   */
  public readonly view: WritableSignal<CwCalendarViewMode> = signal<CwCalendarViewMode>('month');

  /**
   * Property date
   *
   * @description
   * Displayed date controlled by the fixture.
   *
   * @type {WritableSignal<Date | null>}
   * @readonly
   */
  public readonly date: WritableSignal<Date | null> = signal<Date | null>(day(12));

  /**
   * Property weekends
   *
   * @description
   * Whether weekends are displayed.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly weekends: WritableSignal<boolean> = signal(true);

  /**
   * Property maxPerDay
   *
   * @description
   * Visible item lines a day in the month view.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly maxPerDay: WritableSignal<number> = signal(2);

  /**
   * Property readonly
   *
   * @description
   * Whether item changes are disabled.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly readonly: WritableSignal<boolean> = signal(false);

  /**
   * Property moves
   *
   * @description
   * Item moves emitted by the calendar.
   *
   * @type {CwCalendarItemMove<Task>[]}
   * @readonly
   */
  public readonly moves: CwCalendarItemMove<Task>[] = [];

  /**
   * Property creations
   *
   * @description
   * Creation requests emitted by the calendar.
   *
   * @type {CwCalendarCreate[]}
   * @readonly
   */
  public readonly creations: CwCalendarCreate[] = [];

  /**
   * Property opened
   *
   * @description
   * Items opened in the calendar.
   *
   * @type {Task[]}
   * @readonly
   */
  public readonly opened: Task[] = [];

  /**
   * Property unscheduled
   *
   * @description
   * Number of unscheduled-item requests.
   *
   * @type {number}
   */
  public unscheduled: number = 0;

  /**
   * Property id
   *
   * @description
   * Stable identifier of the task.
   *
   * @type {(task: Task) => string}
   * @readonly
   */
  public readonly id: (task: Task) => string = (task: Task): string => task.id;

  /**
   * Property name
   *
   * @description
   * Displayed task name.
   *
   * @type {(task: Task) => string}
   * @readonly
   */
  public readonly name: (task: Task) => string = (task: Task): string => task.name;

  /**
   * Property span
   *
   * @description
   * Scheduled dates and all-day state of the task.
   *
   * @type {(task: Task) => CwCalendarSpan | null}
   * @readonly
   */
  public readonly span: (task: Task) => CwCalendarSpan | null = (
    task: Task,
  ): CwCalendarSpan | null => task.span;
  // #endregion
}

/**
 * Function cell
 *
 * @description
 * Finds a calendar grid cell by its displayed date.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} name - Displayed or accessible name to find.
 * @returns {HTMLElement} Matching calendar cell.
 */
function cell(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('[role="gridcell"]'),
  ).find(
    // A cell is named by its content, which starts with its full date.
    (element) => element.firstElementChild?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No cell named ${name}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a button by its accessible name.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} name - Displayed or accessible name to find.
 * @returns {HTMLButtonElement} Matching button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('button'),
  ).find(
    (element) =>
      (element.getAttribute('aria-label') ??
        element.getAttribute('title') ??
        element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to a target.
 *
 * @param {HTMLElement} target - Element receiving the event.
 * @param {string} key - Keyboard key to dispatch.
 */
function press(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CwCalendarView', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;
  let announce: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    announce = vi.fn(() => Promise.resolve());
    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
    });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  /**
   * Function grid
   *
   * @description
   * Finds the calendar grid.
   * @returns {HTMLElement} Calendar grid element.
   */
  function grid(): HTMLElement {
    const found: HTMLElement | null = host.querySelector<HTMLElement>('[role="grid"]');
    if (!found) throw new Error('No grid');
    return found;
  }

  it('draws six weeks from Monday, named by the month', () => {
    expect(grid().getAttribute('aria-label')).toBe('Novembre 2026');
    expect(grid().querySelectorAll('[role="row"]').length).toBe(7);
    const headers: Element[] = Array.from(grid().querySelectorAll('[role="columnheader"]'));
    expect(headers.map((header) => header.textContent.trim())).toEqual([
      'lun.',
      'mar.',
      'mer.',
      'jeu.',
      'ven.',
      'sam.',
      'dim.',
    ]);
    expect(headers[0]?.querySelector('abbr')?.getAttribute('title')).toBe('lundi');
    expect(grid().querySelectorAll('[role="gridcell"]').length).toBe(42);
    expect(cell(host, 'lundi 26 octobre 2026').hasAttribute('data-outside')).toBe(true);
  });

  it('marks today and gives it the tab stop', () => {
    const today: HTMLElement = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
    expect(today.getAttribute('aria-current')).toBe('date');
    expect(today.getAttribute('tabindex')).toBe('0');
    expect(grid().querySelectorAll('[role="gridcell"][tabindex="0"]').length).toBe(1);
  });

  it('shows maxPerDay lines, then « +n autres »', () => {
    const today: HTMLElement = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
    const items: Element[] = Array.from(today.querySelectorAll('button[title]'));
    expect(items.map((item) => item.getAttribute('title'))).toEqual(["Corriger l'export CSV"]);
    expect(button(today, '+3 autres').getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('draws an item over several days as one bar', () => {
    const bar: HTMLButtonElement = button(host, 'Maquetter la vue Calendrier, du 16 au 18 nov.');
    expect(cell(host, 'lundi 16 novembre 2026, 1 tâche').contains(bar)).toBe(true);
    expect(bar.textContent).toContain('16 nov. – 18 nov.');
    expect(cell(host, 'mardi 17 novembre 2026, 2 tâches').textContent).toContain(
      'Notifications par e-mail',
    );
  });

  it('grows its days to maxPerDay lines, so every item is visible or behind « +n autres »', async () => {
    component.maxPerDay.set(3);
    await fixture.whenStable();
    // Thursday 12 November holds four one-day items: two pills and « +2 autres » on three lines.
    const today: HTMLElement | null = host.querySelector('[role="gridcell"][aria-current="date"]');

    expect(today?.style.height).toBe('94px');
    expect(today?.querySelectorAll('button[title]')).toHaveLength(2);
    expect(today?.querySelector('[data-more]')?.textContent.trim()).toBe('+2 autres');
  });

  it('grows only the weeks that use more lines than two', async () => {
    component.maxPerDay.set(4);
    await fixture.whenStable();
    const heights: string[] = Array.from(
      host.querySelectorAll<HTMLElement>('[role="gridcell"]'),
      (cell) => cell.style.height,
    );

    // The week of the 12th holds its four items on four lines; the other weeks keep 76 px.
    expect(heights.slice(14, 21)).toEqual(Array.from({ length: 7 }, () => '116px'));
    expect(heights.filter((height) => height !== '116px')).toEqual(
      Array.from({ length: 35 }, () => '76px'),
    );
  });

  it('keeps its 76 px days for two lines', () => {
    const today: HTMLElement | null = host.querySelector('[role="gridcell"][aria-current="date"]');

    expect(today?.style.height).toBe('76px');
  });

  it('opens an item on click and creates on a day', () => {
    button(host, 'Corriger le tri').click();
    expect(component.opened.map((task) => task.id)).toEqual(['CAD-462']);

    button(host, 'Créer une tâche le mardi 3 novembre').click();
    expect(component.creations).toEqual([{ date: day(3), allDay: true }]);
  });

  it('moves through the days with the keyboard and changes month at the edge', async () => {
    const today: HTMLElement = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
    today.focus();
    press(today, 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement?.firstElementChild?.textContent.trim()).toBe(
      'vendredi 13 novembre 2026',
    );

    press(document.activeElement as HTMLElement, 'PageDown');
    await fixture.whenStable();
    expect(grid().getAttribute('aria-label')).toBe('Décembre 2026');
    expect(document.activeElement?.firstElementChild?.textContent.trim()).toBe(
      'dimanche 13 décembre 2026',
    );

    press(document.activeElement as HTMLElement, 't');
    await fixture.whenStable();
    expect(grid().getAttribute('aria-label')).toBe('Novembre 2026');
    expect(document.activeElement?.getAttribute('aria-current')).toBe('date');
  });

  it('creates on the active day with N', () => {
    const today: HTMLElement = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
    today.focus();
    press(today, 'n');
    expect(component.creations).toEqual([{ date: day(12), allDay: true }]);
  });

  it('moves a grabbed item with Space and the arrows, keeping its times', async () => {
    const item: HTMLButtonElement = button(host, 'Corriger le tri');
    item.focus();
    press(item, ' ');
    await fixture.whenStable();
    expect(announce).toHaveBeenLastCalledWith(
      'Corriger le tri saisie. Flèches pour choisir le jour, Espace pour déposer, Échap pour annuler.',
      'polite',
    );
    press(document.activeElement as HTMLElement, 'ArrowDown');
    await fixture.whenStable();
    expect(cell(host, 'mardi 17 novembre 2026, 2 tâches').hasAttribute('data-drop-target')).toBe(
      true,
    );
    press(document.activeElement as HTMLElement, ' ');
    await fixture.whenStable();

    expect(component.moves).toEqual([
      { item: TASKS[6], start: day(17, 9), end: day(17, 10), allDay: false },
    ]);
    expect(announce).toHaveBeenLastCalledWith(
      'Corriger le tri déplacée au mardi 17 novembre',
      'polite',
    );
    // Under the bar, one line is left: the two one-day items go behind « +2 autres ».
    expect(button(cell(host, 'mardi 17 novembre 2026, 3 tâches'), '+2 autres')).toBeTruthy();
  });

  it('cancels a keyboard move on Escape', async () => {
    const item: HTMLButtonElement = button(host, 'Corriger le tri');
    press(item, ' ');
    press(document.activeElement as HTMLElement, 'ArrowRight');
    await fixture.whenStable();
    press(document.activeElement as HTMLElement, 'Escape');
    await fixture.whenStable();
    expect(component.moves).toEqual([]);
    expect(announce).toHaveBeenLastCalledWith('Déplacement annulé.', 'polite');
  });

  it('reschedules an item dropped with the pointer on another day', async () => {
    const lists: DebugElement[] = fixture.debugElement.queryAll(By.directive(CdkDropList));
    const lists$: CdkDropList<DropData>[] = lists.map(
      (element) => element.injector.get(CdkDropList) as unknown as CdkDropList<DropData>,
    );
    const source: CdkDropList<DropData> | undefined = lists$.find((list) =>
      list.getSortedItems().some((drag) => drag.data === 'CAD-485'),
    );
    const target: CdkDropList<DropData> | undefined = lists$.find(
      (list) => list.data.date.getTime() === day(24).getTime(),
    );
    const drag: CdkDrag<string> | undefined = source
      ?.getSortedItems()
      .find((candidate) => candidate.data === 'CAD-485');
    if (!source || !target || !drag) throw new Error('Drop lists missing');
    target.dropped.emit({
      previousContainer: source,
      container: target,
      previousIndex: 0,
      currentIndex: 0,
      item: drag,
      isPointerOverContainer: true,
    } as unknown as CdkDragDrop<DropData, DropData, string>);
    await fixture.whenStable();
    expect(component.moves).toEqual([
      { item: TASKS[5], start: day(24), end: day(24), allDay: true },
    ]);
    expect(cell(host, 'mardi 24 novembre 2026, 1 tâche').textContent).toContain(
      'Notifications par e-mail',
    );
  });

  /**
   * Function dropLists
   *
   * @description
   * The calendar's drop lists, one per day.
   *
   * @returns {CdkDropList<DropData>[]} Drop lists of the month grid.
   */
  function dropLists(): CdkDropList<DropData>[] {
    return fixture.debugElement
      .queryAll(By.directive(CdkDropList))
      .map((element) => element.injector.get(CdkDropList) as unknown as CdkDropList<DropData>);
  }

  /**
   * Function pressBar
   *
   * @description
   * Presses the 16–18 November bar with the pointer at a share of its width.
   *
   * @param {number} share - Share of the bar's width under the pointer, from 0 to 1.
   */
  function pressBar(share: number): void {
    const bar: HTMLButtonElement = button(host, 'Maquetter la vue Calendrier, du 16 au 18 nov.');
    vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 0, 300, 26));
    bar.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 100 + 300 * share }));
  }

  /**
   * Function dragTo
   *
   * @description
   * Starts a pointer drag of the first drawing of the 16–18 November item (its bar, or its first
   * pill), then releases it on a day through the CDK events.
   *
   * @param {number} target - Day of November the item is released on.
   * @param {boolean} [over] - Whether the pointer is over that day when released.
   */
  async function dragTo(target: number, over: boolean = true): Promise<void> {
    const lists: CdkDropList<DropData>[] = dropLists();
    const source: CdkDropList<DropData> | undefined = lists.find((list) =>
      list.getSortedItems().some((drag) => drag.data === 'CAD-479'),
    );
    const container: CdkDropList<DropData> | undefined = lists.find(
      (list) => list.data.date.getTime() === day(target).getTime(),
    );
    const drag: CdkDrag<string> | undefined = source
      ?.getSortedItems()
      .find((candidate) => candidate.data === 'CAD-479');
    if (!source || !container || !drag) throw new Error('Drop lists missing');
    drag.started.emit({ source: drag, event: new MouseEvent('mousemove') });
    container.dropped.emit({
      previousContainer: source,
      container,
      previousIndex: 0,
      currentIndex: 0,
      item: drag,
      isPointerOverContainer: over,
    } as unknown as CdkDragDrop<DropData, DropData, string>);
    await fixture.whenStable();
  }

  it('moves a bar grabbed by its middle day by the days between that day and the target', async () => {
    pressBar(0.5);
    await dragTo(18);

    expect(component.moves).toEqual([
      { item: TASKS[4], start: day(17), end: day(19), allDay: true },
    ]);
  });

  it('leaves a bar dropped on the day it was grabbed by where it is', async () => {
    pressBar(0.5);
    await dragTo(17);
    pressBar(0.1);
    await dragTo(16);

    expect(component.moves).toEqual([]);
  });

  it('leaves a bar released outside every day where it is', async () => {
    pressBar(0.9);
    await dragTo(19, false);

    expect(component.moves).toEqual([]);
  });

  it('moves a pill by its start after a click on its bar that never dragged', async () => {
    pressBar(0.9);
    // One line a day: the bar has no line left and is drawn as a pill on each of its days.
    component.maxPerDay.set(1);
    await fixture.whenStable();
    await dragTo(20);

    expect(component.moves).toEqual([
      { item: TASKS[4], start: day(20), end: day(22), allDay: true },
    ]);
  });

  it('switches to the week view with its all-day row and hourly slots', async () => {
    button(host, 'Semaine').click();
    await fixture.whenStable();
    expect(component.view()).toBe('week');
    expect(grid().getAttribute('aria-label')).toBe('Semaine du 9 au 15 novembre 2026');
    expect(host.textContent).toContain('9 – 15 nov. 2026');
    const today: Element | undefined = Array.from(
      grid().querySelectorAll('[role="columnheader"]'),
    ).find((header) => header.getAttribute('aria-current') === 'date');
    expect(today?.textContent.replace(/\s+/g, '')).toBe('jeu.12');
    expect(grid().querySelector('[role="rowheader"]')?.textContent.trim()).toBe('Journée');

    const block: HTMLButtonElement = button(host, 'Corriger le tri');
    expect(block.textContent).toContain('9:00 – 10:00');
    expect(cell(host, 'mardi 10 novembre 2026, 9:00').contains(block)).toBe(true);
    expect(cell(host, 'jeudi 12 novembre 2026, 10:00').querySelector('svg')).not.toBeNull();
  });

  it('moves a block to another slot, keeping its duration', async () => {
    component.view.set('week');
    await fixture.whenStable();
    const block: HTMLButtonElement = button(host, 'Corriger le tri');
    press(block, ' ');
    await fixture.whenStable();
    press(document.activeElement as HTMLElement, 'ArrowDown');
    await fixture.whenStable();
    press(document.activeElement as HTMLElement, 'ArrowRight');
    await fixture.whenStable();
    press(document.activeElement as HTMLElement, ' ');
    expect(component.moves).toEqual([
      { item: TASKS[6], start: day(11, 9, 30), end: day(11, 10, 30), allDay: false },
    ]);
  });

  it('creates at a slot on double click', async () => {
    component.view.set('week');
    await fixture.whenStable();
    cell(host, 'mercredi 11 novembre 2026, 14:30').dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true }),
    );
    expect(component.creations).toEqual([{ date: day(11, 14, 30), allDay: false }]);
  });

  it('drops the weekends when asked', async () => {
    component.weekends.set(false);
    await fixture.whenStable();
    expect(grid().querySelectorAll('[role="columnheader"]').length).toBe(5);
    expect(grid().querySelectorAll('[role="gridcell"]').length).toBe(30);
  });

  it('turns off creation and dragging when read-only', async () => {
    component.readonly.set(true);
    await fixture.whenStable();
    expect(host.querySelector('button[aria-label^="Créer une tâche"]')).toBeNull();
    press(button(host, 'Corriger le tri'), ' ');
    expect(announce).not.toHaveBeenCalled();
  });

  it('navigates with the header and emits « Sans date »', async () => {
    button(host, 'Mois suivant').click();
    await fixture.whenStable();
    expect(grid().getAttribute('aria-label')).toBe('Décembre 2026');
    button(host, 'Aujourd’hui').click();
    await fixture.whenStable();
    expect(grid().getAttribute('aria-label')).toBe('Novembre 2026');
    button(host, 'Sans date 1').click();
    expect(component.unscheduled).toBe(1);
  });
});

describe('provideCwLocale', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideCwLocale('en-US'),
        { provide: LiveAnnouncer, useValue: { announce: () => Promise.resolve() } },
      ],
    });
  });

  it('names a day in English while keeping the task count in French', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(cell(host, 'Thursday, November 12, 2026, 4 tâches').getAttribute('aria-current')).toBe(
      'date',
    );
  });
});

describe('provideCwCalendarViewLabels', () => {
  it('replaces the default text below the provider', async () => {
    TestBed.configureTestingModule({
      providers: [provideCwCalendarViewLabels({ today: 'Today' })],
    });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Today');
    fixture.destroy();
  });
});

/**
 * Component PlanningHost
 *
 * @description
 * Hosts a month calendar beside an outside list of undated tasks, with the day menu and the
 * loading state.
 */
@Component({
  imports: [CdkDrag, CdkDropList, CwCalendarView, CwMenu, CwMenuItem],
  template: `
    <div cdkDropList [cdkDropListConnectedTo]="calendar.dropListIds()">
      <button
        type="button"
        cdkDrag
        [cdkDragData]="undated"
        (keydown.space)="calendar.scheduleWithKeyboard(undated, undated.name)"
      >
        {{ undated.name }}
      </button>
    </div>
    <cw-calendar-view
      #calendar
      [items]="items"
      [trackBy]="id"
      [itemLabel]="name"
      [itemSpan]="span"
      [today]="today"
      [date]="today"
      [loading]="loading()"
      [dayMenu]="dayMenu"
      (itemSchedule)="schedules.push($event)"
      (itemMove)="moves.push($event)"
    />
    <cw-menu #dayMenu ariaLabel="Actions du jour">
      <button cwMenuItem (triggered)="picked.push(dayMenu.data())">
        Nouvelle tâche ce jour-là
      </button>
    </cw-menu>
  `,
})
class PlanningHost {
  // #region Properties
  /**
   * Property items
   *
   * @description
   * Dated tasks drawn by the calendar.
   *
   * @type {Task[]}
   * @readonly
   */
  public readonly items: Task[] = TASKS.slice(0, 1);

  /**
   * Property undated
   *
   * @description
   * The outside task to schedule.
   *
   * @type {Task}
   * @readonly
   */
  public readonly undated: Task = TASKS[7];

  /**
   * Property today
   *
   * @description
   * Current day of the fixture.
   *
   * @type {Date}
   * @readonly
   */
  public readonly today: Date = day(12);

  /**
   * Property loading
   *
   * @description
   * Whether the calendar shows its loading skeleton.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly loading: WritableSignal<boolean> = signal(false);

  /**
   * Property schedules
   *
   * @description
   * Recorded `itemSchedule` events.
   *
   * @type {CwCalendarItemSchedule[]}
   * @readonly
   */
  public readonly schedules: CwCalendarItemSchedule[] = [];

  /**
   * Property moves
   *
   * @description
   * Recorded `itemMove` events.
   *
   * @type {CwCalendarItemMove<Task>[]}
   * @readonly
   */
  public readonly moves: CwCalendarItemMove<Task>[] = [];

  /**
   * Property picked
   *
   * @description
   * Data the day menu acted on.
   *
   * @type {unknown[]}
   * @readonly
   */
  public readonly picked: unknown[] = [];

  /**
   * Property id
   *
   * @description
   * Reads a task identifier.
   *
   * @type {(task: Task) => string}
   * @readonly
   */
  public readonly id: (task: Task) => string = (task: Task): string => task.id;

  /**
   * Property name
   *
   * @description
   * Reads a task name.
   *
   * @type {(task: Task) => string}
   * @readonly
   */
  public readonly name: (task: Task) => string = (task: Task): string => task.name;

  /**
   * Property span
   *
   * @description
   * Reads when a task happens.
   *
   * @type {(task: Task) => CwCalendarSpan | null}
   * @readonly
   */
  public readonly span: (task: Task) => CwCalendarSpan | null = (
    task: Task,
  ): CwCalendarSpan | null => task.span;
  // #endregion
}

/**
 * Function menuItem
 *
 * @description
 * Finds an item of an open menu by its visible name.
 *
 * @param {string} name - Visible menu item text.
 * @returns {HTMLElement} Matching menu item.
 */
function menuItem(name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ).find((element) => element.textContent.trim() === name);
  if (!found) throw new Error(`No menu item named ${name}`);
  return found;
}

describe('CwCalendarView planning hooks', () => {
  let fixture: ComponentFixture<PlanningHost>;
  let host: HTMLElement;
  let component: PlanningHost;
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

  afterEach(() => {
    fixture.destroy();
  });

  it('names its day lists so an outside list can connect to them', () => {
    const calendar: CwCalendarView<Task> = fixture.debugElement
      .query(By.directive(CwCalendarView))
      .injector.get(CwCalendarView<Task>);
    const ids: string[] = calendar.dropListIds();

    expect(ids).toHaveLength(42);
    expect(host.querySelector(`[id="${ids[0] ?? ''}"]`)?.getAttribute('role')).toBe('gridcell');
  });

  it('emits itemSchedule when an outside item is dropped on a day', async () => {
    const lists: CdkDropList<unknown>[] = fixture.debugElement
      .queryAll(By.directive(CdkDropList))
      .map((element) => element.injector.get(CdkDropList) as CdkDropList<unknown>);
    const outside: CdkDropList<unknown> | undefined = lists.find((list) => list.data === undefined);
    const target: CdkDropList<DropData> | undefined = lists.find(
      (list) => (list.data as DropData | undefined)?.date.getTime() === day(24).getTime(),
    ) as CdkDropList<DropData> | undefined;
    const drag: CdkDrag<unknown> | undefined = outside?.getSortedItems()[0];
    if (!outside || !target || !drag) throw new Error('Drop lists missing');

    target.dropped.emit({
      previousContainer: outside,
      container: target,
      previousIndex: 0,
      currentIndex: 0,
      item: drag,
      isPointerOverContainer: true,
    } as unknown as CdkDragDrop<DropData, DropData, unknown>);
    await fixture.whenStable();

    expect(component.schedules).toEqual([{ data: TASKS[7], date: day(24), allDay: true }]);
  });

  it('schedules an outside item whose data equals an item id instead of moving that item', async () => {
    const lists: CdkDropList<unknown>[] = fixture.debugElement
      .queryAll(By.directive(CdkDropList))
      .map((element) => element.injector.get(CdkDropList) as CdkDropList<unknown>);
    const outside: CdkDropList<unknown> | undefined = lists.find((list) => list.data === undefined);
    const target: CdkDropList<DropData> | undefined = lists.find(
      (list) => (list.data as DropData | undefined)?.date.getTime() === day(24).getTime(),
    ) as CdkDropList<DropData> | undefined;
    if (!outside || !target) throw new Error('Drop lists missing');

    target.dropped.emit({
      previousContainer: outside,
      container: target,
      previousIndex: 0,
      currentIndex: 0,
      item: { data: 'CAD-482', dropContainer: outside },
      isPointerOverContainer: true,
    } as unknown as CdkDragDrop<DropData, DropData, unknown>);
    await fixture.whenStable();

    expect(component.moves).toEqual([]);
    expect(component.schedules).toEqual([{ data: 'CAD-482', date: day(24), allDay: true }]);
  });

  it('places an outside item with the keyboard, and gives the focus back on Escape', async () => {
    const source: HTMLButtonElement | null = host.querySelector('button[cdkDrag]');
    if (!source) throw new Error('Outside item missing');
    source.focus();
    press(source, ' ');
    await fixture.whenStable();
    const start: HTMLElement = document.activeElement as HTMLElement;
    expect(start.getAttribute('aria-current')).toBe('date');

    press(start, 'Escape');
    await fixture.whenStable();
    expect(document.activeElement).toBe(source);
    expect(component.schedules).toEqual([]);

    press(source, ' ');
    await fixture.whenStable();
    press(document.activeElement as HTMLElement, 'ArrowRight');
    await fixture.whenStable();
    press(document.activeElement as HTMLElement, 'Enter');
    await fixture.whenStable();

    expect(component.schedules).toEqual([{ data: TASKS[7], date: day(13), allDay: true }]);
    expect(announce).toHaveBeenLastCalledWith(
      'Sans échéance replanifiée. Échéance : vendredi 13 novembre.',
      'polite',
    );
  });

  it('opens the day menu on a right click and on Shift + F10, on that day', async () => {
    const target: HTMLElement = cell(host, 'mardi 24 novembre 2026');
    target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    menuItem('Nouvelle tâche ce jour-là').click();
    await fixture.whenStable();

    const today: HTMLElement = cell(host, 'jeudi 12 novembre 2026, 1 tâche');
    today.focus();
    today.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(document.activeElement).toBe(menuItem('Nouvelle tâche ce jour-là'));
    menuItem('Nouvelle tâche ce jour-là').click();
    await fixture.whenStable();

    expect(component.picked).toEqual([
      { date: day(24), allDay: true },
      { date: day(12), allDay: true },
    ]);
  });

  it('replaces the grid with a named busy skeleton while loading', async () => {
    component.loading.set(true);
    await fixture.whenStable();

    const status: HTMLElement | null = host.querySelector('[role="status"]');
    expect(status?.getAttribute('aria-label')).toBe('Chargement du calendrier');
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('[role="grid"]')).toBeNull();
  });
});

/**
 * Component OutlinedHost
 *
 * @description
 * Hosts the mockup's month: `outlined` days, the `title` header, no view toggle.
 */
@Component({
  imports: [CwCalendarView],
  template: `
    <cw-calendar-view
      variant="outlined"
      toolbar="title"
      viewToggle="false"
      [maxPerDay]="maxPerDay()"
      [items]="items"
      [trackBy]="id"
      [itemLabel]="name"
      [itemSpan]="span"
      [today]="today"
      [date]="today"
    />
  `,
})
class OutlinedHost {
  // #region Properties
  /**
   * Property items
   *
   * @description
   * Tasks shown in the calendar.
   *
   * @type {Task[]}
   * @readonly
   */
  public readonly items: Task[] = TASKS;

  /**
   * Property today
   *
   * @description
   * The current day, Thursday 12 November 2026.
   *
   * @type {Date}
   * @readonly
   */
  public readonly today: Date = day(12, 10, 12);

  /**
   * Property maxPerDay
   *
   * @description
   * Visible item lines a day.
   *
   * @type {WritableSignal<number>}
   * @readonly
   */
  public readonly maxPerDay: WritableSignal<number> = signal(2);

  /**
   * Property id
   *
   * @description
   * Reads a task's id.
   *
   * @type {(task: Task) => string}
   * @readonly
   */
  public readonly id: (task: Task) => string = (task) => task.id;

  /**
   * Property name
   *
   * @description
   * Reads a task's name.
   *
   * @type {(task: Task) => string}
   * @readonly
   */
  public readonly name: (task: Task) => string = (task) => task.name;

  /**
   * Property span
   *
   * @description
   * Reads a task's span.
   *
   * @type {(task: Task) => CwCalendarSpan | null}
   * @readonly
   */
  public readonly span: (task: Task) => CwCalendarSpan | null = (task) => task.span;
  // #endregion
}

describe('CwCalendarView outlined, with the title toolbar', () => {
  let host: HTMLElement;
  let fixture: ComponentFixture<OutlinedHost>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce: () => Promise.resolve() } }],
    });
    fixture = TestBed.createComponent(OutlinedHost);
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('heads the calendar with the month and groups the navigation at the end, without view toggle', () => {
    const heading: HTMLElement | null = host.querySelector('h2');
    const navigation: HTMLElement | null = host.querySelector(
      '[role="group"][aria-label="Navigation du calendrier"]',
    );

    expect(heading?.textContent.trim()).toBe('Novembre 2026');
    expect(navigation?.textContent).toContain('Aujourd’hui');
    expect(host.querySelector('[role="radiogroup"]')).toBeNull();
  });

  it('keeps the number alone in the circle of the first day and names the month beside it', () => {
    const first: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>('[role="gridcell"]'),
    ).find((element) => element.textContent.includes('dimanche 1 novembre 2026'));
    const circle: HTMLElement | null | undefined = first?.querySelector('.size-6');

    expect(circle?.textContent.trim()).toBe('1');
    expect(circle?.nextElementSibling?.textContent.trim()).toBe('nov.');
  });

  it('grows its days to maxPerDay lines, so every item is visible or behind « +n autres »', async () => {
    fixture.componentInstance.maxPerDay.set(3);
    fixture.detectChanges();
    await fixture.whenStable();
    // Thursday 12 November holds four one-day items: two chips and « +2 autres » on three lines.
    const today: HTMLElement | null = host.querySelector('[role="gridcell"][aria-current="date"]');
    const chips: HTMLElement[] = Array.from(
      today?.querySelectorAll<HTMLElement>('button[title]') ?? [],
    );
    const more: HTMLElement | null | undefined = today?.querySelector('[data-more]');

    expect(today?.style.height).toBe('126px');
    expect(chips).toHaveLength(2);
    expect(more?.textContent.trim()).toBe('+2 autres');

    fixture.componentInstance.maxPerDay.set(4);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(today?.style.height).toBe('156px');
    expect(today?.querySelectorAll('button[title]')).toHaveLength(4);
    expect(today?.querySelector('[data-more]')).toBeNull();
  });

  it('sizes each week to the lines its fullest day uses, never below 96 px', async () => {
    fixture.componentInstance.maxPerDay.set(3);
    fixture.detectChanges();
    await fixture.whenStable();
    const rows: HTMLElement[][] = Array.from(
      host.querySelectorAll<HTMLElement>('[role="grid"] [role="row"]'),
    )
      .map((row) => Array.from(row.querySelectorAll<HTMLElement>('[role="gridcell"]')))
      .filter((cells) => cells.length > 0);
    const heights: string[][] = rows.map((cells) => cells.map((cell) => cell.style.height));

    // The week of the 12th uses three lines (two chips and « +2 autres »); the week of the 16th
    // two (the bar and the 17th's chip); the others none or one.
    expect(heights.map((week) => new Set(week).size)).toEqual([1, 1, 1, 1, 1, 1]);
    expect(heights.map((week) => week[0])).toEqual([
      '96px',
      '96px',
      '126px',
      '96px',
      '96px',
      '96px',
    ]);
    const seventeenth: HTMLElement | undefined = rows.at(3)?.at(1);
    expect(seventeenth?.textContent).toContain('Notifications par e-mail');
    expect(seventeenth?.querySelector('[data-more]')).toBeNull();
  });

  it('keeps 96 px days for two lines, the mockup height', () => {
    const today: HTMLElement | null = host.querySelector('[role="gridcell"][aria-current="date"]');

    expect(today?.style.height).toBe('96px');
  });

  it('marks the days of other months and fills the number of today', () => {
    const outside: HTMLElement | null = host.querySelector('[role="gridcell"][data-outside]');
    const today: HTMLElement | null = host.querySelector('[role="gridcell"][aria-current="date"]');

    expect(outside?.classList).toContain('bg-muted');
    expect(today?.querySelector('.bg-foreground')?.textContent.trim()).toBe('12');
  });
});
