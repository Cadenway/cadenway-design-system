import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwDialogClose } from './dialog-close/dialog-close.directive';
import { CwDialogDescription } from './dialog-description/dialog-description.directive';
import { CwDialogFooter } from './dialog-footer/dialog-footer.component';
import { CwDialogHeader } from './dialog-header/dialog-header.component';
import { CwDialogTitle } from './dialog-title/dialog-title.directive';
import { CwDialogTrigger } from './dialog-trigger/dialog-trigger.directive';
import { CwDialog } from './dialog.component';
import type { CwDialogCloseReason } from './dialog.types';

/**
 * Component Host
 *
 * @description
 * Exercises dialog opening, closing and pending states.
 */
@Component({
  imports: [
    CwButton,
    CwDialog,
    CwDialogClose,
    CwDialogDescription,
    CwDialogFooter,
    CwDialogHeader,
    CwDialogTitle,
    CwDialogTrigger,
  ],
  template: `
    <button cwButton variant="outline" [cwDialogTrigger]="rename">Renommer</button>
    <cw-dialog
      #rename
      [(open)]="open"
      [pending]="pending()"
      [closeOnOverlayClick]="overlayCloses()"
      [showClose]="showClose()"
      (closed)="reasons.push($event)"
    >
      <cw-dialog-header>
        <h2 cwDialogTitle>Renommer la liste</h2>
        <p cwDialogDescription>
          Le nouveau nom est visible par tous les membres de l'espace Produit.
        </p>
      </cw-dialog-header>
      <label for="list-name">Nom</label>
      <input id="list-name" value="Sprint 14" />
      <button
        type="button"
        aria-haspopup="listbox"
        [attr.aria-expanded]="menuOpen()"
        (keydown.escape)="menuOpen.set(false)"
      >
        Visibilité
      </button>
      <cw-dialog-footer>
        <button cwButton variant="outline" cwDialogClose>Annuler</button>
        <button cwButton (click)="open.set(false)">Renommer</button>
      </cw-dialog-footer>
    </cw-dialog>
  `,
})
class Host {
  // #region Properties
  /**
   * Property open
   * @readonly
   *
   * @description
   * Whether the dialog is open.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly open: WritableSignal<boolean> = signal(false);

  /**
   * Property pending
   * @readonly
   *
   * @description
   * Whether a submission is pending.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly pending: WritableSignal<boolean> = signal(false);

  /**
   * Property overlayCloses
   * @readonly
   *
   * @description
   * Whether backdrop clicks close the dialog.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly overlayCloses: WritableSignal<boolean> = signal(true);

  /**
   * Property showClose
   * @readonly
   *
   * @description
   * Whether the close button is visible.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly showClose: WritableSignal<boolean> = signal(true);

  /**
   * Property menuOpen
   * @readonly
   *
   * @description
   * Whether the nested menu is open.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly menuOpen: WritableSignal<boolean> = signal(false);

  /**
   * Property reasons
   * @readonly
   *
   * @description
   * Recorded dialog close reasons.
   *
   * @type {CwDialogCloseReason[]}
   */
  public readonly reasons: CwDialogCloseReason[] = [];
  // #endregion
}

/**
 * Function dialog
 *
 * @description
 * Returns the currently open dialog.
 *
 * @returns {HTMLElement | null} Open dialog element, or null when absent.
 */
function dialog(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

// The backdrop has no role: it is the element just before the window's overlay wrapper.
/**
 * Function backdrop
 *
 * @description
 * Finds the modal backdrop.
 *
 * @returns {HTMLElement} Backdrop element preceding the dialog overlay.
 */
function backdrop(): HTMLElement {
  const wrapper: HTMLElement | null | undefined = dialog()?.parentElement?.parentElement;
  const found: Element | null | undefined = wrapper?.previousElementSibling;
  if (!(found instanceof HTMLElement)) throw new Error('No backdrop');
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a button by accessible name or text.
 *
 * @param {ParentNode} scope - Container holding candidate buttons.
 * @param {string} name - Expected accessible name or text.
 *
 * @returns {HTMLButtonElement} Matching button element.
 */
function button(scope: ParentNode, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    scope.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event.
 *
 * @param {EventTarget} target - Element receiving the keyboard event.
 * @param {string} key - Keyboard key to dispatch.
 */
function press(target: EventTarget, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CwDialog', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let trigger: HTMLButtonElement;

  /**
   * Function openFromTrigger
   *
   * @description
   * Opens the dialog using its trigger.
   *
   * @returns {Promise<HTMLElement>} Dialog element after the trigger opens it.
   */
  async function openFromTrigger(): Promise<HTMLElement> {
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    const found: HTMLElement | null = dialog();
    if (!found) throw new Error('Dialog not open');
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.componentInstance;
    trigger = button(fixture.nativeElement as HTMLElement, 'Renommer');
  });

  it('renders nothing while closed and opens a named, described modal from its trigger', async () => {
    expect(dialog()).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    const window: HTMLElement = await openFromTrigger();

    expect(host.open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(window.getAttribute('aria-modal')).toBe('true');
    const title: HTMLElement | null = document.getElementById(
      window.getAttribute('aria-labelledby') ?? '',
    );
    const description: HTMLElement | null = document.getElementById(
      window.getAttribute('aria-describedby') ?? '',
    );
    expect(title?.textContent.trim()).toBe('Renommer la liste');
    expect(description?.textContent).toContain('espace Produit');
  });

  // jsdom has no layout, so the CDK focus trap finds no tabbable element and falls back to the
  // window itself; the first field is checked in the browser (story `Simple`).
  it('moves the focus inside the window on open', async () => {
    const window: HTMLElement = await openFromTrigger();

    expect(window.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape with the reason escape and gives the focus back to the trigger', async () => {
    const window: HTMLElement = await openFromTrigger();

    press(window.querySelector('input') ?? window, 'Escape');
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(host.open()).toBe(false);
    expect(host.reasons).toEqual(['escape']);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes an open popup inside it before itself on Escape', async () => {
    const window: HTMLElement = await openFromTrigger();
    host.menuOpen.set(true);
    await fixture.whenStable();
    const visibility: HTMLButtonElement = button(window, 'Visibilité');

    press(visibility, 'Escape');
    await fixture.whenStable();
    expect(dialog()).not.toBeNull();
    expect(host.menuOpen()).toBe(false);

    press(visibility, 'Escape');
    await fixture.whenStable();
    expect(dialog()).toBeNull();
  });

  it('closes on a backdrop click unless closeOnOverlayClick is false', async () => {
    host.overlayCloses.set(false);
    await openFromTrigger();
    backdrop().click();
    await fixture.whenStable();
    expect(dialog()).not.toBeNull();

    host.overlayCloses.set(true);
    await fixture.whenStable();
    backdrop().click();
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(host.reasons).toEqual(['overlay']);
  });

  it('closes from the close button and from cwDialogClose with the reason close', async () => {
    let window: HTMLElement = await openFromTrigger();
    button(window, 'Fermer').click();
    await fixture.whenStable();
    expect(dialog()).toBeNull();

    window = await openFromTrigger();
    button(window, 'Annuler').click();
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(host.reasons).toEqual(['close', 'close']);
  });

  it('closes with the reason action when the consumer sets open to false', async () => {
    const window: HTMLElement = await openFromTrigger();

    button(window, 'Renommer').click();
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(host.reasons).toEqual(['action']);
  });

  it('ignores Escape, the backdrop and the close buttons while pending', async () => {
    const window: HTMLElement = await openFromTrigger();
    host.pending.set(true);
    await fixture.whenStable();
    const panel: Element | null = window.firstElementChild;

    press(window.querySelector('input') ?? window, 'Escape');
    backdrop().click();
    button(window, 'Annuler').click();
    button(window, 'Fermer').click();
    await fixture.whenStable();

    expect(dialog()).not.toBeNull();
    expect(panel?.getAttribute('aria-busy')).toBe('true');
    expect(button(window, 'Annuler').getAttribute('aria-disabled')).toBe('true');
    expect(host.reasons).toEqual([]);
  });

  it('hides the close button when showClose is false', async () => {
    host.showClose.set(false);
    const window: HTMLElement = await openFromTrigger();

    expect(() => button(window, 'Fermer')).toThrow();
  });
});
