import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwAlertDialogAction } from './alert-dialog-action/alert-dialog-action.directive';
import { CwAlertDialogCancel } from './alert-dialog-cancel/alert-dialog-cancel.directive';
import { CwAlertDialogDescription } from './alert-dialog-description/alert-dialog-description.directive';
import { CwAlertDialogTitle } from './alert-dialog-title/alert-dialog-title.directive';
import { CwAlertDialogTrigger } from './alert-dialog-trigger/alert-dialog-trigger.directive';
import { CwAlertDialog } from './alert-dialog.component';
import type { CwAlertDialogCancelReason } from './alert-dialog.types';

/**
 * Component Host
 *
 * @description
 * Exercises confirmation, cancellation and pending states.
 */
@Component({
  imports: [
    CwAlertDialog,
    CwAlertDialogAction,
    CwAlertDialogCancel,
    CwAlertDialogDescription,
    CwAlertDialogTitle,
    CwAlertDialogTrigger,
    CwButton,
  ],
  template: `
    <button cwButton variant="outline" [cwAlertDialogTrigger]="remove">Supprimer l'espace</button>
    <cw-alert-dialog
      #remove
      variant="destructive"
      [(open)]="open"
      [pending]="pending()"
      [confirmText]="confirmText()"
      [items]="items()"
      (confirm)="onConfirm()"
      (cancel)="cancels.push($event)"
    >
      <h2 cwAlertDialogTitle>Supprimer l'espace « Marketing » ?</h2>
      <p cwAlertDialogDescription>Ses 2 listes et 32 tâches seront supprimées définitivement.</p>
      <button cwButton variant="outline" cwAlertDialogCancel>Annuler</button>
      <button cwButton variant="destructive" cwAlertDialogAction>Supprimer l'espace</button>
    </cw-alert-dialog>
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
   * Whether the action is pending.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly pending: WritableSignal<boolean> = signal(false);

  /**
   * Property confirmText
   * @readonly
   *
   * @description
   * Text required for confirmation.
   *
   * @type {WritableSignal<string>}
   */
  public readonly confirmText: WritableSignal<string> = signal('');

  /**
   * Property items
   * @readonly
   *
   * @description
   * Items affected by the action.
   *
   * @type {WritableSignal<string[]>}
   */
  public readonly items: WritableSignal<string[]> = signal<string[]>([]);

  /**
   * Property cancels
   * @readonly
   *
   * @description
   * Recorded cancellation reasons.
   *
   * @type {CwAlertDialogCancelReason[]}
   */
  public readonly cancels: CwAlertDialogCancelReason[] = [];

  /**
   * Property confirms
   *
   * @description
   * Number of confirmation requests.
   *
   * @type {number}
   */
  public confirms: number = 0;

  /**
   * Property keepOpen
   *
   * @description
   * Whether confirmation starts a pending action.
   *
   * @type {boolean}
   */
  public keepOpen: boolean = false;
  // #endregion

  // #region Methods
  /**
   * Method onConfirm
   *
   * @description
   * Records confirmation and optionally starts a pending action.
   */
  public onConfirm(): void {
    this.confirms += 1;
    if (this.keepOpen) this.pending.set(true);
  }
  // #endregion
}

/**
 * Function alertDialog
 *
 * @description
 * Returns the currently open alert dialog.
 *
 * @returns {HTMLElement | null} Open alert dialog element, or null when absent.
 */
function alertDialog(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="alertdialog"]');
}

// The backdrop has no role: it is the element just before the dialog's overlay wrapper.
/**
 * Function backdrop
 *
 * @description
 * Finds the modal backdrop.
 *
 * @returns {HTMLElement} Backdrop element preceding the alert dialog overlay.
 */
function backdrop(): HTMLElement {
  const found: Element | null | undefined =
    alertDialog()?.parentElement?.parentElement?.previousElementSibling;
  if (!(found instanceof HTMLElement)) throw new Error('No backdrop');
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a button by its visible text.
 *
 * @param {ParentNode} scope - Container holding candidate buttons.
 * @param {string} name - Expected visible button text.
 *
 * @returns {HTMLButtonElement} Matching button element.
 */
function button(scope: ParentNode, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    scope.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => element.textContent.trim() === name);
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/**
 * Function textbox
 *
 * @description
 * Finds the confirmation text field.
 *
 * @param {HTMLElement} scope - Dialog containing the confirmation input.
 *
 * @returns {HTMLInputElement} Confirmation input element.
 */
function textbox(scope: HTMLElement): HTMLInputElement {
  const found: HTMLInputElement | null =
    scope.querySelector<HTMLInputElement>('input[type="text"]');
  if (!found) throw new Error('No confirmation field');
  return found;
}

/**
 * Function type
 *
 * @description
 * Enters confirmation text and dispatches an input event.
 *
 * @param {HTMLInputElement} field - Confirmation input to update.
 * @param {string} text - Text to enter before dispatching input.
 */
function type(field: HTMLInputElement, text: string): void {
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true }));
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

describe('CwAlertDialog', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let trigger: HTMLButtonElement;

  /**
   * Function openFromTrigger
   *
   * @description
   * Opens the dialog using its trigger.
   *
   * @returns {Promise<HTMLElement>} Alert dialog element after the trigger opens it.
   */
  async function openFromTrigger(): Promise<HTMLElement> {
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    const found: HTMLElement | null = alertDialog();
    if (!found) throw new Error('Alert dialog not open');
    return found;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.componentInstance;
    trigger = button(fixture.nativeElement as HTMLElement, "Supprimer l'espace");
  });

  it('opens a named, described alert dialog with the focus on Annuler', async () => {
    expect(alertDialog()).toBeNull();

    const dialog: HTMLElement = await openFromTrigger();

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title: HTMLElement | null = document.getElementById(
      dialog.getAttribute('aria-labelledby') ?? '',
    );
    const description: HTMLElement | null = document.getElementById(
      dialog.getAttribute('aria-describedby') ?? '',
    );
    expect(title?.textContent.trim()).toBe("Supprimer l'espace « Marketing » ?");
    expect(description?.textContent).toContain('32 tâches');
    expect(document.activeElement).toBe(button(dialog, 'Annuler'));
  });

  it('cancels from Annuler and from Escape, then gives the focus back to the trigger', async () => {
    let dialog: HTMLElement = await openFromTrigger();
    button(dialog, 'Annuler').click();
    await fixture.whenStable();
    expect(alertDialog()).toBeNull();

    dialog = await openFromTrigger();
    press(button(dialog, 'Annuler'), 'Escape');
    await fixture.whenStable();

    expect(alertDialog()).toBeNull();
    expect(host.cancels).toEqual(['button', 'escape']);
    expect(host.confirms).toBe(0);
    expect(document.activeElement).toBe(trigger);
  });

  it('never closes on a backdrop click', async () => {
    await openFromTrigger();

    backdrop().click();
    await fixture.whenStable();

    expect(alertDialog()).not.toBeNull();
    expect(host.cancels).toEqual([]);
  });

  it('emits confirm and closes when the action is activated', async () => {
    const dialog: HTMLElement = await openFromTrigger();

    button(dialog, "Supprimer l'espace").click();
    await fixture.whenStable();

    expect(host.confirms).toBe(1);
    expect(alertDialog()).toBeNull();
    expect(host.open()).toBe(false);
  });

  it('stays open while the action is pending and blocks every choice until the consumer closes it', async () => {
    host.keepOpen = true;
    const dialog: HTMLElement = await openFromTrigger();

    button(dialog, "Supprimer l'espace").click();
    await fixture.whenStable();
    expect(alertDialog()).not.toBeNull();
    expect(dialog.firstElementChild?.getAttribute('aria-busy')).toBe('true');
    expect(button(dialog, 'Annuler').getAttribute('aria-disabled')).toBe('true');

    button(dialog, 'Annuler').click();
    press(button(dialog, 'Annuler'), 'Escape');
    button(dialog, "Supprimer l'espace").click();
    await fixture.whenStable();
    expect(alertDialog()).not.toBeNull();
    expect(host.confirms).toBe(1);
    expect(host.cancels).toEqual([]);

    host.pending.set(false);
    host.open.set(false);
    await fixture.whenStable();
    expect(alertDialog()).toBeNull();
  });

  it('keeps the action disabled until the typed text equals confirmText', async () => {
    host.confirmText.set('Marketing');
    const dialog: HTMLElement = await openFromTrigger();
    const field: HTMLInputElement = textbox(dialog);
    const action: HTMLButtonElement = button(dialog, "Supprimer l'espace");

    expect(document.querySelector(`label[for="${field.id}"]`)?.textContent.trim()).toBe(
      'Pour confirmer, saisissez Marketing',
    );
    expect(document.activeElement).toBe(field);
    expect(action.getAttribute('aria-disabled')).toBe('true');

    type(field, 'Market');
    await fixture.whenStable();
    action.click();
    press(field, 'Enter');
    await fixture.whenStable();
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(host.confirms).toBe(0);

    type(field, 'Marketing');
    await fixture.whenStable();
    expect(action.getAttribute('aria-disabled')).toBeNull();
    expect(field.getAttribute('aria-invalid')).toBeNull();

    press(field, 'Enter');
    await fixture.whenStable();
    expect(host.confirms).toBe(1);
    expect(alertDialog()).toBeNull();
  });

  it('lists the first eight items, then « + n autres »', async () => {
    host.items.set(Array.from({ length: 10 }, (_, index) => `CAD-${String(400 + index)}`));
    const dialog: HTMLElement = await openFromTrigger();

    const lines: string[] = Array.from(dialog.querySelectorAll('li'), (item) =>
      item.textContent.trim(),
    );
    expect(lines).toHaveLength(9);
    expect(lines[0]).toBe('CAD-400');
    expect(lines[8]).toBe('+ 2 autres');
  });

  it('lists nothing for a single item, already named in the title', async () => {
    host.items.set(['CAD-400']);
    const dialog: HTMLElement = await openFromTrigger();

    expect(dialog.querySelector('li')).toBeNull();
  });
});
