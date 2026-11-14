import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwMenu, CwMenuItem, CwMenuSeparator } from '@cadenway/ui/components/menu';

import { CwContextMenuTriggerFor } from './context-menu.directive';

/**
 * Interface Task
 *
 * @description
 * Task data supplied to the context menu.
 */
interface Task {
  // #region Properties
  /**
   * Property key
   * @readonly
   *
   * @description
   * Identifier displayed on the task card.
   *
   * @type {string}
   */
  readonly key: string;
  // #endregion
}

/**
 * Component Host
 *
 * @description
 * Exercises context menu interactions on a task card.
 */
@Component({
  imports: [CwContextMenuTriggerFor, CwMenu, CwMenuItem, CwMenuSeparator],
  template: `
    <article
      tabindex="0"
      aria-label="CAD-482"
      [cwContextMenuTriggerFor]="taskMenu"
      [cwContextMenuData]="task"
      [cwContextMenuDisabled]="disabled()"
      (opened)="events.set([...events(), 'opened'])"
      (closed)="events.set([...events(), 'closed'])"
    >
      Page quotas organisation
      <input aria-label="Titre" />
    </article>

    <cw-menu #taskMenu ariaLabel="Actions de CAD-482">
      <button cwMenuItem (triggered)="opened.set(taskMenu.data())">Ouvrir</button>
      <cw-menu-separator />
      <button cwMenuItem variant="destructive">Supprimer</button>
    </cw-menu>
  `,
})
class Host {
  // #region Properties
  /**
   * Property task
   * @readonly
   *
   * @description
   * Task supplied as menu data.
   *
   * @type {Task}
   */
  public readonly task: Task = { key: 'CAD-482' };

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Whether the trigger is disabled.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly disabled: WritableSignal<boolean> = signal(false);

  /**
   * Property events
   * @readonly
   *
   * @description
   * Menu lifecycle events.
   *
   * @type {WritableSignal<string[]>}
   */
  public readonly events: WritableSignal<string[]> = signal<string[]>([]);

  /**
   * Property opened
   * @readonly
   *
   * @description
   * Data received by the open action.
   *
   * @type {WritableSignal<unknown>}
   */
  public readonly opened: WritableSignal<unknown> = signal<unknown>(null);
  // #endregion
}

/**
 * Function contextMenu
 *
 * @description
 * Dispatches a context menu event at the specified coordinates.
 *
 * @param {Element} target - Element receiving the context menu event.
 * @param {number} [x] - Horizontal pointer coordinate, defaulting to 120.
 * @param {number} [y] - Vertical pointer coordinate, defaulting to 80.
 *
 * @returns {MouseEvent} Dispatched context menu event.
 */
function contextMenu(target: Element, x: number = 120, y: number = 80): MouseEvent {
  const event: MouseEvent = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
  target.dispatchEvent(event);
  return event;
}

/**
 * Function panel
 *
 * @description
 * Returns the currently open task menu.
 *
 * @returns {HTMLElement | null} Open task menu, or null when absent.
 */
function panel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="menu"][aria-label="Actions de CAD-482"]');
}

/**
 * Function item
 *
 * @description
 * Finds a menu item by its visible name.
 *
 * @param {string} name - Visible menu item text to find.
 *
 * @returns {HTMLElement} Matching menu item element.
 */
function item(name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ).find((element) => element.textContent.trim() === name);
  if (!found) throw new Error(`No menu item named ${name}`);
  return found;
}

describe('CwContextMenuTriggerFor', () => {
  let fixture: ComponentFixture<Host>;
  let card: HTMLElement;
  let component: Host;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const found: HTMLElement | null = host.querySelector<HTMLElement>('article');
    if (!found) throw new Error('Card missing');
    card = found;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('opens the menu on a right click instead of the browser menu', async () => {
    expect(card.dataset['state']).toBe('closed');

    const event: MouseEvent = contextMenu(card);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(panel()).not.toBeNull();
    expect(card.dataset['state']).toBe('open');
    expect(component.events()).toEqual(['opened']);
  });

  it('gives the targeted object to the menu while it is open', async () => {
    contextMenu(card);
    await fixture.whenStable();

    item('Ouvrir').click();
    await fixture.whenStable();

    expect(component.opened()).toEqual({ key: 'CAD-482' });
    expect(panel()).toBeNull();
    expect(card.dataset['state']).toBe('closed');
    expect(component.events()).toEqual(['opened', 'closed']);
  });

  it('opens on Shift + F10 and on the Menu key, on the first item', async () => {
    card.focus();
    card.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();

    expect(document.activeElement).toBe(item('Ouvrir'));

    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(card);

    card.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ContextMenu', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(panel()).not.toBeNull();
  });

  it('leaves the browser menu when disabled and in an editable field', async () => {
    const field: HTMLInputElement | null = card.querySelector('input');
    if (!field) throw new Error('Field missing');
    expect(contextMenu(field).defaultPrevented).toBe(false);

    component.disabled.set(true);
    await fixture.whenStable();
    expect(contextMenu(card).defaultPrevented).toBe(false);
    expect(panel()).toBeNull();
  });

  it('closes on a click outside', async () => {
    contextMenu(card);
    await fixture.whenStable();

    document.body.click();
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(component.events()).toEqual(['opened', 'closed']);
  });
});
