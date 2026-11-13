import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwShortcut } from './shortcut.component';

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
  readonly inbox = viewChild.required<CwShortcut>('inbox');
}

function button(host: HTMLElement, start: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find((element) =>
    element.textContent.trim().startsWith(start),
  );
  if (!found) throw new Error(`No button starting with ${start}`);
  return found;
}

describe('CwShortcut', () => {
  it('spells a combination out for assistive technologies and hides the drawn keys', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const search = button(fixture.nativeElement as HTMLElement, 'Rechercher');
    const drawn = search.querySelector('[aria-hidden="true"]');

    expect(search.textContent).toContain('Contrôle K');
    expect(drawn?.textContent.replace(/\s+/g, ' ').trim()).toBe('CtrlK');
    expect(search.getAttribute('aria-keyshortcuts')).toBe('Control+K');
  });

  it('writes a sequence with « puis » and has no aria-keyshortcuts form for it', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const inbox = button(fixture.nativeElement as HTMLElement, 'Aller');

    expect(inbox.textContent).toContain('G puis I');
    expect(fixture.componentInstance.inbox().ariaKeyShortcuts()).toBe('');
  });

  it('gives the named keys their French label', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const close = button(fixture.nativeElement as HTMLElement, 'Fermer');

    expect(close.querySelector('kbd[cwKbd]')?.textContent).toBe('Échap');
    expect(close.querySelector('kbd[cwKbd]')?.getAttribute('data-size')).toBe('sm');
  });
});
