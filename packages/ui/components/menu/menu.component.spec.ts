import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwMenuGroup } from './menu-group/menu-group.component';
import { CwMenuItemCheckbox } from './menu-item-checkbox/menu-item-checkbox.component';
import { CwMenuItemRadio } from './menu-item-radio/menu-item-radio.component';
import { CwMenuItem } from './menu-item/menu-item.component';
import { CwMenuLabel } from './menu-label/menu-label.component';
import { CwMenuRadioGroup } from './menu-radio-group/menu-radio-group.component';
import { CwMenuSeparator } from './menu-separator/menu-separator.component';
import { CwMenuShortcut } from './menu-shortcut/menu-shortcut.component';
import { CwMenuTriggerFor } from './menu-trigger-for/menu-trigger-for.directive';
import { CwMenu } from './menu.component';

@Component({
  imports: [
    CwMenu,
    CwMenuTriggerFor,
    CwMenuItem,
    CwMenuItemCheckbox,
    CwMenuItemRadio,
    CwMenuRadioGroup,
    CwMenuGroup,
    CwMenuLabel,
    CwMenuSeparator,
    CwMenuShortcut,
  ],
  template: `
    <button type="button" aria-label="Actions de la tâche" [cwMenuTriggerFor]="actions">…</button>
    <button type="button" [cwMenuTriggerFor]="display">Affichage</button>

    <cw-menu #actions align="end" (closed)="closedCount.set(closedCount() + 1)">
      <cw-menu-label>CAD-482</cw-menu-label>
      <button cwMenuItem (triggered)="log.set([...log(), 'renommer'])">
        Renommer <cw-menu-shortcut>F2</cw-menu-shortcut>
      </button>
      <button cwMenuItem (triggered)="log.set([...log(), 'dupliquer'])">Dupliquer</button>
      <button cwMenuItem [cwMenuTriggerFor]="move">Déplacer vers…</button>
      <button cwMenuItem disabled (triggered)="log.set([...log(), 'archiver'])">Archiver</button>
      <cw-menu-separator />
      <button cwMenuItem variant="destructive" (triggered)="log.set([...log(), 'supprimer'])">
        Supprimer
      </button>
    </cw-menu>

    <cw-menu #move>
      <button cwMenuItem selected disabled>Sprint 14</button>
      <button cwMenuItem (triggered)="log.set([...log(), 'backlog'])">Backlog</button>
      <button cwMenuItem>Bugs</button>
    </cw-menu>

    <cw-menu #display>
      <cw-menu-group>
        <cw-menu-label inset>Afficher</cw-menu-label>
        <button cwMenuItemCheckbox [(checked)]="subtasks">Sous-tâches</button>
      </cw-menu-group>
      <cw-menu-separator />
      <cw-menu-radio-group [(value)]="groupBy">
        <cw-menu-label inset>Grouper par</cw-menu-label>
        <button cwMenuItemRadio value="statut">Statut</button>
        <button cwMenuItemRadio value="assigne">Assigné</button>
      </cw-menu-radio-group>
    </cw-menu>
  `,
})
class Host {
  readonly log = signal<string[]>([]);
  readonly closedCount = signal(0);
  readonly subtasks = signal(true);
  readonly groupBy = signal('statut');
}

@Component({
  imports: [CwMenu, CwMenuItem],
  template: `
    <cw-menu inline ariaLabel="Actions de la tâche">
      <button cwMenuItem (triggered)="count.set(count() + 1)">Ouvrir</button>
      <button cwMenuItem>Renommer</button>
    </cw-menu>
  `,
})
class InlineHost {
  readonly count = signal(0);
}

function key(target: Element, value: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: value,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

function menus(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="menu"]'));
}

function menuNamed(name: string): HTMLElement {
  const found = menus().find((menu) => {
    const labelledBy = menu.getAttribute('aria-labelledby');
    const label = labelledBy ? document.getElementById(labelledBy) : null;
    const accessible =
      menu.getAttribute('aria-label') ??
      label?.getAttribute('aria-label') ??
      label?.textContent.trim();
    return accessible === name;
  });
  if (!found) throw new Error(`No open menu named ${name}`);
  return found;
}

function item(container: ParentNode, name: string): HTMLElement {
  const found = Array.from(
    container.querySelectorAll<HTMLElement>(
      '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]',
    ),
  ).find((element) => element.textContent.trim().startsWith(name));
  if (!found) throw new Error(`No menu item named ${name}`);
  return found;
}

function button(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwMenu', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('opens from its trigger, named by it, and toggles closed on a second click', async () => {
    const trigger = button(host, 'Actions de la tâche');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    await fixture.whenStable();

    const panel = menuNamed('Actions de la tâche');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.dataset['state']).toBe('open');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);

    trigger.click();
    await fixture.whenStable();
    expect(menus()).toHaveLength(0);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(component.closedCount()).toBe(1);
  });

  it('moves through the items with the arrows in a loop, skipping disabled ones', async () => {
    const trigger = button(host, 'Actions de la tâche');
    key(trigger, 'ArrowDown');
    await fixture.whenStable();
    const panel = menuNamed('Actions de la tâche');

    expect(document.activeElement).toBe(item(panel, 'Renommer'));
    expect(item(panel, 'Renommer').hasAttribute('data-highlighted')).toBe(true);

    key(document.activeElement ?? panel, 'ArrowDown');
    key(document.activeElement ?? panel, 'ArrowDown');
    key(document.activeElement ?? panel, 'ArrowDown');
    await fixture.whenStable();
    expect(item(panel, 'Archiver').getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(item(panel, 'Supprimer'));

    key(document.activeElement ?? panel, 'ArrowDown');
    expect(document.activeElement).toBe(item(panel, 'Renommer'));
    key(document.activeElement ?? panel, 'End');
    expect(document.activeElement).toBe(item(panel, 'Supprimer'));
    key(document.activeElement ?? panel, 'Home');
    expect(document.activeElement).toBe(item(panel, 'Renommer'));
  });

  it('opens on the last item with ArrowUp', async () => {
    key(button(host, 'Actions de la tâche'), 'ArrowUp');
    await fixture.whenStable();
    expect(document.activeElement).toBe(item(menuNamed('Actions de la tâche'), 'Supprimer'));
  });

  it('highlights the next item starting with the typed letter', async () => {
    key(button(host, 'Actions de la tâche'), 'ArrowDown');
    await fixture.whenStable();
    const panel = menuNamed('Actions de la tâche');

    key(document.activeElement ?? panel, 'd');
    expect(document.activeElement).toBe(item(panel, 'Dupliquer'));
    key(document.activeElement ?? panel, 'a');
    // « Archiver » is disabled: the typeahead skips it.
    expect(document.activeElement).toBe(item(panel, 'Dupliquer'));
  });

  it('emits triggered and closes every menu on activation, focus back on the trigger', async () => {
    const trigger = button(host, 'Actions de la tâche');
    trigger.click();
    await fixture.whenStable();

    item(menuNamed('Actions de la tâche'), 'Renommer').click();
    await fixture.whenStable();

    expect(component.log()).toEqual(['renommer']);
    expect(menus()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
  });

  it('ignores a disabled item', async () => {
    button(host, 'Actions de la tâche').click();
    await fixture.whenStable();

    item(menuNamed('Actions de la tâche'), 'Archiver').click();
    await fixture.whenStable();

    expect(component.log()).toEqual([]);
    expect(menus()).toHaveLength(1);
  });

  it('closes on Escape and gives the focus back to the trigger', async () => {
    const trigger = button(host, 'Actions de la tâche');
    key(trigger, 'ArrowDown');
    await fixture.whenStable();

    const escape = key(document.activeElement ?? document.body, 'Escape');
    await fixture.whenStable();

    expect(escape.defaultPrevented).toBe(true);
    expect(menus()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes every menu on Tab', async () => {
    const trigger = button(host, 'Actions de la tâche');
    key(trigger, 'ArrowDown');
    await fixture.whenStable();
    const moveItem = item(menuNamed('Actions de la tâche'), 'Déplacer');
    moveItem.focus();
    key(moveItem, 'ArrowRight');
    await fixture.whenStable();
    expect(menus()).toHaveLength(2);

    key(document.activeElement ?? document.body, 'Tab');
    await fixture.whenStable();

    expect(menus()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on a click outside', async () => {
    button(host, 'Actions de la tâche').click();
    await fixture.whenStable();

    document.body.click();
    await fixture.whenStable();

    expect(menus()).toHaveLength(0);
  });

  it('keeps one menu open at a time', async () => {
    button(host, 'Actions de la tâche').click();
    await fixture.whenStable();
    button(host, 'Affichage').click();
    await fixture.whenStable();

    expect(menus()).toHaveLength(1);
    expect(menuNamed('Affichage')).toBeTruthy();
    expect(button(host, 'Actions de la tâche').getAttribute('aria-expanded')).toBe('false');
  });

  it('opens a submenu with ArrowRight and closes it with ArrowLeft', async () => {
    key(button(host, 'Actions de la tâche'), 'ArrowDown');
    await fixture.whenStable();
    const panel = menuNamed('Actions de la tâche');
    const moveItem = item(panel, 'Déplacer');
    expect(moveItem.getAttribute('aria-haspopup')).toBe('menu');

    moveItem.focus();
    key(moveItem, 'ArrowRight');
    await fixture.whenStable();

    const submenu = menuNamed('Déplacer vers…');
    expect(moveItem.getAttribute('aria-expanded')).toBe('true');
    // « Sprint 14 » is disabled: the first enabled item takes the focus.
    expect(document.activeElement).toBe(item(submenu, 'Backlog'));
    expect(item(submenu, 'Sprint 14').getAttribute('aria-current')).toBe('true');

    key(document.activeElement ?? submenu, 'ArrowLeft');
    await fixture.whenStable();

    expect(menus()).toHaveLength(1);
    expect(document.activeElement).toBe(moveItem);
  });

  it('activates a submenu item and closes the whole chain', async () => {
    const trigger = button(host, 'Actions de la tâche');
    trigger.click();
    await fixture.whenStable();
    item(menuNamed('Actions de la tâche'), 'Déplacer').click();
    await fixture.whenStable();

    item(menuNamed('Déplacer vers…'), 'Backlog').click();
    await fixture.whenStable();

    expect(component.log()).toEqual(['backlog']);
    expect(menus()).toHaveLength(0);
    expect(document.activeElement).toBe(trigger);
  });

  it('toggles a checkbox item and keeps the menu open', async () => {
    button(host, 'Affichage').click();
    await fixture.whenStable();
    const subtasks = item(menuNamed('Affichage'), 'Sous-tâches');
    expect(subtasks.getAttribute('aria-checked')).toBe('true');

    subtasks.click();
    await fixture.whenStable();

    expect(component.subtasks()).toBe(false);
    expect(subtasks.getAttribute('aria-checked')).toBe('false');
    expect(menus()).toHaveLength(1);
  });

  it('chooses a radio item through its group and keeps the menu open', async () => {
    button(host, 'Affichage').click();
    await fixture.whenStable();
    const panel = menuNamed('Affichage');

    item(panel, 'Assigné').click();
    await fixture.whenStable();

    expect(component.groupBy()).toBe('assigne');
    expect(item(panel, 'Assigné').getAttribute('aria-checked')).toBe('true');
    expect(item(panel, 'Statut').getAttribute('aria-checked')).toBe('false');
    expect(menus()).toHaveLength(1);
  });

  it('names its groups by their labels', async () => {
    button(host, 'Affichage').click();
    await fixture.whenStable();
    const groups = Array.from(menuNamed('Affichage').querySelectorAll('[role="group"]'));

    const names = groups.map(
      (group) => document.getElementById(group.getAttribute('aria-labelledby') ?? '')?.textContent,
    );
    expect(names.map((name) => name?.trim())).toEqual(['Afficher', 'Grouper par']);
  });
});

describe('CwMenu inline', () => {
  it('renders the panel in place, navigable and never closing', async () => {
    const fixture = TestBed.createComponent(InlineHost);
    fixture.autoDetectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const panel = host.querySelector<HTMLElement>('[role="menu"]');
    if (!panel) throw new Error('Inline panel missing');

    expect(panel.getAttribute('aria-label')).toBe('Actions de la tâche');
    expect(panel.tabIndex).toBe(0);
    key(panel, 'ArrowDown');
    expect(document.activeElement).toBe(item(panel, 'Ouvrir'));

    item(panel, 'Ouvrir').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.count()).toBe(1);
    expect(host.querySelector('[role="menu"]')).toBe(panel);
    fixture.destroy();
  });
});
