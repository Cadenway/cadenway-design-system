import { Component, viewChild, type Signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwShortcut } from './shortcut.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with a modifier combination, a sequence and a named shortcut key.
 */
@Component({
  imports: [CwShortcut],
  template: `
    <button type="button" [attr.aria-keyshortcuts]="search.ariaKeyShortcuts()">
      Rechercher <cw-shortcut #search keys="mod+K" />
    </button>
    <button type="button">
      Aller à la boîte de réception <cw-shortcut #inbox keys="g i" variant="inverse" />
    </button>
    <button type="button">Fermer le panneau <cw-shortcut keys="esc" size="sm" /></button>
  `,
})
class Host {
  // #region Properties
  /**
   * Property inbox
   * @readonly
   *
   * @description
   * Required query for the sequence shortcut so its ARIA value can be asserted.
   *
   * @type {Signal<CwShortcut>}
   */
  public readonly inbox: Signal<CwShortcut> = viewChild.required<CwShortcut>('inbox');
  // #endregion
}

/**
 * Function button
 *
 * @description
 * Finds a test button by the start of its visible text.
 *
 * @param {HTMLElement} host - Container holding the buttons.
 * @param {string} start - Text that begins the button label after trimming.
 *
 * @returns {HTMLButtonElement} First matching button.
 *
 * @throws {Error} When no button starts with the requested text.
 */
function button(host: HTMLElement, start: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.textContent.trim().startsWith(start),
  );
  if (!found) throw new Error(`No button starting with ${start}`);
  return found;
}

describe('CwShortcut', () => {
  it('spells a combination out for assistive technologies and hides the drawn keys', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const search: HTMLButtonElement = button(fixture.nativeElement as HTMLElement, 'Rechercher');
    const drawn: Element | null = search.querySelector('[aria-hidden="true"]');

    expect(search.textContent).toContain('Contrôle K');
    expect(drawn?.textContent.replace(/\s+/g, ' ').trim()).toBe('CtrlK');
    expect(search.getAttribute('aria-keyshortcuts')).toBe('Control+K');
  });

  it('writes a sequence with « puis » and has no aria-keyshortcuts form for it', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const inbox: HTMLButtonElement = button(fixture.nativeElement as HTMLElement, 'Aller');

    expect(inbox.textContent).toContain('G puis I');
    expect(fixture.componentInstance.inbox().ariaKeyShortcuts()).toBe('');
  });

  it('gives the named keys their French label', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const close: HTMLButtonElement = button(fixture.nativeElement as HTMLElement, 'Fermer');

    expect(close.querySelector('kbd[cwKbd]')?.textContent).toBe('Échap');
    expect(close.querySelector('kbd[cwKbd]')?.getAttribute('data-size')).toBe('sm');
  });
});
