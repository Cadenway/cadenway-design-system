import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwToggle } from './toggle.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test form with mutable filter and formatting toggles and a disabled pressed toggle.
 */
@Component({
  imports: [CwToggle],
  template: `
    <form (submit)="$event.preventDefault(); submitted.set(true)">
      <button cwToggle variant="outline" [(pressed)]="onlyMine">Moi uniquement</button>
      <button cwToggle size="sm" aria-label="Gras" [(pressed)]="bold"></button>
      <button cwToggle disabled [pressed]="true">Masquer les terminées</button>
    </form>
  `,
})
class Host {
  // #region Properties
  /**
   * Property onlyMine
   * @readonly
   *
   * @description
   * Pressed model for the personal-filter toggle.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly onlyMine: WritableSignal<boolean> = signal(false);

  /**
   * Property bold
   * @readonly
   *
   * @description
   * Pressed model for the initially active bold toggle.
   *
   * @type {WritableSignal<boolean>}
   * @default true
   */
  public readonly bold: WritableSignal<boolean> = signal(true);

  /**
   * Property submitted
   * @readonly
   *
   * @description
   * Records whether the form's submit handler ran.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly submitted: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function byName
 *
 * @description
 * Finds a toggle button by its aria-label or trimmed visible text.
 *
 * @param {HTMLElement} host - Container holding the toggle buttons.
 * @param {string} name - Exact accessible label or text to match.
 *
 * @returns {HTMLButtonElement} First matching toggle.
 *
 * @throws {Error} When no toggle has the requested name.
 */
function byName(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No toggle named ${name}`);
  return found;
}

describe('CwToggle', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('flips the pressed model on click without submitting the form', async () => {
    const onlyMine: HTMLButtonElement = byName(host, 'Moi uniquement');
    expect(onlyMine.getAttribute('aria-pressed')).toBe('false');
    expect(onlyMine.dataset['state']).toBe('off');

    onlyMine.click();
    await fixture.whenStable();

    expect(component.onlyMine()).toBe(true);
    expect(component.submitted()).toBe(false);
    expect(onlyMine.getAttribute('type')).toBe('button');
    expect(onlyMine.getAttribute('aria-pressed')).toBe('true');
    expect(onlyMine.dataset['state']).toBe('on');
  });

  it('reflects a pressed model given by the consumer and flips it back', async () => {
    const bold: HTMLButtonElement = byName(host, 'Gras');
    expect(bold.getAttribute('aria-pressed')).toBe('true');

    bold.click();
    await fixture.whenStable();

    expect(component.bold()).toBe(false);
    expect(bold.getAttribute('aria-pressed')).toBe('false');
  });

  it('stays pressed and inert when disabled', () => {
    const hide: HTMLButtonElement = byName(host, 'Masquer les terminées');

    expect(hide.disabled).toBe(true);
    expect(hide.getAttribute('aria-pressed')).toBe('true');
  });
});
