import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDropList, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CwKanban } from './kanban.component';
import { CwKanbanCardDef } from './kanban-card-def/kanban-card-def.directive';
import { CwKanbanEmptyDef } from './kanban-empty-def/kanban-empty-def.directive';
import type {
  CwKanbanColumn,
  CwKanbanCreate,
  CwKanbanLane,
  CwKanbanMove,
  CwKanbanWipExceeded,
} from './kanban.types';

interface Card {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly priority: string;
}

const COLUMNS: CwKanbanColumn[] = [
  { id: 'todo', label: 'À faire', status: 'todo' },
  { id: 'progress', label: 'En cours', status: 'progress' },
  { id: 'blocked', label: 'Bloqué', status: 'blocked' },
];

const LANES: CwKanbanLane[] = [
  { id: 'haute', label: 'Haute' },
  { id: 'basse', label: 'Basse' },
];

const CARDS: Card[] = [
  { id: 'CAD-488', name: 'Importer les espaces', status: 'todo', priority: 'haute' },
  { id: 'CAD-485', name: 'Notifications par e-mail', status: 'todo', priority: 'basse' },
  { id: 'CAD-482', name: "Corriger l'export CSV", status: 'progress', priority: 'haute' },
  { id: 'CAD-479', name: 'Maquetter la vue Calendrier', status: 'progress', priority: 'basse' },
];

@Component({
  imports: [CwKanban, CwKanbanCardDef, CwKanbanEmptyDef],
  template: `
    <cw-kanban
      ariaLabel="Tableau de Sprint 14"
      [columns]="columns"
      [items]="items()"
      [trackBy]="id"
      [groupBy]="status"
      [itemLabel]="label"
      [lanes]="lanes()"
      [swimlaneBy]="swimlaneBy()"
      [wipLimits]="limits"
      [readonly]="readonly()"
      [(collapsedColumns)]="collapsed"
      [(collapsedLanes)]="collapsedLanes"
      [(selection)]="selection"
      (moved)="moves.push($event)"
      (created)="creations.push($event)"
      (wipExceeded)="exceeded.push($event)"
      (open)="opened.push($event)"
    >
      <ng-template cwKanbanCard [cwKanbanCardOf]="items()" let-card>
        <span>{{ card.id }}</span>
        <p>{{ card.name }}</p>
      </ng-template>
      <ng-template cwKanbanEmpty let-column>Rien dans {{ column.label }}</ng-template>
    </cw-kanban>
  `,
})
class Host {
  readonly columns = COLUMNS;
  readonly items = signal<readonly Card[]>(CARDS);
  readonly lanes = signal<readonly CwKanbanLane[]>([]);
  readonly swimlaneBy = signal<((card: Card) => string) | null>(null);
  readonly readonly = signal(false);
  readonly limits = { progress: 2 };
  readonly collapsed = signal<readonly string[]>([]);
  readonly collapsedLanes = signal<readonly string[]>([]);
  readonly selection = signal<readonly string[]>([]);
  readonly moves: CwKanbanMove<Card>[] = [];
  readonly creations: CwKanbanCreate[] = [];
  readonly exceeded: CwKanbanWipExceeded[] = [];
  readonly opened: Card[] = [];
  readonly id = (card: Card): string => card.id;
  readonly status = (card: Card): string => card.status;
  readonly label = (card: Card): string => `${card.id} — ${card.name}`;
}

function group(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('[role="group"]')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

function card(host: HTMLElement, id: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('article')).find((element) =>
    element.getAttribute('aria-label')?.startsWith(id),
  );
  if (!found) throw new Error(`No card ${id}`);
  return found;
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

function laneHeader(host: HTMLElement, label: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')).find(
    (element) => element.textContent.trim().startsWith(label),
  );
  if (!found) throw new Error(`No lane header ${label}`);
  return found;
}

function cardNames(list: HTMLElement): string[] {
  return Array.from(list.querySelectorAll('article')).map(
    (element) => element.getAttribute('aria-label')?.split(' — ')[0] ?? '',
  );
}

function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  );
}

describe('CwKanban', () => {
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

  it('draws a named region with one named group and list per column', () => {
    expect(host.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe(
      'Tableau de Sprint 14',
    );
    const todo = group(host, 'Colonne À faire');
    const list = todo.querySelector('[role="list"]');
    expect(list?.getAttribute('aria-label')).toBe('À faire');
    expect(list?.querySelectorAll('[role="listitem"]').length).toBe(2);
    expect(cardNames(todo)).toEqual(['CAD-488', 'CAD-485']);
    expect(todo.textContent).toContain('2 tâches');
    expect(card(host, 'CAD-488').textContent).toContain('Importer les espaces');
  });

  it('gives one tab stop to the cards', () => {
    const stops = Array.from(host.querySelectorAll('article')).filter(
      (element) => element.getAttribute('tabindex') === '0',
    );
    expect(stops.length).toBe(1);
    expect(card(host, 'CAD-488').getAttribute('aria-describedby')).toBeTruthy();
  });

  it('shows the limit as a counter and warns when it is exceeded', async () => {
    const progress = group(host, 'Colonne En cours');
    expect(progress.textContent).toContain('2/2');
    expect(progress.textContent).toContain('2 tâches, limite de 2');
    expect(progress.querySelector('[role="status"]')).toBeNull();

    component.items.set([
      ...CARDS,
      { id: 'CAD-471', name: 'Migrer', status: 'progress', priority: 'haute' },
    ]);
    await fixture.whenStable();
    expect(progress.textContent).toContain('3/2');
    expect(progress.querySelector('[role="status"]')?.textContent.trim()).toBe(
      'Limite de 2 dépassée',
    );
    expect(progress.hasAttribute('data-over-limit')).toBe(true);
  });

  it('moves the focus with the arrows', async () => {
    const first = card(host, 'CAD-488');
    first.focus();
    press(first, 'ArrowDown');
    await fixture.whenStable();
    expect(document.activeElement).toBe(card(host, 'CAD-485'));

    press(card(host, 'CAD-485'), 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement).toBe(card(host, 'CAD-479'));
    expect(card(host, 'CAD-479').getAttribute('tabindex')).toBe('0');
  });

  it('opens a card on Enter and on click, and toggles the selection with Ctrl', async () => {
    const target = card(host, 'CAD-482');
    press(target, 'Enter');
    target.click();
    expect(component.opened.map((item) => item.id)).toEqual(['CAD-482', 'CAD-482']);

    press(target, ' ', { ctrlKey: true });
    await fixture.whenStable();
    expect(component.selection()).toEqual(['CAD-482']);
    expect(card(host, 'CAD-482').getAttribute('aria-label')).toBe(
      "CAD-482 — Corriger l'export CSV, sélectionnée",
    );

    card(host, 'CAD-482').dispatchEvent(new MouseEvent('click', { ctrlKey: true, bubbles: true }));
    await fixture.whenStable();
    expect(component.selection()).toEqual([]);
  });

  it('moves a grabbed card with the keyboard and announces each step', async () => {
    const grabbed = card(host, 'CAD-485');
    grabbed.focus();
    press(grabbed, ' ');
    await fixture.whenStable();
    expect(announce).toHaveBeenLastCalledWith(
      'CAD-485 — Notifications par e-mail saisie. Colonne À faire, position 2 sur 2. Flèches pour déplacer, Espace pour déposer, Échap pour annuler.',
      'assertive',
    );

    press(card(host, 'CAD-485'), 'ArrowRight');
    await fixture.whenStable();
    expect(cardNames(group(host, 'Colonne En cours'))).toEqual(['CAD-482', 'CAD-485', 'CAD-479']);
    expect(document.activeElement).toBe(card(host, 'CAD-485'));
    expect(announce).toHaveBeenLastCalledWith(
      'Colonne En cours, position 2 sur 3. Limite de 2 dépassée.',
      'assertive',
    );

    press(card(host, 'CAD-485'), 'Home');
    await fixture.whenStable();
    press(card(host, 'CAD-485'), ' ');
    await fixture.whenStable();

    expect(component.moves).toEqual([
      {
        item: CARDS[1],
        from: { column: 'todo', lane: null, index: 1 },
        to: { column: 'progress', lane: null, index: 0 },
      },
    ]);
    expect(component.exceeded).toEqual([{ column: 'progress', count: 3, limit: 2 }]);
    expect(announce).toHaveBeenLastCalledWith(
      'CAD-485 — Notifications par e-mail déposée dans En cours, position 1 sur 3.',
      'assertive',
    );
  });

  it('puts a grabbed card back on Escape', async () => {
    press(card(host, 'CAD-488'), ' ');
    press(card(host, 'CAD-488'), 'ArrowRight');
    await fixture.whenStable();
    press(card(host, 'CAD-488'), 'Escape');
    await fixture.whenStable();
    expect(cardNames(group(host, 'Colonne À faire'))).toEqual(['CAD-488', 'CAD-485']);
    expect(component.moves).toEqual([]);
    expect(announce).toHaveBeenLastCalledWith('Déplacement annulé.', 'assertive');
  });

  it('moves a card dropped with the pointer and resets on new items', async () => {
    const lists = fixture.debugElement.queryAll(By.directive(CdkDropList));
    const [source, , target] = lists.map((list) => list.injector.get(CdkDropList));
    const drag = source.getSortedItems().at(0);
    if (!drag) throw new Error('Drag missing');
    target.dropped.emit({
      previousContainer: source,
      container: target,
      previousIndex: 0,
      currentIndex: 0,
      item: drag,
    } as unknown as CdkDragDrop<unknown>);
    await fixture.whenStable();

    expect(cardNames(group(host, 'Colonne Bloqué'))).toEqual(['CAD-488']);
    expect(component.moves[0]?.to).toEqual({ column: 'blocked', lane: null, index: 0 });

    component.items.set([...CARDS]);
    await fixture.whenStable();
    expect(cardNames(group(host, 'Colonne À faire'))).toEqual(['CAD-488', 'CAD-485']);
  });

  it('draws the empty state of a column with the consumer text', () => {
    const blocked = group(host, 'Colonne Bloqué');
    expect(blocked.textContent).toContain('Rien dans Bloqué');
    expect(button(blocked, 'Ajouter une tâche')).toBeTruthy();
  });

  it('folds and unfolds a column', async () => {
    button(host, 'Replier la colonne À faire').click();
    await fixture.whenStable();
    expect(component.collapsed()).toEqual(['todo']);
    const unfold = button(host, 'Déplier la colonne À faire, 2 tâches');
    expect(unfold.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(unfold);
    expect(group(host, 'Colonne À faire').querySelector('[role="list"]')).toBeNull();

    unfold.click();
    await fixture.whenStable();
    expect(component.collapsed()).toEqual([]);
  });

  it('creates cards from the quick add and keeps it open', async () => {
    button(host, 'Ajouter une tâche dans À faire').click();
    await fixture.whenStable();
    const form = host.querySelector<HTMLFormElement>(
      'form[aria-label="Nouvelle tâche dans À faire"]',
    );
    const field = form?.querySelector('input');
    if (!form || !field) throw new Error('Quick add missing');
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute('aria-label')).toBe('Nom de la tâche');

    field.value = '  Préparer la démo du sprint ';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(component.creations).toEqual([
      { title: 'Préparer la démo du sprint', column: 'todo', lane: null },
    ]);
    expect(field.value).toBe('');
    expect(host.querySelector('form')).not.toBeNull();

    press(field, 'Escape');
    await fixture.whenStable();
    expect(host.querySelector('form')).toBeNull();
  });

  it('opens the quick add with N on a card', async () => {
    press(card(host, 'CAD-482'), 'n');
    await fixture.whenStable();
    expect(host.querySelector('form[aria-label="Nouvelle tâche dans En cours"]')).not.toBeNull();
  });

  it('turns off grabbing and creation when read-only', async () => {
    component.readonly.set(true);
    await fixture.whenStable();
    expect(host.textContent).not.toContain('Ajouter une tâche');
    press(card(host, 'CAD-488'), ' ');
    expect(announce).not.toHaveBeenCalled();
  });

  describe('with swimlanes', () => {
    beforeEach(async () => {
      component.lanes.set(LANES);
      component.swimlaneBy.set((item: Card) => item.priority);
      await fixture.whenStable();
    });

    it('draws a lane header per lane and one list per cell', () => {
      expect(laneHeader(host, 'Haute').textContent).toContain('2 tâches');
      expect(laneHeader(host, 'Basse').getAttribute('aria-expanded')).toBe('true');
      const cell = Array.from(host.querySelectorAll('[role="list"]')).find(
        (element) => element.getAttribute('aria-label') === 'En cours, Haute',
      );
      expect(cell ? cardNames(cell as HTMLElement) : null).toEqual(['CAD-482']);
    });

    it('folds a lane from its header', async () => {
      const header = laneHeader(host, 'Haute');
      header.click();
      await fixture.whenStable();
      expect(component.collapsedLanes()).toEqual(['haute']);
      expect(header.getAttribute('aria-expanded')).toBe('false');

      press(header, 'ArrowRight');
      await fixture.whenStable();
      expect(component.collapsedLanes()).toEqual([]);
    });

    it('moves a grabbed card to the next lane at the edge of a cell', async () => {
      const grabbed = card(host, 'CAD-482');
      press(grabbed, ' ');
      press(grabbed, 'ArrowDown');
      await fixture.whenStable();
      press(card(host, 'CAD-482'), ' ');
      expect(component.moves[0]?.to).toEqual({ column: 'progress', lane: 'basse', index: 0 });
    });
  });
});
