import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwCollapsibleChevron } from './collapsible-chevron/collapsible-chevron.component';
import { CwCollapsibleContent } from './collapsible-content/collapsible-content.component';
import { CwCollapsibleTrigger } from './collapsible-trigger/collapsible-trigger.directive';
import { CwCollapsible } from './collapsible.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host with a mutable subtask block and a disabled block with a row trigger.
 */
@Component({
  imports: [CwCollapsible, CwCollapsibleTrigger, CwCollapsibleContent, CwCollapsibleChevron],
  template: `
    <cw-collapsible [(expanded)]="subtasks">
      <h4>Sous-tâches 2 / 5</h4>
      <button
        cwCollapsibleTrigger
        [attr.aria-label]="subtasks() ? 'Replier les sous-tâches' : 'Déplier les sous-tâches'"
      >
        <cw-collapsible-chevron />
      </button>
      <cw-collapsible-content>
        <a href="/t/CAD-490">Tester LibreOffice</a>
      </cw-collapsible-content>
    </cw-collapsible>

    <cw-collapsible disabled>
      <button cwCollapsibleTrigger variant="row" (click)="clicks.set(clicks() + 1)">
        <cw-collapsible-chevron direction="right" />
        Bloqué 0
      </button>
      <cw-collapsible-content>Aucune tâche</cw-collapsible-content>
    </cw-collapsible>
  `,
})
class Host {
  // #region Properties
  /**
   * Property subtasks
   * @readonly
   *
   * @description
   * Two-way expansion model for the subtask block.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly subtasks: WritableSignal<boolean> = signal(false);

  /**
   * Property clicks
   * @readonly
   *
   * @description
   * Counts consumer clicks received by the disabled block's trigger.
   *
   * @type {WritableSignal<number>}
   * @default 0
   */
  public readonly clicks: WritableSignal<number> = signal(0);
  // #endregion
}

/**
 * Function button
 *
 * @description
 * Finds a test trigger button by its aria-label or trimmed visible text.
 *
 * @param {HTMLElement} host - Container holding the trigger buttons.
 * @param {string} name - Exact button name to match.
 *
 * @returns {HTMLButtonElement} First matching button.
 *
 * @throws {Error} When no button has the requested name.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwCollapsible', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('starts closed, its content inert and controlled by the trigger', () => {
    const trigger: HTMLButtonElement = button(host, 'Déplier les sous-tâches');
    const content: Element | null = host.querySelector('cw-collapsible-content');

    expect(trigger.getAttribute('type')).toBe('button');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(content?.id);
    expect(content?.hasAttribute('inert')).toBe(true);
    expect(content?.getAttribute('data-state')).toBe('closed');
  });

  it('toggles on click and writes the two-way binding', async () => {
    button(host, 'Déplier les sous-tâches').click();
    await fixture.whenStable();

    const trigger: HTMLButtonElement = button(host, 'Replier les sous-tâches');
    const content: Element | null = host.querySelector('cw-collapsible-content');
    expect(fixture.componentInstance.subtasks()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content?.hasAttribute('inert')).toBe(false);
    expect(host.querySelector('cw-collapsible')?.getAttribute('data-state')).toBe('open');

    trigger.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.subtasks()).toBe(false);
  });

  it('opens when the model is set from outside', async () => {
    fixture.componentInstance.subtasks.set(true);
    await fixture.whenStable();

    expect(button(host, 'Replier les sous-tâches').getAttribute('aria-expanded')).toBe('true');
  });

  it('does not toggle nor let the click through when disabled', async () => {
    const trigger: HTMLButtonElement = button(host, 'Bloqué 0');
    expect(trigger.getAttribute('aria-disabled')).toBe('true');

    trigger.click();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.clicks()).toBe(0);
  });
});
