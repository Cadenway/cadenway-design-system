import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwAvatarAdd } from './avatar-add.component';

@Component({
  imports: [CwAvatarAdd],
  template: `
    <form (submit)="$event.preventDefault(); submitted.set(true)">
      <!-- The brick names itself (« Assigner ») and draws its own icon. -->
      <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
      <button cwAvatarAdd (click)="picks.set(picks() + 1)"></button>
    </form>
  `,
})
class Host {
  readonly picks = signal(0);
  readonly submitted = signal(false);
}

describe('CwAvatarAdd', () => {
  it('is a named button that never submits its form', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const add = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label="Assigner"]',
    );

    add?.click();

    expect(add?.getAttribute('type')).toBe('button');
    expect(fixture.componentInstance.picks()).toBe(1);
    expect(fixture.componentInstance.submitted()).toBe(false);
  });
});
