import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwAvatarAdd } from './avatar-add.component';

/**
 * Class Host
 *
 * @description
 * Hosts the assignment button inside a form.
 */
@Component({
  imports: [CwAvatarAdd],
  template: `
    <form (submit)="$event.preventDefault(); submitted.set(true)">
      <button cwAvatarAdd (click)="picks.set(picks() + 1)"></button>
    </form>
  `,
})
class Host {
  // #region Properties
  /**
   * Property picks
   * @readonly
   *
   * @description
   * Number of button activations.
   *
   * @type {WritableSignal<number>}
   */
  public readonly picks: WritableSignal<number> = signal(0);

  /**
   * Property submitted
   * @readonly
   *
   * @description
   * Whether the form was submitted.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly submitted: WritableSignal<boolean> = signal(false);
  // #endregion
}

describe('CwAvatarAdd', () => {
  it('is a named button that never submits its form', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const add: HTMLButtonElement | null = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>('button[aria-label="Assigner"]');

    add?.click();

    expect(add?.getAttribute('type')).toBe('button');
    expect(fixture.componentInstance.picks()).toBe(1);
    expect(fixture.componentInstance.submitted()).toBe(false);
  });
});
