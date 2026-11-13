import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwMenu, CwMenuItem, CwMenuSeparator } from '@cadenway/ui/components/menu';

import { CwContextMenuTriggerFor } from './context-menu.directive';

interface Task {
  readonly key: string;
}

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
  readonly task: Task = { key: 'CAD-482' };
  readonly disabled = signal(false);
  readonly events = signal<string[]>([]);
  readonly opened = signal<unknown>(null);
}

function contextMenu(target: Element, x = 120, y = 80): MouseEvent {
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
  target.dispatchEvent(event);
  return event;
}

function panel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="menu"][aria-label="Actions de CAD-482"]');
}

function item(name: string): HTMLElement {
  const found = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
    (element) => element.textContent.trim() === name,
  );
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
    const host = fixture.nativeElement as HTMLElement;
    const found = host.querySelector<HTMLElement>('article');
    if (!found) throw new Error('Card missing');
    card = found;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('opens the menu on a right click instead of the browser menu', async () => {
    expect(card.dataset['state']).toBe('closed');

    const event = contextMenu(card);
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
    const field = card.querySelector('input');
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
