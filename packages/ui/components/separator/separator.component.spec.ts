import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwSeparator } from './separator.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host containing decorative, vertical semantic and labelled separators.
 */
@Component({
  imports: [CwSeparator],
  template: `
    <cw-separator class="my-3" />
    <cw-separator orientation="vertical" [decorative]="false" class="h-4" />
    <cw-separator [decorative]="false">Aujourd'hui</cw-separator>
  `,
})
class Host {}

describe('CwSeparator', () => {
  it('is hidden from the accessibility tree when decorative', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('[role="separator"]')).toHaveLength(2);
    expect(host.querySelectorAll('[role="none"]')).toHaveLength(1);
  });

  it('states the orientation of a semantic vertical separator', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [vertical, labelled]: Element[] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[role="separator"]'),
    );

    expect(vertical.getAttribute('aria-orientation')).toBe('vertical');
    expect(vertical.getAttribute('data-orientation')).toBe('vertical');
    expect(labelled.getAttribute('aria-orientation')).toBeNull();
    expect(labelled.textContent).toBe("Aujourd'hui");
  });
});
