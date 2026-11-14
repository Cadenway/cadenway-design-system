import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwBadge } from './badge.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test form with a static badge, an action badge and a link whose disabled state can change.
 */
@Component({
  imports: [CwBadge],
  template: `
    <form (submit)="$event.preventDefault(); submitted.set(true)">
      <span cwBadge variant="outline" class="ml-2">API</span>
      <button cwBadge variant="ghost" (click)="clicks.set(clicks() + 1)">Filtre</button>
      <a cwBadge variant="outline" href="/liste" [disabled]="linkDisabled()">Design</a>
    </form>
  `,
})
class Host {
  // #region Properties
  /**
   * Property clicks
   * @readonly
   *
   * @description
   * Number of clicks received by the action badge.
   *
   * @type {WritableSignal<number>}
   * @default 0
   */
  public readonly clicks: WritableSignal<number> = signal(0);

  /**
   * Property submitted
   * @readonly
   *
   * @description
   * Records whether the test form's submit handler ran.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly submitted: WritableSignal<boolean> = signal(false);

  /**
   * Property linkDisabled
   * @readonly
   *
   * @description
   * Controls the disabled state of the test link badge.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly linkDisabled: WritableSignal<boolean> = signal(false);
  // #endregion
}

describe('CwBadge', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  /**
   * Function byText
   *
   * @description
   * Finds a control in the test host by its selector and trimmed visible text.
   *
   * @param {string} selector - Selector used to choose candidate elements.
   * @param {string} text - Visible text to match exactly after trimming.
   *
   * @returns {HTMLElement} First matching element.
   *
   * @throws {Error} When no matching element exists.
   */
  function byText(selector: string, text: string): HTMLElement {
    const found: HTMLElement | undefined = Array.from(
      host.querySelectorAll<HTMLElement>(selector),
    ).find((element) => element.textContent.trim() === text);
    if (!found) throw new Error(`No ${selector} reading ${text}`);
    return found;
  }

  it('keeps a span badge out of the tab order and the layout classes of the consumer', () => {
    const tag: HTMLElement = byText('span', 'API');

    expect(tag.getAttribute('tabindex')).toBeNull();
    expect(tag.classList).toContain('ml-2');
    expect(tag.dataset['variant']).toBe('outline');
    expect(tag.dataset['size']).toBe('default');
  });

  it('makes a button badge a non-submitting button', () => {
    const filter: HTMLElement = byText('button', 'Filtre');
    filter.click();

    expect(filter.getAttribute('type')).toBe('button');
    expect(component.clicks()).toBe(1);
    expect(component.submitted()).toBe(false);
  });

  it('disables a link badge through aria-disabled and the tab order', async () => {
    component.linkDisabled.set(true);
    await fixture.whenStable();
    const link: HTMLElement = byText('a', 'Design');
    const event: MouseEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(event.defaultPrevented).toBe(true);
  });
});
