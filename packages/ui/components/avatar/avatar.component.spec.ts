import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwAvatar } from './avatar.component';
import type { CwAvatarPresence } from './avatar.types';

/**
 * Class Host
 *
 * @description
 * Hosts avatars with controllable image and presence state.
 */
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
  // #region Properties
  /**
   * Property photo
   * @readonly
   *
   * @description
   * Photo source supplied to the first avatar.
   *
   * @type {WritableSignal<string | null>}
   */
  public readonly photo: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property presence
   * @readonly
   *
   * @description
   * Presence supplied to the first avatar.
   *
   * @type {WritableSignal<CwAvatarPresence | null>}
   */
  public readonly presence: WritableSignal<CwAvatarPresence | null> =
    signal<CwAvatarPresence | null>(null);

  /**
   * Property errors
   * @readonly
   *
   * @description
   * Number of image error events received.
   *
   * @type {WritableSignal<number>}
   */
  public readonly errors: WritableSignal<number> = signal(0);
  // #endregion
}

/**
 * Function spoken
 *
 * @description
 * Reads the avatar's visually hidden accessible text.
 *
 * @param {Element} element - Avatar element to inspect.
 *
 * @returns {string} Accessible text, or an empty string when absent.
 */
function spoken(element: Element): string {
  const text: Element | undefined = Array.from(element.children).find(
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

  /**
   * Function avatars
   *
   * @description
   * Returns all avatar elements in the fixture.
   *
   * @returns {HTMLElement[]} Avatar hosts in the fixture.
   */
  function avatars(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('cw-avatar'));
  }

  it('shows hidden initials and names the person in a hidden text and the title', () => {
    const [ines]: HTMLElement[] = avatars();

    expect(ines.querySelector('[aria-hidden="true"]')?.textContent.trim()).toBe('ID');
    expect(spoken(ines)).toBe('Inès Duval');
    expect(ines.getAttribute('title')).toBe('Inès Duval');
  });

  it('names an unknown person and a deactivated account', () => {
    const [, unknown, samuel]: HTMLElement[] = avatars();

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
    const [ines]: HTMLElement[] = avatars();
    const photo: HTMLImageElement | null = ines.querySelector('img');
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
