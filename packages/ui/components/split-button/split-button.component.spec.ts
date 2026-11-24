import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwMenu, CwMenuItem } from '@cadenway/ui/components/menu';

import { CwSplitButton } from './split-button.component';
import { provideCwSplitButtonLabels } from './split-button.providers';

/**
 * Class Host
 *
 * @description
 * Hosts the task status split button of the mockup (`App.dc.html`): the main half moves the status
 * to the next one, or opens the menu when there is none; the caret lists every status. A second,
 * plain split button keeps the default caret name.
 */
@Component({
  imports: [CwSplitButton, CwMenu, CwMenuItem],
  template: `
    <cw-split-button
      menuLabel="Choisir un statut"
      [label]="label()"
      [tooltip]="tooltip()"
      [arrow]="!last()"
      [opensMenu]="last()"
      [disabled]="disabled()"
      (triggered)="log.set([...log(), 'triggered'])"
    >
      <span>En cours</span>
      <cw-menu align="end">
        <button cwMenuItem (triggered)="log.set([...log(), 'todo'])">À faire</button>
        <button cwMenuItem (triggered)="log.set([...log(), 'review'])">En revue</button>
      </cw-menu>
    </cw-split-button>
    <cw-split-button label="Créer une tâche">
      <span>Créer</span>
      <cw-menu><button cwMenuItem>Depuis un modèle</button></cw-menu>
    </cw-split-button>
  `,
})
class Host {
  // #region Properties
  /**
   * Property log
   *
   * @description
   * Actions run, in order.
   *
   * @type {WritableSignal<string[]>}
   * @readonly
   */
  public readonly log: WritableSignal<string[]> = signal<string[]>([]);

  /**
   * Property label
   *
   * @description
   * Accessible name of the main half.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly label: WritableSignal<string> = signal(
    'Statut : En cours. Passer à « En revue »',
  );

  /**
   * Property tooltip
   *
   * @description
   * Tooltip of the main half, or none to fall back to the label.
   *
   * @type {WritableSignal<string | undefined>}
   * @readonly
   */
  public readonly tooltip: WritableSignal<string | undefined> = signal<string | undefined>(
    'Passer à « En revue »',
  );

  /**
   * Property last
   *
   * @description
   * Whether the status has no next one, so the main half opens the menu.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly last: WritableSignal<boolean> = signal(false);

  /**
   * Property disabled
   *
   * @description
   * Whether the split button is disabled.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly disabled: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function setup
 *
 * @description
 * Renders the host with the given providers and returns its fixture.
 *
 * @param {unknown[]} providers - Providers of the testing module.
 *
 * @returns {Promise<ComponentFixture<Host>>} Fixture of the rendered host.
 */
async function setup(providers: unknown[] = []): Promise<ComponentFixture<Host>> {
  TestBed.configureTestingModule({ imports: [Host], providers: providers as never[] });
  const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
}

/**
 * Function button
 *
 * @description
 * Finds a button of the host by its accessible name, failing the test when it is missing.
 *
 * @param {ComponentFixture<Host>} fixture - Fixture of the host.
 * @param {string} name - Accessible name of the button.
 *
 * @returns {HTMLButtonElement} The button.
 */
function button(fixture: ComponentFixture<Host>, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
  ).find((element: HTMLButtonElement) => element.getAttribute('aria-label') === name);
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function menu
 *
 * @description
 * Returns the open menu, or null when none is open.
 *
 * @returns {HTMLElement | null} The open menu.
 */
function menu(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="menu"]');
}

/**
 * Function items
 *
 * @description
 * Returns the items of the open menu.
 *
 * @returns {HTMLElement[]} The menu items, in order.
 */
function items(): HTMLElement[] {
  return Array.from(menu()?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
}

/**
 * Function key
 *
 * @description
 * Dispatches a bubbling, cancelable keydown on an element.
 *
 * @param {Element} target - Element receiving the key.
 * @param {string} value - Key value.
 */
function key(target: Element, value: string): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
  );
}

/**
 * Function pointerClick
 *
 * @description
 * Clicks an element as a pointer does (a click with a detail of 1), unlike `click()`, which a menu
 * button reads as Enter or Space.
 *
 * @param {Element} target - Element clicked.
 */
function pointerClick(target: Element): void {
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
}

describe('CwSplitButton', () => {
  const statusName: string = 'Statut : En cours. Passer à « En revue »';

  afterEach(() => {
    menu()?.remove();
  });

  it('names the main half by its action, titles it by its tooltip and emits triggered', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const main: HTMLButtonElement = button(fixture, statusName);

    expect(main.getAttribute('title')).toBe('Passer à « En revue »');
    expect(main.getAttribute('aria-haspopup')).toBeNull();
    expect(main.textContent).toContain('En cours');
    main.click();

    expect(fixture.componentInstance.log()).toEqual(['triggered']);
    expect(menu()).toBeNull();

    fixture.componentInstance.tooltip.set(undefined);
    await fixture.whenStable();
    expect(main.getAttribute('title')).toBe(statusName);
  });

  it('opens the projected menu from the caret as a menu button and runs an item', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const caret: HTMLButtonElement = button(fixture, 'Choisir un statut');

    expect(caret.getAttribute('aria-haspopup')).toBe('menu');
    expect(caret.getAttribute('aria-expanded')).toBe('false');
    pointerClick(caret);
    await fixture.whenStable();

    expect(caret.getAttribute('aria-expanded')).toBe('true');
    expect(caret.getAttribute('aria-controls')).toBe(menu()?.id);
    expect(items().map((item: HTMLElement) => item.textContent.trim())).toEqual([
      'À faire',
      'En revue',
    ]);
    items()[1]?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.log()).toEqual(['review']);
    expect(menu()).toBeNull();
    expect(caret.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(caret);
  });

  it('closes the open menu before running the quick action', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    pointerClick(button(fixture, 'Choisir un statut'));
    await fixture.whenStable();
    pointerClick(button(fixture, statusName));
    await fixture.whenStable();

    expect(fixture.componentInstance.log()).toEqual(['triggered']);
    expect(menu()).toBeNull();
  });

  it('toggles the menu closed with a second click on the caret', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const caret: HTMLButtonElement = button(fixture, 'Choisir un statut');
    pointerClick(caret);
    await fixture.whenStable();
    pointerClick(caret);
    await fixture.whenStable();

    expect(menu()).toBeNull();
  });

  it('opens on the first item with ArrowDown, on the last with ArrowUp, and closes on Escape', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const caret: HTMLButtonElement = button(fixture, 'Choisir un statut');
    caret.focus();
    key(caret, 'ArrowDown');
    await fixture.whenStable();

    expect(document.activeElement?.textContent.trim()).toBe('À faire');
    key(document.activeElement ?? caret, 'Escape');
    await fixture.whenStable();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(caret);

    key(caret, 'ArrowUp');
    await fixture.whenStable();
    expect(document.activeElement?.textContent.trim()).toBe('En revue');
  });

  it('opens the menu from the main half with opensMenu, on its first item from the keyboard', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    fixture.componentInstance.last.set(true);
    fixture.componentInstance.label.set('Statut : Terminé. Choisir un statut');
    await fixture.whenStable();
    const main: HTMLButtonElement = button(fixture, 'Statut : Terminé. Choisir un statut');

    expect(main.getAttribute('aria-haspopup')).toBe('menu');
    expect(main.getAttribute('aria-expanded')).toBe('false');
    main.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.log()).toEqual([]);
    expect(main.getAttribute('aria-expanded')).toBe('true');
    expect(main.getAttribute('aria-controls')).toBe(menu()?.id);
    expect(document.activeElement?.textContent.trim()).toBe('À faire');
    key(document.activeElement ?? main, 'Escape');
    await fixture.whenStable();

    expect(document.activeElement).toBe(main);
  });

  it('disables both halves and closes the menu it opened', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    pointerClick(button(fixture, 'Choisir un statut'));
    await fixture.whenStable();
    expect(menu()).not.toBeNull();

    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    expect(menu()).toBeNull();
    expect(button(fixture, statusName).disabled).toBe(true);
    expect(button(fixture, 'Choisir un statut').disabled).toBe(true);
    expect(fixture.componentInstance.log()).toEqual([]);
  });

  it('names the caret « Plus d’options » by default, or with the provided text', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    expect(button(fixture, 'Plus d’options').getAttribute('title')).toBe('Plus d’options');
    fixture.destroy();
    TestBed.resetTestingModule();

    const english: ComponentFixture<Host> = await setup([
      provideCwSplitButtonLabels({ menu: 'More options' }),
    ]);
    expect(button(english, 'More options').getAttribute('title')).toBe('More options');
    expect(button(english, 'Choisir un statut')).toBeTruthy();
  });
});
