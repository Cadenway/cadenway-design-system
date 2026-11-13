import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwLogo } from './logo.component';

@Component({
  imports: [CwLogo],
  template: `
    <cw-logo [size]="size()" />
    <a href="/">
      <cw-logo [size]="20" tone="mono" decorative />
      <span class="sr-only">Cadenway — accueil</span>
    </a>
  `,
})
class Host {
  readonly size = signal(48);
}

describe('CwLogo', () => {
  it('is an image named Cadenway, sized by its height in px', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const image = (fixture.nativeElement as HTMLElement).querySelector('[role="img"]');

    expect(image?.getAttribute('aria-label')).toBe('Cadenway');
    expect(image?.getAttribute('height')).toBe('48');
  });

  it('switches to the small drawing under 32 px and never goes under 12 px', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const image = (): Element | null =>
      (fixture.nativeElement as HTMLElement).querySelector('[role="img"]');
    const stroke = (): string | null | undefined =>
      image()?.querySelector('path')?.getAttribute('stroke-width');

    expect(stroke()).toBe('3.3');

    fixture.componentInstance.size.set(8);
    await fixture.whenStable();

    expect(stroke()).toBe('4.2');
    expect(image()?.getAttribute('height')).toBe('12');
  });

  it('is hidden when decorative, leaving the name to the link', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a');

    expect(link?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(link?.querySelector('[role="img"]')).toBeNull();
    expect(link?.textContent.trim()).toBe('Cadenway — accueil');
  });
});
