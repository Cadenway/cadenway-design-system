import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwToastService } from '../toast.service';
import type { CwToastDurations } from '../toast.types';
import { CwToaster } from './toaster.component';

/**
 * Component Host
 *
 * @description
 * Supplies configurable toaster inputs and a focus target for interaction tests.
 */
@Component({
  imports: [CwToaster],
  template: `
    <button type="button">Déplacer</button>
    <cw-toaster [duration]="duration()" [closeButton]="closeButton()" [expand]="expand()" />
  `,
})
class Host {
  // #region Properties
  /**
   * Property duration
   *
   * @description
   * Overrides toast durations by tone in the fixture.
   *
   * @type {WritableSignal<CwToastDurations>}
   * @readonly
   */
  public readonly duration: WritableSignal<CwToastDurations> = signal<CwToastDurations>({});

  /**
   * Property closeButton
   *
   * @description
   * Controls whether all fixture toasts have a close button.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly closeButton: WritableSignal<boolean> = signal(false);

  /**
   * Property expand
   *
   * @description
   * Controls whether the fixture stack stays unfolded.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly expand: WritableSignal<boolean> = signal(false);
  // #endregion
}

describe('CwToaster', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let toasts: CwToastService;
  let element: HTMLElement;

  /**
   * Function region
   *
   * @description
   * Finds the notification region in the test fixture.
   *
   * @returns {HTMLElement} Focusable notification region.
   */
  function region(): HTMLElement {
    const found: HTMLElement | null = element.querySelector<HTMLElement>(
      'section[aria-label="Notifications (F8)"]',
    );
    if (!found) throw new Error('No notification region');
    return found;
  }

  /**
   * Function live
   *
   * @description
   * Finds the currently exposed status and alert notifications.
   *
   * @returns {HTMLElement[]} Live notification elements.
   */
  function live(): HTMLElement[] {
    return Array.from(region().querySelectorAll<HTMLElement>('[role="status"], [role="alert"]'));
  }

  /**
   * Function named
   *
   * @description
   * Finds a button by its accessible label or displayed text.
   *
   * @param {HTMLElement} scope - Element containing the buttons to inspect.
   * @param {string} name - Expected label or text.
   * @returns {HTMLButtonElement} Matching button.
   */
  function named(scope: HTMLElement, name: string): HTMLButtonElement {
    const found: HTMLButtonElement | undefined = Array.from(scope.querySelectorAll('button')).find(
      (button) => (button.getAttribute('aria-label') ?? button.textContent.trim()) === name,
    );
    if (!found) throw new Error(`No button named ${name}`);
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    toasts = TestBed.inject(CwToastService);
  });

  it('announces a toast with role status, and an error with role alert', async () => {
    toasts.success('Tâche archivée', { description: "CAD-466 · Doc d'installation Docker" });
    toasts.error("Impossible d'enregistrer");
    await fixture.whenStable();

    expect(live().map((toast) => toast.getAttribute('role'))).toEqual(['status', 'alert']);
    expect(live()[0]?.textContent).toContain("CAD-466 · Doc d'installation Docker");
  });

  it('runs the action, then closes the toast', async () => {
    const undo: () => void = vi.fn();
    toasts.success('Tâche déplacée vers Terminé', { undo });
    toasts.show('CAD-482 restaurée', { action: { label: 'Ouvrir', run: vi.fn() } });
    await fixture.whenStable();

    named(region(), 'Annuler').click();
    await fixture.whenStable();

    expect(undo).toHaveBeenCalledOnce();
    expect(live().map((toast) => toast.textContent)).toEqual([
      expect.stringContaining('CAD-482 restaurée'),
    ]);
  });

  it('adds the close button to every toast with closeButton', async () => {
    host.closeButton.set(true);
    toasts.show('Lien copié');
    await fixture.whenStable();

    named(region(), 'Fermer la notification').click();
    await fixture.whenStable();

    expect(live()).toEqual([]);
  });

  it('shows the three newest toasts and counts the others', async () => {
    for (const title of ['Un', 'Deux', 'Trois', 'Quatre', 'Cinq']) toasts.error(title);
    await fixture.whenStable();

    expect(live().map((toast) => toast.textContent.trim())).toEqual(['Trois', 'Quatre', 'Cinq']);
    expect(region().textContent).toContain('+2');

    host.expand.set(true);
    await fixture.whenStable();
    expect(region().textContent).toContain('+2 plus anciennes');
  });

  it('closes a toast after its duration, paused while the pointer is over the region', async () => {
    // Simulated clock: a real 40 ms duration expires before the pause lands on a loaded machine.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    try {
      host.duration.set({ default: 40 });
      fixture.detectChanges();
      toasts.show('Lien copié');
      fixture.detectChanges();

      region().dispatchEvent(new PointerEvent('pointerenter'));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(80);
      fixture.detectChanges();
      expect(live()).toHaveLength(1);

      region().dispatchEvent(new PointerEvent('pointerleave'));
      fixture.detectChanges();
      // The duration, then the exit animation's fallback.
      await vi.advanceTimersByTimeAsync(80 + 500);
      fixture.detectChanges();
      expect(live()).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('moves the focus into the region on F8, and back where it was on Escape', async () => {
    toasts.error("Impossible d'enregistrer", { action: { label: 'Réessayer', run: vi.fn() } });
    await fixture.whenStable();
    const before: HTMLButtonElement = named(element, 'Déplacer');
    before.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F8', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(region());
    expect(region().hasAttribute('data-expanded')).toBe(true);

    const retry: HTMLButtonElement = named(region(), 'Réessayer');
    retry.focus();
    retry.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(live()).toEqual([]);
    expect(document.activeElement).toBe(before);
  });

  it('closes a toast swiped towards the edge of the screen', async () => {
    toasts.error('Étiquette supprimée');
    await fixture.whenStable();
    const item: HTMLElement | null | undefined = live()[0]?.parentElement;
    if (!item) throw new Error('No toast');

    // `detail: 1`: the CDK ignores a mousedown that looks generated by a screen reader.
    item.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, buttons: 1, detail: 1, clientX: 0 }),
    );
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, buttons: 1, clientX: 30 }));
    document.dispatchEvent(
      new MouseEvent('mousemove', { bubbles: true, buttons: 1, clientX: 200 }),
    );
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 200 }));
    await fixture.whenStable();

    expect(live()).toEqual([]);
  });
});
