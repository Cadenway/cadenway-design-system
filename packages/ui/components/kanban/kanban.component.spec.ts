import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkDropList, type CdkDrag, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, signal, type DebugElement, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CwKanban } from './kanban.component';
import { CwKanbanCardDef } from './kanban-card-def/kanban-card-def.directive';
import { CwKanbanEmptyDef } from './kanban-empty-def/kanban-empty-def.directive';
import type { KanbanCellData } from './kanban.token';
import type {
  CwKanbanColumn,
  CwKanbanCreate,
  CwKanbanLane,
  CwKanbanMove,
  CwKanbanWipExceeded,
} from './kanban.types';

/**
 * Interface Card
 *
 * @description
 * Card data used by the board fixture.
 */
interface Card {
  // #region Properties
  /**
   * Property id
   *
   * @description
   * Stable card identifier.
   *
   * @type {string}
   * @readonly
   */
  readonly id: string;

  /**
   * Property name
   *
   * @description
   * Displayed card name.
   *
   * @type {string}
   * @readonly
   */
  readonly name: string;

  /**
   * Property status
   *
   * @description
   * Column identifier of the card.
   *
   * @type {string}
   * @readonly
   */
  readonly status: string;

  /**
   * Property priority
   *
   * @description
   * Swimlane identifier of the card.
   *
   * @type {string}
   * @readonly
   */
  readonly priority: string;
  // #endregion
}

/**
 * Constant COLUMNS
 *
 * @description
 * Columns supplied to the board fixture.
 *
 * @type {CwKanbanColumn[]}
 */
const COLUMNS: CwKanbanColumn[] = [
  { id: 'todo', label: 'À faire', status: 'todo' },
  { id: 'progress', label: 'En cours', status: 'progress' },
  { id: 'blocked', label: 'Bloqué', status: 'blocked' },
];

/**
 * Constant LANES
 *
 * @description
 * Swimlanes supplied to the board fixture.
 *
 * @type {CwKanbanLane[]}
 */
const LANES: CwKanbanLane[] = [
  { id: 'haute', label: 'Haute' },
  { id: 'basse', label: 'Basse' },
];

/**
 * Constant CARDS
 *
 * @description
 * Cards supplied to the board fixture.
 *
 * @type {Card[]}
 */
const CARDS: Card[] = [
  { id: 'CAD-488', name: 'Importer les espaces', status: 'todo', priority: 'haute' },
  { id: 'CAD-485', name: 'Notifications par e-mail', status: 'todo', priority: 'basse' },
  { id: 'CAD-482', name: "Corriger l'export CSV", status: 'progress', priority: 'haute' },
  { id: 'CAD-479', name: 'Maquetter la vue Calendrier', status: 'progress', priority: 'basse' },
];

/**
 * Component Host
 *
 * @description
 * Hosts the kanban board and records emitted interactions.
 */
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
  // #region Properties
  /**
   * Property columns
   *
   * @description
   * Columns supplied to the board.
   *
   * @type {CwKanbanColumn[]}
   * @readonly
   */
  public readonly columns: CwKanbanColumn[] = COLUMNS;

  /**
   * Property items
   *
   * @description
   * Cards displayed by the board.
   *
   * @type {WritableSignal<readonly Card[]>}
   * @readonly
   */
  public readonly items: WritableSignal<readonly Card[]> = signal<readonly Card[]>(CARDS);

  /**
   * Property lanes
   *
   * @description
   * Swimlanes displayed by the board.
   *
   * @type {WritableSignal<readonly CwKanbanLane[]>}
   * @readonly
   */
  public readonly lanes: WritableSignal<readonly CwKanbanLane[]> = signal<readonly CwKanbanLane[]>(
    [],
  );

  /**
   * Property swimlaneBy
   *
   * @description
   * Optional accessor for a card swimlane.
   *
   * @type {WritableSignal<((card: Card) => string) | null>}
   * @readonly
   */
  public readonly swimlaneBy: WritableSignal<((card: Card) => string) | null> = signal<
    ((card: Card) => string) | null
  >(null);

  /**
   * Property readonly
   *
   * @description
   * Whether board changes are disabled.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly readonly: WritableSignal<boolean> = signal(false);

  /**
   * Property limits
   *
   * @description
   * Work-in-progress limits by column.
   *
   * @type {{ progress: number; }}
   * @readonly
   */
  public readonly limits: { progress: number } = { progress: 2 };

  /**
   * Property collapsed
   *
   * @description
   * Identifiers of folded columns.
   *
   * @type {WritableSignal<readonly string[]>}
   * @readonly
   */
  public readonly collapsed: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property collapsedLanes
   *
   * @description
   * Identifiers of folded swimlanes.
   *
   * @type {WritableSignal<readonly string[]>}
   * @readonly
   */
  public readonly collapsedLanes: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property selection
   *
   * @description
   * Selected card identifiers.
   *
   * @type {WritableSignal<readonly string[]>}
   * @readonly
   */
  public readonly selection: WritableSignal<readonly string[]> = signal<readonly string[]>([]);

  /**
   * Property moves
   *
   * @description
   * Moves emitted by the board.
   *
   * @type {CwKanbanMove<Card>[]}
   * @readonly
   */
  public readonly moves: CwKanbanMove<Card>[] = [];

  /**
   * Property creations
   *
   * @description
   * Card creation requests emitted by the board.
   *
   * @type {CwKanbanCreate[]}
   * @readonly
   */
  public readonly creations: CwKanbanCreate[] = [];

  /**
   * Property exceeded
   *
   * @description
   * Work-in-progress alerts emitted by the board.
   *
   * @type {CwKanbanWipExceeded[]}
   * @readonly
   */
  public readonly exceeded: CwKanbanWipExceeded[] = [];

  /**
   * Property opened
   *
   * @description
   * Cards opened on the board.
   *
   * @type {Card[]}
   * @readonly
   */
  public readonly opened: Card[] = [];

  /**
   * Property id
   *
   * @description
   * Stable card identifier.
   *
   * @type {(card: Card) => string}
   * @readonly
   */
  public readonly id: (card: Card) => string = (card: Card): string => card.id;

  /**
   * Property status
   *
   * @description
   * Column identifier of the card.
   *
   * @type {(card: Card) => string}
   * @readonly
   */
  public readonly status: (card: Card) => string = (card: Card): string => card.status;

  /**
   * Property label
   *
   * @description
   * Formats the accessible name of a card.
   *
   * @type {(card: Card) => string}
   * @readonly
   */
  public readonly label: (card: Card) => string = (card: Card): string =>
    `${card.id} — ${card.name}`;
  // #endregion
}

/**
 * Function group
 *
 * @description
 * Finds a board group by accessible name.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} name - Accessible name to find.
 * @returns {HTMLElement} Matching board group.
 */
function group(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('[role="group"]'),
  ).find((element) => element.getAttribute('aria-label') === name);
  if (!found) throw new Error(`No group named ${name}`);
  return found;
}

/**
 * Function card
 *
 * @description
 * Finds a card by its identifier.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} id - Identifier of the card.
 * @returns {HTMLElement} Matching card element.
 */
function card(host: HTMLElement, id: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('article'),
  ).find((element) => element.getAttribute('aria-label')?.startsWith(id));
  if (!found) throw new Error(`No card ${id}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a button by accessible name.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} name - Accessible name to find.
 * @returns {HTMLButtonElement} Matching button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function laneHeader
 *
 * @description
 * Finds a swimlane header by label.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} label - Displayed lane label.
 * @returns {HTMLButtonElement} Matching lane header button.
 */
function laneHeader(host: HTMLElement, label: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'),
  ).find((element) => element.textContent.trim().startsWith(label));
  if (!found) throw new Error(`No lane header ${label}`);
  return found;
}

/**
 * Function cardNames
 *
 * @description
 * Reads card identifiers from a list.
 *
 * @param {HTMLElement} list - List containing the cards.
 * @returns {string[]} Card identifiers in display order.
 */
function cardNames(list: HTMLElement): string[] {
  return Array.from(list.querySelectorAll('article')).map(
    (element) => element.getAttribute('aria-label')?.split(' — ')[0] ?? '',
  );
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to a target.
 *
 * @param {HTMLElement} target - Element receiving the event.
 * @param {string} key - Keyboard key to dispatch.
 * @param {KeyboardEventInit} init - Additional keyboard event options.
 */
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
    const todo: HTMLElement = group(host, 'Colonne À faire');
    const list: Element | null = todo.querySelector('[role="list"]');
    expect(list?.getAttribute('aria-label')).toBe('À faire');
    expect(list?.querySelectorAll('[role="listitem"]').length).toBe(2);
    expect(cardNames(todo)).toEqual(['CAD-488', 'CAD-485']);
    expect(todo.textContent).toContain('2 tâches');
    expect(card(host, 'CAD-488').textContent).toContain('Importer les espaces');
  });

  it('gives one tab stop to the cards', () => {
    const stops: HTMLElement[] = Array.from(host.querySelectorAll('article')).filter(
      (element) => element.getAttribute('tabindex') === '0',
    );
    expect(stops.length).toBe(1);
    expect(card(host, 'CAD-488').getAttribute('aria-describedby')).toBeTruthy();
  });

  it('shows the limit as a counter and warns when it is exceeded', async () => {
    const progress: HTMLElement = group(host, 'Colonne En cours');
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
    const first: HTMLElement = card(host, 'CAD-488');
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
    const target: HTMLElement = card(host, 'CAD-482');
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
    const grabbed: HTMLElement = card(host, 'CAD-485');
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
    const lists: DebugElement[] = fixture.debugElement.queryAll(By.directive(CdkDropList));
    const [source, , target]: CdkDropList<KanbanCellData>[] = lists.map(
      (list) => list.injector.get(CdkDropList) as unknown as CdkDropList<KanbanCellData>,
    );
    const drag: CdkDrag<string> | undefined = source.getSortedItems().at(0);
    if (!drag) throw new Error('Drag missing');
    target.dropped.emit({
      previousContainer: source,
      container: target,
      previousIndex: 0,
      currentIndex: 0,
      item: drag,
    } as unknown as CdkDragDrop<KanbanCellData, KanbanCellData, string>);
    await fixture.whenStable();

    expect(cardNames(group(host, 'Colonne Bloqué'))).toEqual(['CAD-488']);
    expect(component.moves[0]?.to).toEqual({ column: 'blocked', lane: null, index: 0 });

    component.items.set([...CARDS]);
    await fixture.whenStable();
    expect(cardNames(group(host, 'Colonne À faire'))).toEqual(['CAD-488', 'CAD-485']);
  });

  it('draws the empty state of a column with the consumer text', () => {
    const blocked: HTMLElement = group(host, 'Colonne Bloqué');
    expect(blocked.textContent).toContain('Rien dans Bloqué');
    expect(button(blocked, 'Ajouter une tâche')).toBeTruthy();
  });

  it('folds and unfolds a column', async () => {
    button(host, 'Replier la colonne À faire').click();
    await fixture.whenStable();
    expect(component.collapsed()).toEqual(['todo']);
    const unfold: HTMLButtonElement = button(host, 'Déplier la colonne À faire, 2 tâches');
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
    const form: HTMLFormElement | null = host.querySelector<HTMLFormElement>(
      'form[aria-label="Nouvelle tâche dans À faire"]',
    );
    const field: HTMLInputElement | null | undefined = form?.querySelector('input');
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
      const cell: Element | undefined = Array.from(host.querySelectorAll('[role="list"]')).find(
        (element) => element.getAttribute('aria-label') === 'En cours, Haute',
      );
      expect(cell ? cardNames(cell as HTMLElement) : null).toEqual(['CAD-482']);
    });

    it('folds a lane from its header', async () => {
      const header: HTMLButtonElement = laneHeader(host, 'Haute');
      header.click();
      await fixture.whenStable();
      expect(component.collapsedLanes()).toEqual(['haute']);
      expect(header.getAttribute('aria-expanded')).toBe('false');

      press(header, 'ArrowRight');
      await fixture.whenStable();
      expect(component.collapsedLanes()).toEqual([]);
    });

    it('moves a grabbed card to the next lane at the edge of a cell', async () => {
      const grabbed: HTMLElement = card(host, 'CAD-482');
      press(grabbed, ' ');
      press(grabbed, 'ArrowDown');
      await fixture.whenStable();
      press(card(host, 'CAD-482'), ' ');
      expect(component.moves[0]?.to).toEqual({ column: 'progress', lane: 'basse', index: 0 });
    });
  });
});
