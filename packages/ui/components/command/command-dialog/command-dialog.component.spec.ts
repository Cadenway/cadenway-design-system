import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwCommandFooter } from '../command-footer/command-footer.component';
import { CwCommandGroup } from '../command-group/command-group.component';
import { CwCommandInput } from '../command-input/command-input.directive';
import { CwCommandItem } from '../command-item/command-item.component';
import { CwCommandList } from '../command-list/command-list.component';
import { CwCommandDialog } from './command-dialog.component';

/**
 * Component Host
 *
 * @description
 * Hosts command controls and records their state for the fixture.
 */
@Component({
  imports: [
    CwCommandDialog,
    CwCommandInput,
    CwCommandList,
    CwCommandGroup,
    CwCommandItem,
    CwCommandFooter,
  ],
  template: `
    <button type="button">Rechercher</button>
    <cw-command-dialog [(open)]="open" [(search)]="search">
      <input cwCommandInput aria-label="Rechercher une commande, une tâche, un espace" />
      <cw-command-list>
        <cw-command-group heading="Suggestions">
          <cw-command-item (selected)="ran.set($event); open.set(false)">
            Créer une tâche
          </cw-command-item>
          <cw-command-item>Afficher le tableau</cw-command-item>
        </cw-command-group>
      </cw-command-list>
      <cw-command-footer />
    </cw-command-dialog>
  `,
})
class Host {
  // #region Properties
  /**
   * Property open
   *
   * @description
   * Whether the dialog is open.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly open: WritableSignal<boolean> = signal(false);

  /**
   * Property search
   *
   * @description
   * Current search text controlled by the fixture.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly search: WritableSignal<string> = signal('');

  /**
   * Property ran
   *
   * @description
   * Last command value selected in the fixture.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  public readonly ran: WritableSignal<string | null> = signal<string | null>(null);
  // #endregion
}

/**
 * Function palette
 *
 * @description
 * Finds the open command dialog.
 * @returns {HTMLElement | null} Open dialog, or null when absent.
 */
function palette(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

/**
 * Function field
 *
 * @description
 * Finds the native command search field.
 * @returns {HTMLInputElement} Native command search input.
 */
function field(): HTMLInputElement {
  const found: HTMLInputElement | null | undefined =
    palette()?.querySelector<HTMLInputElement>('input[role="combobox"]');
  if (!found) throw new Error('No palette field');
  return found;
}

describe('CwCommandDialog', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  /**
   * Function keydown
   *
   * @description
   * Dispatches a keyboard event and waits for the fixture.
   *
   * @param {EventTarget} target - Event target receiving the keyboard event.
   * @param {KeyboardEventInit} init - Keyboard event options.
   * @returns {Promise<void>} Promise resolved after the fixture updates.
   */
  async function keydown(target: EventTarget, init: KeyboardEventInit): Promise<void> {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }),
    );
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('opens on Ctrl K as a named modal dialog with the field focused', async () => {
    host.querySelector('button')?.focus();
    await keydown(document.body, { key: 'k', ctrlKey: true });

    expect(component.open()).toBe(true);
    const dialog: HTMLElement | null = palette();
    expect(dialog?.getAttribute('aria-label')).toBe('Palette de commandes');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    await fixture.whenStable();
    expect(document.activeElement).toBe(field());
    expect(dialog?.textContent).toContain('naviguer');
  });

  it('clears the search on the first Escape and closes on the second', async () => {
    component.open.set(true);
    await fixture.whenStable();
    const input: HTMLInputElement = field();
    input.value = 'tableau';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(component.search()).toBe('tableau');

    await keydown(input, { key: 'Escape' });
    expect(component.search()).toBe('');
    expect(palette()).not.toBeNull();

    await keydown(input, { key: 'Escape' });
    expect(component.open()).toBe(false);
    expect(palette()).toBeNull();
  });

  it('runs an item with Enter, empties the search when reopened and toggles with Ctrl K', async () => {
    component.open.set(true);
    await fixture.whenStable();
    const input: HTMLInputElement = field();
    input.value = 'créer';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    await keydown(input, { key: 'Enter' });
    expect(component.ran()).toBe('Créer une tâche');
    expect(palette()).toBeNull();

    await keydown(document.body, { key: 'k', ctrlKey: true });
    expect(component.search()).toBe('');
    expect(field().value).toBe('');

    await keydown(field(), { key: 'k', ctrlKey: true });
    expect(component.open()).toBe(false);
  });

  it('closes on a click on the veil', async () => {
    component.open.set(true);
    await fixture.whenStable();

    // The veil is the CDK backdrop: it has no role or name, only the CDK's own class.
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await fixture.whenStable();
    expect(component.open()).toBe(false);
  });
});
