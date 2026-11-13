import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwPopoverTrigger } from '../popover-trigger/popover-trigger.directive';
import { CwPopover } from '../popover.component';
import { CwPopoverClose } from './popover-close.directive';

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
  readonly open = signal(true);
  readonly saves = signal(0);
}

describe('CwPopoverClose', () => {
  it('runs its own click, then closes the popover', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const save = Array.from(document.querySelectorAll('[role="dialog"] button')).find(
      (element) => element.textContent.trim() === 'Enregistrer',
    );
    if (!(save instanceof HTMLButtonElement)) throw new Error('No Enregistrer button');
    save.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.saves()).toBe(1);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    fixture.destroy();
  });
});
