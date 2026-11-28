import { DEFAULT_DIALOG_CONFIG } from '@angular/cdk/dialog';
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
import { provideCwDialogLabels } from './dialog.providers';
import type { CwDialogCloseReason, CwDialogSize } from './dialog.types';

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
      [closeOnNavigation]="navigationCloses()"
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
   * Property navigationCloses
   * @readonly
   *
   * @description
   * Whether a browser history navigation closes the dialog; unset by default.
   *
   * @type {WritableSignal<boolean | undefined>}
   */
  public readonly navigationCloses: WritableSignal<boolean | undefined> = signal<
    boolean | undefined
  >(undefined);

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

  it('closes on a browser Back or Forward without input or application config, with the reason action', async () => {
    await openFromTrigger();

    window.dispatchEvent(new PopStateEvent('popstate'));
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(host.open()).toBe(false);
    expect(host.reasons).toEqual(['action']);
  });

  it('stays open on a browser Back or Forward when closeOnNavigation is false', async () => {
    host.navigationCloses.set(false);
    await openFromTrigger();

    window.dispatchEvent(new PopStateEvent('popstate'));
    await fixture.whenStable();

    expect(dialog()).not.toBeNull();
    expect(host.open()).toBe(true);
    expect(host.reasons).toEqual([]);
  });

  it('forgets its trigger after a navigation close, so a reopening through [(open)] does not focus it', async () => {
    await openFromTrigger();
    window.dispatchEvent(new PopStateEvent('popstate'));
    await fixture.whenStable();
    const elsewhere: HTMLButtonElement = document.createElement('button');
    elsewhere.textContent = 'Ailleurs';
    document.body.append(elsewhere);
    elsewhere.focus();

    host.open.set(true);
    await fixture.whenStable();
    const reopened: HTMLElement | null = dialog();
    if (!reopened) throw new Error('Dialog not reopened');
    press(reopened.querySelector('input') ?? reopened, 'Escape');
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(elsewhere);
    elsewhere.remove();
  });

  it('hides the close button when showClose is false', async () => {
    host.showClose.set(false);
    const window: HTMLElement = await openFromTrigger();

    expect(() => button(window, 'Fermer')).toThrow();
  });
});

/**
 * Component SizedHost
 *
 * @description
 * Hosts an open dialog whose size the test changes.
 */
@Component({
  imports: [CwDialog, CwDialogHeader, CwDialogTitle],
  template: `
    <cw-dialog [open]="true" [size]="size()">
      <cw-dialog-header>
        <h2 cwDialogTitle>Statuts de l'espace</h2>
      </cw-dialog-header>
    </cw-dialog>
  `,
})
class SizedHost {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Size given to the dialog.
   *
   * @type {WritableSignal<CwDialogSize>}
   */
  public readonly size: WritableSignal<CwDialogSize> = signal<CwDialogSize>('default');
  // #endregion
}

describe('CwDialog size', () => {
  let fixture: ComponentFixture<SizedHost>;

  /**
   * Function panel
   *
   * @description
   * Returns the panel of the open dialog, which carries the size.
   *
   * @returns {HTMLElement} Panel inside the dialog window.
   */
  function panel(): HTMLElement {
    const found: Element | null | undefined = dialog()?.firstElementChild;
    if (!(found instanceof HTMLElement)) throw new Error('Dialog not open');
    return found;
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(SizedHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('is 448 px wide by default', () => {
    expect(panel().dataset['size']).toBe('default');
    expect(panel().classList).toContain('max-w-md');
  });

  it('is 512 px wide with size md, between default and lg', async () => {
    fixture.componentInstance.size.set('md');
    await fixture.whenStable();

    expect(panel().dataset['size']).toBe('md');
    expect(panel().classList).toContain('max-w-lg');
    expect(panel().classList).not.toContain('max-w-md');
    expect(panel().classList).not.toContain('max-w-2xl');
  });

  it('is 896 px wide with size xl, between lg and full', async () => {
    fixture.componentInstance.size.set('xl');
    await fixture.whenStable();

    expect(panel().dataset['size']).toBe('xl');
    expect(panel().classList).toContain('max-w-4xl');
    expect(panel().classList).not.toContain('max-w-2xl');
    expect(panel().classList).toContain('max-md:max-w-none');
  });

  it('is 1024 px wide and 88 % of the viewport high with size tall', async () => {
    fixture.componentInstance.size.set('tall');
    await fixture.whenStable();

    expect(panel().dataset['size']).toBe('tall');
    expect(panel().classList).toContain('max-w-5xl');
    expect(panel().classList).toContain('h-[88dvh]');
    expect(panel().classList).toContain('max-md:h-dvh');
  });

  it('keeps 672 px for size lg and fills the screen under 768 px at every size', async () => {
    fixture.componentInstance.size.set('lg');
    await fixture.whenStable();
    expect(panel().classList).toContain('max-w-2xl');

    fixture.componentInstance.size.set('md');
    await fixture.whenStable();
    expect(panel().classList).toContain('max-md:max-w-none');
  });
});

/**
 * Component PlacedHost
 *
 * @description
 * Hosts the mockup's task creation dialog: pinned near the top, unpadded, with a bar header.
 */
@Component({
  imports: [CwDialog, CwDialogHeader, CwDialogTitle],
  template: `
    <cw-dialog [open]="true" size="xl" placement="top" padding="none" scrollable>
      <cw-dialog-header variant="bar" class="px-5">
        <h2 cwDialogTitle>Créer une tâche</h2>
      </cw-dialog-header>
      <p>Titre de la tâche</p>
    </cw-dialog>
  `,
})
class PlacedHost {}

describe('CwDialog placement, padding and bar header', () => {
  let fixture: ComponentFixture<PlacedHost>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(PlacedHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('pins the window 8vh from the top of a wide screen', () => {
    const pane: HTMLElement | null | undefined =
      dialog()?.closest<HTMLElement>('.cdk-overlay-pane');

    expect(pane?.style.marginTop).toBe('8vh');
  });

  it('leaves the body unpadded and lays the header out as a bar over a rule', () => {
    const window: HTMLElement | null = dialog();
    const header: HTMLElement | null | undefined = window?.querySelector('cw-dialog-header');
    const body: Element | null | undefined = header?.nextElementSibling;

    expect(header?.classList).toContain('border-b');
    expect(header?.classList).toContain('flex-wrap');
    expect(header?.classList).toContain('px-5');
    expect(body?.className).not.toMatch(/(^|\s)(px|py|p)-\d/);
  });
});

/**
 * Component ScreenHost
 *
 * @description
 * Hosts an edge-to-edge dialog opened from a trigger, with the default close behaviour.
 */
@Component({
  imports: [CwButton, CwDialog, CwDialogClose, CwDialogTrigger],
  template: `
    <button cwButton variant="outline" [cwDialogTrigger]="setup">Set up</button>
    <cw-dialog #setup [size]="size()" [scrollable]="scrollable()" (closed)="reasons.push($event)">
      <h1 [id]="setup.titleId">Welcome to Atelier Nord</h1>
      <input aria-label="Space name" value="Product" />
      <button cwButton cwDialogClose>Set up later</button>
    </cw-dialog>
  `,
})
class ScreenHost {
  // #region Properties
  /**
   * Property size
   * @readonly
   *
   * @description
   * Size given to the dialog, `screen` unless a test changes it.
   *
   * @type {WritableSignal<CwDialogSize>}
   */
  public readonly size: WritableSignal<CwDialogSize> = signal<CwDialogSize>('screen');

  /**
   * Property scrollable
   * @readonly
   *
   * @description
   * Whether the dialog asks for a scrollable body.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly scrollable: WritableSignal<boolean> = signal(false);

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

describe('CwDialog size screen', () => {
  let fixture: ComponentFixture<ScreenHost>;
  let trigger: HTMLButtonElement;

  /**
   * Function openScreen
   *
   * @description
   * Opens the edge-to-edge dialog from its trigger.
   *
   * @returns {Promise<HTMLElement>} Dialog element after the trigger opens it.
   */
  async function openScreen(): Promise<HTMLElement> {
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    const found: HTMLElement | null = dialog();
    if (!found) throw new Error('Dialog not open');
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreenHost);
    fixture.autoDetectChanges();
    trigger = button(fixture.nativeElement as HTMLElement, 'Set up');
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('covers the viewport on the canvas surface without window frame', async () => {
    const window: HTMLElement = await openScreen();
    const panel: Element | null = window.firstElementChild;

    expect(window.getAttribute('aria-modal')).toBe('true');
    expect(panel?.getAttribute('data-size')).toBe('screen');
    expect(panel?.classList).toContain('size-full');
    expect(panel?.classList).toContain('bg-canvas');
    expect(panel?.classList).not.toContain('rounded-xl');
    expect(panel?.classList).not.toContain('border');
    expect(panel?.classList).not.toContain('p-6');
  });

  // The pane is `100%` of the overlay container, not `100vw`, which would include the scrollbar the
  // scroll block keeps.
  it('fills the overlay container and hides the backdrop', async () => {
    const window: HTMLElement = await openScreen();

    expect(window.parentElement?.style.width).toBe('100%');
    expect(window.parentElement?.style.height).toBe('100%');
    expect(backdrop().hidden).toBe(true);
  });

  it('makes the body a focusable scroll region by default', async () => {
    const window: HTMLElement = await openScreen();
    const body: Element | null | undefined = window
      .querySelector('h1')
      ?.closest('[data-size] > div');

    expect(body?.getAttribute('tabindex')).toBe('0');
    expect(body?.classList).toContain('overflow-y-auto');
  });

  it('keeps the body unpadded and makes it a focusable scroll region when scrollable', async () => {
    fixture.componentInstance.scrollable.set(true);
    const window: HTMLElement = await openScreen();
    const body: Element | null | undefined = window
      .querySelector('h1')
      ?.closest('[data-size] > div');

    expect(body?.getAttribute('tabindex')).toBe('0');
    expect(body?.classList).not.toContain('px-6');
  });

  it('becomes a window over a clickable backdrop when the size changes to default while open', async () => {
    await openScreen();

    fixture.componentInstance.size.set('default');
    await fixture.whenStable();

    const window: HTMLElement | null = dialog();
    expect(window?.firstElementChild?.getAttribute('data-size')).toBe('default');
    expect(window?.parentElement?.style.width).toBe('');
    expect(backdrop().hidden).toBe(false);
    expect(fixture.componentInstance.reasons).toEqual([]);

    backdrop().click();
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(fixture.componentInstance.reasons).toEqual(['overlay']);
  });

  it('covers the screen without backdrop when the size changes to screen while open', async () => {
    fixture.componentInstance.size.set('default');
    await openScreen();
    expect(backdrop().hidden).toBe(false);

    fixture.componentInstance.size.set('screen');
    await fixture.whenStable();

    const window: HTMLElement | null = dialog();
    expect(window?.firstElementChild?.getAttribute('data-size')).toBe('screen');
    expect(window?.parentElement?.style.width).toBe('100%');
    expect(backdrop().hidden).toBe(true);
    expect(window?.contains(document.activeElement)).toBe(true);
    expect(fixture.componentInstance.reasons).toEqual([]);
  });

  it('is named by the consumer heading and keeps the focus inside', async () => {
    const window: HTMLElement = await openScreen();
    const title: HTMLElement | null = document.getElementById(
      window.getAttribute('aria-labelledby') ?? '',
    );

    expect(title?.textContent.trim()).toBe('Welcome to Atelier Nord');
    expect(window.contains(document.activeElement)).toBe(true);
  });

  it('keeps the Escape, close button and cwDialogClose behaviour of the other sizes', async () => {
    let window: HTMLElement = await openScreen();
    press(window.querySelector('input') ?? window, 'Escape');
    await fixture.whenStable();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger);

    window = await openScreen();
    button(window, 'Fermer').click();
    await fixture.whenStable();
    expect(dialog()).toBeNull();

    window = await openScreen();
    button(window, 'Set up later').click();
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(fixture.componentInstance.reasons).toEqual(['escape', 'close', 'close']);
  });
});

describe('CwDialog under DEFAULT_DIALOG_CONFIG', () => {
  /**
   * Function openUnder
   *
   * @description
   * Opens the host dialog from its trigger under an application dialog configuration.
   *
   * @param {boolean | undefined} navigationCloses - Value bound to `closeOnNavigation`.
   *
   * @returns {Promise<ComponentFixture<Host>>} Fixture with the dialog open.
   */
  async function openUnder(navigationCloses: boolean | undefined): Promise<ComponentFixture<Host>> {
    TestBed.configureTestingModule({
      providers: [{ provide: DEFAULT_DIALOG_CONFIG, useValue: { closeOnNavigation: false } }],
    });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.componentInstance.navigationCloses.set(navigationCloses);
    fixture.autoDetectChanges();
    button(fixture.nativeElement as HTMLElement, 'Renommer').click();
    await fixture.whenStable();
    if (!dialog()) throw new Error('Dialog not open');
    return fixture;
  }

  it('follows the application and stays open on a browser Back or Forward without the input', async () => {
    const fixture: ComponentFixture<Host> = await openUnder(undefined);

    window.dispatchEvent(new PopStateEvent('popstate'));
    await fixture.whenStable();

    expect(dialog()).not.toBeNull();
    expect(fixture.componentInstance.open()).toBe(true);
    fixture.destroy();
  });

  it('closes on a browser Back or Forward when the input is explicitly true', async () => {
    const fixture: ComponentFixture<Host> = await openUnder(true);

    window.dispatchEvent(new PopStateEvent('popstate'));
    await fixture.whenStable();

    expect(dialog()).toBeNull();
    expect(fixture.componentInstance.reasons).toEqual(['action']);
    fixture.destroy();
  });
});

describe('provideCwDialogLabels', () => {
  it('names the close button of the dialogs below it', async () => {
    TestBed.configureTestingModule({ providers: [provideCwDialogLabels({ close: 'Close' })] });
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    button(fixture.nativeElement as HTMLElement, 'Renommer').click();
    await fixture.whenStable();
    const window: HTMLElement | null = dialog();
    if (!window) throw new Error('Dialog not open');

    expect(button(window, 'Close')).toBeTruthy();
    expect(() => button(window, 'Fermer')).toThrow();
    fixture.destroy();
  });
});
