import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CwCheckbox } from '@cadenway/ui/components/checkbox';

import { CwLabel } from './label.directive';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host pairing labels with a native input and a checkbox.
 */
@Component({
  imports: [CwLabel, CwCheckbox],
  template: `
    <label cwLabel for="space-desc">
      Description <span class="font-normal text-muted-foreground">(facultatif)</span>
    </label>
    <input id="space-desc" />
    <cw-checkbox id="show-subtasks" />
    <label cwLabel for="show-subtasks">Afficher les sous-tâches</label>
  `,
})
class Host {}

describe('CwLabel', () => {
  it('names the control it points at', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const input: HTMLInputElement | null = host.querySelector<HTMLInputElement>('#space-desc');

    expect(input?.labels?.[0]?.textContent.trim()).toBe('Description (facultatif)');
  });

  it('toggles a checkbox when clicked', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const label: HTMLLabelElement | undefined = Array.from(host.querySelectorAll('label')).find(
      (element) => element.textContent.trim() === 'Afficher les sous-tâches',
    );
    const box: Element | null = host.querySelector('[role="checkbox"]');

    label?.click();
    fixture.detectChanges();

    expect(box?.getAttribute('aria-checked')).toBe('true');
  });
});
