import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwEmptyContent } from './empty-content/empty-content.component';
import { CwEmptyDescription } from './empty-description/empty-description.component';
import { CwEmptyHeader } from './empty-header/empty-header.component';
import { CwEmptyMedia } from './empty-media/empty-media.component';
import { CwEmptyTitle } from './empty-title/empty-title.component';
import { CwEmpty } from './empty.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host composing an error alert from empty-state parts and a retry action.
 */
@Component({
  imports: [
    CwEmpty,
    CwEmptyHeader,
    CwEmptyMedia,
    CwEmptyTitle,
    CwEmptyDescription,
    CwEmptyContent,
    CwButton,
  ],
  template: `
    <div role="alert">
      <cw-empty size="sm">
        <cw-empty-header>
          <cw-empty-media tone="destructive">!</cw-empty-media>
          <cw-empty-title>Impossible de charger les tâches</cw-empty-title>
          <cw-empty-description>Le serveur n'a pas répondu à temps.</cw-empty-description>
        </cw-empty-header>
        <cw-empty-content>
          <button cwButton variant="outline" (click)="retries.set(retries() + 1)">Réessayer</button>
        </cw-empty-content>
      </cw-empty>
    </div>
  `,
})
class Host {
  // #region Properties
  /**
   * Property retries
   * @readonly
   *
   * @description
   * Counts clicks received by the projected retry button.
   *
   * @type {WritableSignal<number>}
   * @default 0
   */
  public readonly retries: WritableSignal<number> = signal(0);
  // #endregion
}

describe('CwEmpty', () => {
  it('reads as its title and description, the media hidden', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const alert: Element | null = (fixture.nativeElement as HTMLElement).querySelector(
      '[role="alert"]',
    );
    const media: Element | null | undefined = alert?.querySelector('[aria-hidden="true"]');

    expect(media?.getAttribute('data-tone')).toBe('destructive');
    expect(alert?.textContent).toContain('Impossible de charger les tâches');
  });

  it('leaves the focus to its projected actions', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const retry: HTMLButtonElement | null = host.querySelector('button');

    retry?.click();

    expect(host.querySelector('cw-empty')?.getAttribute('tabindex')).toBeNull();
    expect(host.querySelector('cw-empty')?.getAttribute('data-size')).toBe('sm');
    expect(fixture.componentInstance.retries()).toBe(1);
  });
});
