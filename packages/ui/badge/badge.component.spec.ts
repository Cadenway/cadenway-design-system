import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwBadge } from './badge.component';

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
  readonly clicks = signal(0);
  readonly submitted = signal(false);
  readonly linkDisabled = signal(false);
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

  function byText(selector: string, text: string): HTMLElement {
    const found = Array.from(host.querySelectorAll<HTMLElement>(selector)).find(
      (element) => element.textContent.trim() === text,
    );
    if (!found) throw new Error(`No ${selector} reading ${text}`);
    return found;
  }

  it('keeps a span badge out of the tab order and the layout classes of the consumer', () => {
    const tag = byText('span', 'API');

    expect(tag.getAttribute('tabindex')).toBeNull();
    expect(tag.classList).toContain('ml-2');
    expect(tag.dataset['variant']).toBe('outline');
    expect(tag.dataset['size']).toBe('default');
  });

  it('makes a button badge a non-submitting button', () => {
    const filter = byText('button', 'Filtre');
    filter.click();

    expect(filter.getAttribute('type')).toBe('button');
    expect(component.clicks()).toBe(1);
    expect(component.submitted()).toBe(false);
  });

  it('disables a link badge through aria-disabled and the tab order', async () => {
    component.linkDisabled.set(true);
    await fixture.whenStable();
    const link = byText('a', 'Design');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(event.defaultPrevented).toBe(true);
  });
});
