import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDropList, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CwCalendarItemDef } from './calendar-item-def/calendar-item-def.directive';
import { CwCalendarView } from './calendar-view.component';
import type {
  CwCalendarCreate,
  CwCalendarItemMove,
  CwCalendarSpan,
  CwCalendarViewMode,
} from './calendar-view.types';

interface Task {
  readonly id: string;
  readonly name: string;
  readonly span: CwCalendarSpan | null;
}

function day(date: number, hours = 0, minutes = 0): Date {
  return new Date(2026, 10, date, hours, minutes);
}

function allDay(date: number, to = date): CwCalendarSpan {
  return { start: day(date), end: day(to), allDay: true };
}

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
  readonly items = TASKS;
  readonly today = day(12, 10, 12);
  readonly view = signal<CwCalendarViewMode>('month');
  readonly date = signal<Date | null>(day(12));
  readonly weekends = signal(true);
  readonly readonly = signal(false);
  readonly moves: CwCalendarItemMove<Task>[] = [];
  readonly creations: CwCalendarCreate[] = [];
  readonly opened: Task[] = [];
  unscheduled = 0;
  readonly id = (task: Task): string => task.id;
  readonly name = (task: Task): string => task.name;
  readonly span = (task: Task): CwCalendarSpan | null => task.span;
}

function cell(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('[role="gridcell"]')).find(
    // A cell is named by its content, which starts with its full date.
    (element) => element.firstElementChild?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No cell named ${name}`);
  return found;
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
    (element) =>
      (element.getAttribute('aria-label') ??
        element.getAttribute('title') ??
        element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

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

  function grid(): HTMLElement {
    const found = host.querySelector<HTMLElement>('[role="grid"]');
    if (!found) throw new Error('No grid');
    return found;
  }

  it('draws six weeks from Monday, named by the month', () => {
    expect(grid().getAttribute('aria-label')).toBe('Novembre 2026');
    expect(grid().querySelectorAll('[role="row"]').length).toBe(7);
    const headers = Array.from(grid().querySelectorAll('[role="columnheader"]'));
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
    const today = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
    expect(today.getAttribute('aria-current')).toBe('date');
    expect(today.getAttribute('tabindex')).toBe('0');
    expect(grid().querySelectorAll('[role="gridcell"][tabindex="0"]').length).toBe(1);
  });

  it('shows maxPerDay lines, then « +n autres »', () => {
    const today = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
    const items = Array.from(today.querySelectorAll('button[title]'));
    expect(items.map((item) => item.getAttribute('title'))).toEqual(["Corriger l'export CSV"]);
    expect(button(today, '+3 autres').getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('draws an item over several days as one bar', () => {
    const bar = button(host, 'Maquetter la vue Calendrier, du 16 au 18 nov.');
    expect(cell(host, 'lundi 16 novembre 2026, 1 tâche').contains(bar)).toBe(true);
    expect(bar.textContent).toContain('16 nov. – 18 nov.');
    expect(cell(host, 'mardi 17 novembre 2026, 2 tâches').textContent).toContain(
      'Notifications par e-mail',
    );
  });

  it('opens an item on click and creates on a day', () => {
    button(host, 'Corriger le tri').click();
    expect(component.opened.map((task) => task.id)).toEqual(['CAD-462']);

    button(host, 'Créer une tâche le 3 novembre').click();
    expect(component.creations).toEqual([{ date: day(3), allDay: true }]);
  });

  it('moves through the days with the keyboard and changes month at the edge', async () => {
    const today = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
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
    const today = cell(host, 'jeudi 12 novembre 2026, 4 tâches');
    today.focus();
    press(today, 'n');
    expect(component.creations).toEqual([{ date: day(12), allDay: true }]);
  });

  it('moves a grabbed item with Space and the arrows, keeping its times', async () => {
    const item = button(host, 'Corriger le tri');
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
    const item = button(host, 'Corriger le tri');
    press(item, ' ');
    press(document.activeElement as HTMLElement, 'ArrowRight');
    await fixture.whenStable();
    press(document.activeElement as HTMLElement, 'Escape');
    await fixture.whenStable();
    expect(component.moves).toEqual([]);
    expect(announce).toHaveBeenLastCalledWith('Déplacement annulé.', 'polite');
  });

  it('reschedules an item dropped with the pointer on another day', async () => {
    const lists = fixture.debugElement.queryAll(By.directive(CdkDropList));
    const lists$ = lists.map((element) => element.injector.get(CdkDropList));
    const source = lists$.find((list) =>
      list.getSortedItems().some((drag) => drag.data === 'CAD-485'),
    );
    const target = lists$.find(
      (list) => (list.data as { date: Date }).date.getTime() === day(24).getTime(),
    );
    const drag = source?.getSortedItems().find((candidate) => candidate.data === 'CAD-485');
    if (!source || !target || !drag) throw new Error('Drop lists missing');
    target.dropped.emit({
      previousContainer: source,
      container: target,
      previousIndex: 0,
      currentIndex: 0,
      item: drag,
    } as unknown as CdkDragDrop<unknown>);
    await fixture.whenStable();
    expect(component.moves).toEqual([
      { item: TASKS[5], start: day(24), end: day(24), allDay: true },
    ]);
    expect(cell(host, 'mardi 24 novembre 2026, 1 tâche').textContent).toContain(
      'Notifications par e-mail',
    );
  });

  it('switches to the week view with its all-day row and hourly slots', async () => {
    button(host, 'Semaine').click();
    await fixture.whenStable();
    expect(component.view()).toBe('week');
    expect(grid().getAttribute('aria-label')).toBe('Semaine du 9 au 15 novembre 2026');
    expect(host.textContent).toContain('9 – 15 nov. 2026');
    const today = Array.from(grid().querySelectorAll('[role="columnheader"]')).find(
      (header) => header.getAttribute('aria-current') === 'date',
    );
    expect(today?.textContent.replace(/\s+/g, '')).toBe('jeu.12');
    expect(grid().querySelector('[role="rowheader"]')?.textContent.trim()).toBe('Journée');

    const block = button(host, 'Corriger le tri');
    expect(block.textContent).toContain('9:00 – 10:00');
    expect(cell(host, 'mardi 10 novembre 2026, 9:00').contains(block)).toBe(true);
    expect(cell(host, 'jeudi 12 novembre 2026, 10:00').querySelector('svg')).not.toBeNull();
  });

  it('moves a block to another slot, keeping its duration', async () => {
    component.view.set('week');
    await fixture.whenStable();
    const block = button(host, 'Corriger le tri');
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
