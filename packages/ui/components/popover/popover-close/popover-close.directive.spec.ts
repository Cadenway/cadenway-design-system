import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwPopoverTrigger } from '../popover-trigger/popover-trigger.directive';
import { CwPopover } from '../popover.component';
import { CwPopoverClose } from './popover-close.directive';

/**
 * Component Host
 *
 * @description
 * Exercises the popover close directive.
 */
@Component({
  imports: [CwPopover, CwPopoverTrigger, CwPopoverClose],
  template: `
    <button type="button" [cwPopoverTrigger]="estimate">5 points</button>
    <cw-popover #estimate size="sm" ariaLabel="Estimation" [(open)]="open">
      <button type="button" cwPopoverClose (click)="saves.set(saves() + 1)">Enregistrer</button>
    </cw-popover>
  `,
})
class Host {
  // #region Properties
  /**
   * Property open
   * @readonly
   *
   * @description
   * Whether the popover is open.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly open: WritableSignal<boolean> = signal(true);

  /**
   * Property saves
   * @readonly
   *
   * @description
   * Number of save clicks.
   *
   * @type {WritableSignal<number>}
   */
  public readonly saves: WritableSignal<number> = signal(0);
  // #endregion
}

describe('CwPopoverClose', () => {
  it('runs its own click, then closes the popover', async () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    await fixture.whenStable();

    const save: Element | undefined = Array.from(
      document.querySelectorAll('[role="dialog"] button'),
    ).find((element) => element.textContent.trim() === 'Enregistrer');
    if (!(save instanceof HTMLButtonElement)) throw new Error('No Enregistrer button');
    save.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.saves()).toBe(1);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    fixture.destroy();
  });
});
