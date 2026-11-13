import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CwCheckbox } from '@cadenway/ui/components/checkbox';

import { CwLabel } from './label.directive';

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
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('#space-desc');

    expect(input?.labels?.[0]?.textContent.trim()).toBe('Description (facultatif)');
  });

  it('toggles a checkbox when clicked', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const label = Array.from(host.querySelectorAll('label')).find(
      (element) => element.textContent.trim() === 'Afficher les sous-tâches',
    );
    const box = host.querySelector('[role="checkbox"]');

    label?.click();
    fixture.detectChanges();

    expect(box?.getAttribute('aria-checked')).toBe('true');
  });
});
