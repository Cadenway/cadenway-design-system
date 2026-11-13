import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwSpinner } from './spinner.component';

@Component({
  imports: [CwSpinner],
  template: `
    <svg cwSpinner label="Envoi du fichier"></svg>
    <svg cwSpinner size="sm"></svg>
  `,
})
class Host {}

describe('CwSpinner', () => {
  it('is a named status when labelled, hidden otherwise', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const [named, silent] = Array.from(host.querySelectorAll('svg'));

    expect(named.getAttribute('role')).toBe('status');
    expect(named.getAttribute('aria-label')).toBe('Envoi du fichier');
    expect(silent.getAttribute('aria-hidden')).toBe('true');
  });
});
