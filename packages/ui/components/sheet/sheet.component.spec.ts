import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwSheetBody } from './sheet-body/sheet-body.component';
import { CwSheetClose } from './sheet-close/sheet-close.directive';
import { CwSheetDescription } from './sheet-description/sheet-description.directive';
import { CwSheetFooter } from './sheet-footer/sheet-footer.component';
import { CwSheetHeader } from './sheet-header/sheet-header.component';
import { CwSheetTitle } from './sheet-title/sheet-title.directive';
import { CwSheetTrigger } from './sheet-trigger/sheet-trigger.directive';
import { CwSheet } from './sheet.component';
import { provideCwSheetLabels } from './sheet.providers';
import type { CwSheetCloseReason, CwSheetSide } from './sheet.types';

/**
 * Component Host
 *
 * @description
 * The task detail of the Sheet sheet: a trigger, a header with the identifier, the title and a
 * description, a body and a footer with a « Fermer » button.
 */
@Component({
  imports: [
    CwButton,
    CwSheet,
    CwSheetBody,
    CwSheetClose,
    CwSheetDescription,
    CwSheetFooter,
    CwSheetHeader,
    CwSheetTitle,
    CwSheetTrigger,
  ],
  template: `
    <button cwButton variant="outline" [cwSheetTrigger]="detail">Ouvrir CAD-482</button>
    <cw-sheet
      #detail
      [(open)]="open"
      [side]="side()"
      [closeOnOverlayClick]="overlayCloses()"
      (closed)="reasons.push($event)"
    >
      <cw-sheet-header>
        <span>CAD-482</span>
        <h2 cwSheetTitle>Corriger l'export CSV des tâches</h2>
        <p cwSheetDescription>Dans Produit › Sprint 14</p>
      </cw-sheet-header>
      <cw-sheet-body><p>Description de la tâche.</p></cw-sheet-body>
      <cw-sheet-footer>
        <button cwButton variant="outline" cwSheetClose>Fermer le détail</button>
      </cw-sheet-footer>
    </cw-sheet>
  `,
})
class Host {
  // #region Properties
  /**
   * Property open
   *
   * @description
   * Two-way open state bound to the sheet.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly open: WritableSignal<boolean> = signal(false);

  /**
   * Property side
   *
   * @description
   * Edge the sheet is docked to.
   *
   * @type {WritableSignal<CwSheetSide>}
   * @readonly
   */
  public readonly side: WritableSignal<CwSheetSide> = signal<CwSheetSide>('right');

  /**
   * Property overlayCloses
   *
   * @description
   * Whether a backdrop click closes the sheet.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly overlayCloses: WritableSignal<boolean> = signal(true);

  /**
   * Property reasons
   *
   * @description
   * Reasons emitted by `closed`, in order.
   *
   * @type {CwSheetCloseReason[]}
   * @readonly
   */
  public readonly reasons: CwSheetCloseReason[] = [];
  // #endregion
}

/**
 * Function sheet
 *
 * @description
 * Finds the open sheet window.
 *
 * @returns {HTMLElement | null} The dialog element, or null when the sheet is closed.
 */
function sheet(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="dialog"]');
}

/**
 * Function backdrop
 *
 * @description
 * Finds the backdrop, the element just before the sheet's overlay wrapper.
 *
 * @returns {HTMLElement} Backdrop element.
 *
 * @throws {Error} When the sheet has no backdrop.
 */
function backdrop(): HTMLElement {
  const wrapper: HTMLElement | null | undefined = sheet()?.parentElement?.parentElement;
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
 *
 * @throws {Error} When no button has that name.
 */
function button(scope: ParentNode, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    scope.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwSheet', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let trigger: HTMLButtonElement;

  /**
   * Function openFromTrigger
   *
   * @description
   * Opens the sheet with its trigger.
   *
   * @returns {Promise<HTMLElement>} The open sheet window.
   */
  async function openFromTrigger(): Promise<HTMLElement> {
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    const found: HTMLElement | null = sheet();
    if (!found) throw new Error('Sheet not open');
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.componentInstance;
    trigger = button(fixture.nativeElement as HTMLElement, 'Ouvrir CAD-482');
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('opens a named, described modal docked to the right from its trigger', async () => {
    expect(sheet()).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    const window: HTMLElement = await openFromTrigger();

    expect(host.open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(window.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(window.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(
      "Corriger l'export CSV des tâches",
    );
    expect(
      document.getElementById(window.getAttribute('aria-describedby') ?? '')?.textContent,
    ).toBe('Dans Produit › Sprint 14');
    expect(window.querySelector('[data-side]')?.getAttribute('data-side')).toBe('right');
    expect(window.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and gives the focus back to the trigger', async () => {
    const window: HTMLElement = await openFromTrigger();
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();

    expect(sheet()).toBeNull();
    expect(host.open()).toBe(false);
    expect(host.reasons).toEqual(['escape']);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes from the close button and from cwSheetClose with the reason close', async () => {
    let window: HTMLElement = await openFromTrigger();
    button(window, 'Fermer').click();
    await fixture.whenStable();
    expect(sheet()).toBeNull();

    window = await openFromTrigger();
    button(window, 'Fermer le détail').click();
    await fixture.whenStable();

    expect(sheet()).toBeNull();
    expect(host.reasons).toEqual(['close', 'close']);
  });

  it('closes on a backdrop click unless closeOnOverlayClick is false', async () => {
    host.overlayCloses.set(false);
    await openFromTrigger();
    backdrop().click();
    await fixture.whenStable();
    expect(sheet()).not.toBeNull();

    host.overlayCloses.set(true);
    await fixture.whenStable();
    backdrop().click();
    await fixture.whenStable();

    expect(sheet()).toBeNull();
    expect(host.reasons).toEqual(['overlay']);
  });

  it('docks to the chosen side and closes with the reason action through [(open)]', async () => {
    host.side.set('bottom');
    host.open.set(true);
    await fixture.whenStable();
    expect(sheet()?.querySelector('[data-side]')?.getAttribute('data-side')).toBe('bottom');

    host.open.set(false);
    await fixture.whenStable();

    expect(sheet()).toBeNull();
    expect(host.reasons).toEqual(['action']);
  });

  it('opens again when reopened during its exit animation', async () => {
    const window: HTMLElement = await openFromTrigger();
    const panel: HTMLElement | null = window.querySelector<HTMLElement>('[data-side]');
    if (!panel) throw new Error('No panel');
    // The test DOM runs no animation: an inline name makes the sheet wait for `animationend`.
    panel.style.animationName = 'fade-out';
    host.open.set(false);
    await fixture.whenStable();
    host.open.set(true);
    await fixture.whenStable();
    panel.dispatchEvent(new Event('animationend'));
    await fixture.whenStable();

    expect(host.reasons).toEqual(['action']);
    expect(host.open()).toBe(true);
    expect(sheet()).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('provideCwSheetLabels', () => {
  it('names the close button of the sheets below it', async () => {
    TestBed.configureTestingModule({ providers: [provideCwSheetLabels({ close: 'Close' })] });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    button(fixture.nativeElement as HTMLElement, 'Ouvrir CAD-482').click();
    await fixture.whenStable();
    const window: HTMLElement | null = sheet();
    if (!window) throw new Error('Sheet not open');

    expect(button(window, 'Close')).toBeTruthy();
    fixture.destroy();
  });
});
