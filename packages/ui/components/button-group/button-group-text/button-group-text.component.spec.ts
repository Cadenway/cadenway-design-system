import { Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwButtonGroupText } from './button-group-text.component';
import { CwButtonGroup } from '../button-group.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host placing a descriptive text beside a button in a group.
 */
@Component({
  imports: [CwButton, CwButtonGroup, CwButtonGroupText],
  template: `
    <cw-button-group ariaLabel="Déplacer">
      <cw-button-group-text>Déplacer vers</cw-button-group-text>
      <button cwButton variant="outline">Sprint 15</button>
    </cw-button-group>
  `,
})
class Host {}

describe('CwButtonGroupText', () => {
  it('shows a text that names what follows', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;

    const group: HTMLElement | null = host.querySelector<HTMLElement>(
      '[role="group"][aria-label="Déplacer"]',
    );

    expect(group?.textContent).toContain('Déplacer vers');
  });
});
