import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwSpinner } from './spinner.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host exposing a named spinner and a spinner without an accessible name.
 */
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
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const [named, silent]: SVGSVGElement[] = Array.from(host.querySelectorAll('svg'));

    expect(named.getAttribute('role')).toBe('status');
    expect(named.getAttribute('aria-label')).toBe('Envoi du fichier');
    expect(silent.getAttribute('aria-hidden')).toBe('true');
  });
});
