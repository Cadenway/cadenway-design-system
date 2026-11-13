import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwAvatar } from './avatar.component';
import type { CwAvatarPresence } from './avatar.types';

@Component({
  imports: [CwAvatar],
  template: `
    <cw-avatar
      name="Inès Duval"
      [src]="photo()"
      [presence]="presence()"
      (imageError)="errors.set(errors() + 1)"
    />
    <cw-avatar />
    <cw-avatar name="Samuel Roux" disabled />
  `,
})
class Host {
  readonly photo = signal<string | null>(null);
  readonly presence = signal<CwAvatarPresence | null>(null);
  readonly errors = signal(0);
}

/** The visually hidden text that names an avatar: its one child read by assistive technologies. */
function spoken(element: Element): string {
  const text = Array.from(element.children).find(
    (child) => !child.hasAttribute('aria-hidden') && child.childElementCount === 0,
  );
  return text?.textContent.trim() ?? '';
}

describe('CwAvatar', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  function avatars(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('cw-avatar'));
  }

  it('shows hidden initials and names the person in a hidden text and the title', () => {
    const [ines] = avatars();

    expect(ines.querySelector('[aria-hidden="true"]')?.textContent.trim()).toBe('ID');
    expect(spoken(ines)).toBe('Inès Duval');
    expect(ines.getAttribute('title')).toBe('Inès Duval');
  });

  it('names an unknown person and a deactivated account', () => {
    const [, unknown, samuel] = avatars();

    expect(spoken(unknown)).toBe('Utilisateur inconnu');
    expect(samuel.getAttribute('title')).toBe('Samuel Roux (désactivé)');
    expect(samuel.hasAttribute('data-disabled')).toBe(true);
  });

  it('reads the presence, never by color alone', async () => {
    component.presence.set('online');
    await fixture.whenStable();
    expect(spoken(avatars()[0])).toBe('Inès Duval (en ligne)');

    component.presence.set('away');
    await fixture.whenStable();
    expect(spoken(avatars()[0])).toBe('Inès Duval (absent)');
  });

  it('keeps the initials until the photo loads and comes back to them on error', async () => {
    component.photo.set('/photos/ines.jpg');
    await fixture.whenStable();
    const [ines] = avatars();
    const photo = ines.querySelector('img');
    expect(photo?.getAttribute('alt')).toBe('');
    expect(ines.textContent).toContain('ID');

    photo?.dispatchEvent(new Event('load'));
    await fixture.whenStable();
    expect(ines.textContent).not.toContain('ID');

    component.photo.set('/photos/missing.jpg');
    await fixture.whenStable();
    ines.querySelector('img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(component.errors()).toBe(1);
    expect(ines.querySelector('img')).toBeNull();
    expect(ines.textContent).toContain('ID');
  });
});
