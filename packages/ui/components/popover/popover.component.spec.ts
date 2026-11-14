import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPopoverClose } from './popover-close/popover-close.directive';
import { CwPopoverTrigger } from './popover-trigger/popover-trigger.directive';
import { CwPopover } from './popover.component';

/**
 * Component Host
 *
 * @description
 * Exercises popover focus and dismissal.
 */
@Component({
  imports: [CwPopover, CwPopoverTrigger, CwPopoverClose],
  template: `
    <button type="button" [cwPopoverTrigger]="share">Partager</button>
    <cw-popover
      #share
      align="start"
      size="lg"
      ariaLabel="Partager « Sprint 14 »"
      [(open)]="shareOpen"
    >
      <input
        aria-label="Lien de partage"
        value="https://cadenway.exemple.fr/l/sprint-14"
        readonly
      />
      <button type="button" cwPopoverClose>Fermer</button>
    </cw-popover>

    <button type="button" [cwPopoverTrigger]="estimate">5 points</button>
    <cw-popover #estimate arrow size="sm" ariaLabel="Estimation" [closeOnOutsideClick]="false">
      <button type="button" cwPopoverClose>Annuler</button>
    </cw-popover>

    <button type="button" [cwPopoverTrigger]="help">Aide</button>
    <cw-popover #help modal side="right" ariaLabel="Aide">
      <a href="#aide">En savoir plus</a>
    </cw-popover>

    <button type="button">Ailleurs</button>
  `,
})
class Host {
  // #region Properties
  /**
   * Property shareOpen
   * @readonly
   *
   * @description
   * Whether the sharing popover is open.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly shareOpen: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function button
 *
 * @description
 * Finds a trigger button by its text.
 *
 * @param {HTMLElement} host - Container holding the button.
 * @param {string} name - Expected visible button text.
 *
 * @returns {HTMLButtonElement} Matching button element.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function dialog
 *
 * @description
 * Finds a popover panel by accessible name.
 *
 * @param {string} name - Accessible name of the panel.
 *
 * @returns {HTMLElement | undefined} Matching panel, or undefined when absent.
 */
function dialog(name: string): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
}

/**
 * Function within
 *
 * @description
 * Returns a named popover panel.
 *
 * @param {string} name - Accessible name of the panel.
 *
 * @returns {HTMLElement} Matching panel element.
 */
function within(name: string): HTMLElement {
  const found: HTMLElement | undefined = dialog(name);
  if (!found) throw new Error(`No dialog named ${name}`);
  return found;
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to the active element.
 *
 * @param {string} key - Keyboard key dispatched to the active element.
 */
function press(key: string): void {
  document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('CwPopover', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('opens a named non-modal dialog from its trigger and moves the focus into it', async () => {
    const trigger: HTMLButtonElement = button(host, 'Partager');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);

    trigger.click();
    await fixture.whenStable();

    const panel: HTMLElement = within('Partager « Sprint 14 »');
    expect(panel.hasAttribute('aria-modal')).toBe(false);
    expect(panel.dataset['state']).toBe('open');
    expect(panel.dataset['side']).toBe('bottom');
    expect(panel.dataset['align']).toBe('start');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(trigger.dataset['state']).toBe('open');
    expect(panel.contains(document.activeElement)).toBe(true);
    expect(fixture.componentInstance.shareOpen()).toBe(true);
  });

  it('closes on Escape and gives the focus back to the trigger', async () => {
    const trigger: HTMLButtonElement = button(host, 'Partager');
    trigger.click();
    await fixture.whenStable();

    press('Escape');
    await fixture.whenStable();

    expect(dialog('Partager « Sprint 14 »')).toBeUndefined();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.shareOpen()).toBe(false);
  });

  it('closes on a new click of its trigger and on an outside click', async () => {
    const trigger: HTMLButtonElement = button(host, 'Partager');
    trigger.click();
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();
    expect(dialog('Partager « Sprint 14 »')).toBeUndefined();

    trigger.click();
    await fixture.whenStable();
    button(host, 'Ailleurs').click();
    await fixture.whenStable();
    expect(dialog('Partager « Sprint 14 »')).toBeUndefined();
  });

  it('stays open on an outside click when closeOnOutsideClick is false', async () => {
    button(host, '5 points').click();
    await fixture.whenStable();

    button(host, 'Ailleurs').click();
    await fixture.whenStable();
    expect(dialog('Estimation')).toBeDefined();
  });

  it('closes when the focus tabs out of the panel', async () => {
    button(host, 'Partager').click();
    await fixture.whenStable();

    const elsewhere: HTMLButtonElement = button(host, 'Ailleurs');
    within('Partager « Sprint 14 »').dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: elsewhere }),
    );
    await fixture.whenStable();
    expect(dialog('Partager « Sprint 14 »')).toBeUndefined();
  });

  it('closes from a cwPopoverClose button and gives the focus back', async () => {
    const trigger: HTMLButtonElement = button(host, '5 points');
    trigger.click();
    await fixture.whenStable();

    const cancel: HTMLButtonElement | undefined = Array.from(
      within('Estimation').querySelectorAll('button'),
    ).find((element) => element.textContent.trim() === 'Annuler');
    cancel?.focus();
    cancel?.click();
    await fixture.whenStable();

    expect(dialog('Estimation')).toBeUndefined();
    expect(document.activeElement).toBe(trigger);
  });

  it('draws a decorative arrow when asked', async () => {
    button(host, '5 points').click();
    await fixture.whenStable();

    expect(
      within('Estimation').querySelector('cw-popover-arrow')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('follows its open model', async () => {
    fixture.componentInstance.shareOpen.set(true);
    await fixture.whenStable();
    expect(dialog('Partager « Sprint 14 »')).toBeDefined();
    expect(button(host, 'Partager').getAttribute('aria-expanded')).toBe('true');

    fixture.componentInstance.shareOpen.set(false);
    await fixture.whenStable();
    expect(dialog('Partager « Sprint 14 »')).toBeUndefined();
  });

  it('marks a modal panel and keeps the focus inside it', async () => {
    button(host, 'Aide').click();
    await fixture.whenStable();

    const panel: HTMLElement = within('Aide');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.dataset['side']).toBe('right');
    expect(panel.contains(document.activeElement)).toBe(true);

    panel.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: button(host, 'Ailleurs') }),
    );
    await fixture.whenStable();
    expect(dialog('Aide')).toBeDefined();
  });
});
