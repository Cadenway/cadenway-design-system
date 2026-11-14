import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPopover } from '../popover.component';
import { CwPopoverTrigger } from './popover-trigger.directive';

/**
 * Component Host
 *
 * @description
 * Exercises popover trigger registration.
 */
@Component({
  imports: [CwPopover, CwPopoverTrigger],
  template: `
    <button type="button" [cwPopoverTrigger]="due">Échéance</button>
    @if (second()) {
      <button type="button" [cwPopoverTrigger]="due">Autre échéance</button>
    }
    <cw-popover #due ariaLabel="Échéance" [(open)]="open"><p>Jeudi 12 novembre</p></cw-popover>
  `,
})
class Host {
  // #region Properties
  /**
   * Property second
   * @readonly
   *
   * @description
   * Whether the second trigger is shown.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly second: WritableSignal<boolean> = signal(true);

  /**
   * Property open
   * @readonly
   *
   * @description
   * Whether the popover is open.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly open: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function button
 *
 * @description
 * Finds a trigger button by its text.
 *
 * @param {HTMLElement} host - Container holding the trigger.
 * @param {string} name - Expected visible button text.
 *
 * @returns {HTMLButtonElement} Matching trigger button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function panels
 *
 * @description
 * Returns rendered popover panels.
 *
 * @returns {HTMLElement[]} Popover panels currently rendered in the document.
 */
function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
}

describe('CwPopoverTrigger', () => {
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

  it('moves a shared panel to the trigger that opened it', async () => {
    const first: HTMLButtonElement = button(host, 'Échéance');
    const second: HTMLButtonElement = button(host, 'Autre échéance');
    first.click();
    await fixture.whenStable();
    expect(first.getAttribute('aria-expanded')).toBe('true');

    second.click();
    await fixture.whenStable();
    expect(panels()).toHaveLength(1);
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(second.getAttribute('aria-controls')).toBe(panels()[0]?.id);
  });

  it('closes the panel when its anchor goes away', async () => {
    button(host, 'Autre échéance').click();
    await fixture.whenStable();

    fixture.componentInstance.second.set(false);
    await fixture.whenStable();
    expect(panels()).toHaveLength(0);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
