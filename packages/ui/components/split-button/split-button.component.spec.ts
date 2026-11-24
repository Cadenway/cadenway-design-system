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
 * to the next one, the caret lists every status.
 */
@Component({
  imports: [CwSplitButton, CwMenu, CwMenuItem],
  template: `
    <cw-split-button
      menuLabel="Choisir un statut"
      [label]="'En cours · passer à « En revue »'"
      [advanceable]="advanceable()"
      [disabled]="disabled()"
      (advance)="log.set([...log(), 'advance'])"
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
   * Property advanceable
   *
   * @description
   * Whether the status has a next one.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly advanceable: WritableSignal<boolean> = signal(true);

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

describe('CwSplitButton', () => {
  afterEach(() => {
    menu()?.remove();
  });

  it('names the main half by its action and emits advance on click', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const main: HTMLButtonElement = button(fixture, 'En cours · passer à « En revue »');

    expect(main.getAttribute('title')).toBe('En cours · passer à « En revue »');
    expect(main.textContent).toContain('En cours');
    main.click();

    expect(fixture.componentInstance.log()).toEqual(['advance']);
    expect(menu()).toBeNull();
  });

  it('opens the projected menu from the caret, named by menuLabel, and runs an item', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const caret: HTMLButtonElement = button(fixture, 'Choisir un statut');

    expect(caret.getAttribute('aria-haspopup')).toBe('menu');
    expect(caret.getAttribute('aria-expanded')).toBe('false');
    caret.click();
    await fixture.whenStable();

    expect(caret.getAttribute('aria-expanded')).toBe('true');
    const items: HTMLElement[] = Array.from(
      menu()?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    expect(items.map((item: HTMLElement) => item.textContent.trim())).toEqual([
      'À faire',
      'En revue',
    ]);
    items[1]?.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.log()).toEqual(['review']);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(caret);
  });

  it('closes the menu on Escape and gives the focus back to the caret', async () => {
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
  });

  it('shows the advance hint only when there is a next value', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    const main: HTMLButtonElement = button(fixture, 'En cours · passer à « En revue »');

    expect(main.querySelector('ng-icon')).not.toBeNull();
    fixture.componentInstance.advanceable.set(false);
    await fixture.whenStable();

    expect(main.querySelector('ng-icon')).toBeNull();
  });

  it('disables both halves', async () => {
    const fixture: ComponentFixture<Host> = await setup();
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    expect(button(fixture, 'En cours · passer à « En revue »').disabled).toBe(true);
    expect(button(fixture, 'Choisir un statut').disabled).toBe(true);
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
