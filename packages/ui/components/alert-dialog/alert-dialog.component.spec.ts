import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { CwButton } from '@cadenway/ui/components/button';

import { CwAlertDialogAction } from './alert-dialog-action/alert-dialog-action.directive';
import { CwAlertDialogCancel } from './alert-dialog-cancel/alert-dialog-cancel.directive';
import { CwAlertDialogDescription } from './alert-dialog-description/alert-dialog-description.directive';
import { CwAlertDialogTitle } from './alert-dialog-title/alert-dialog-title.directive';
import { CwAlertDialogTrigger } from './alert-dialog-trigger/alert-dialog-trigger.directive';
import { CwAlertDialog } from './alert-dialog.component';
import type { CwAlertDialogCancelReason } from './alert-dialog.types';

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
  readonly open = signal(false);
  readonly pending = signal(false);
  readonly confirmText = signal('');
  readonly items = signal<string[]>([]);
  readonly cancels: CwAlertDialogCancelReason[] = [];
  confirms = 0;
  keepOpen = false;

  onConfirm(): void {
    this.confirms += 1;
    if (this.keepOpen) this.pending.set(true);
  }
}

function alertDialog(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="alertdialog"]');
}

// The backdrop has no role: it is the element just before the dialog's overlay wrapper.
function backdrop(): HTMLElement {
  const found = alertDialog()?.parentElement?.parentElement?.previousElementSibling;
  if (!(found instanceof HTMLElement)) throw new Error('No backdrop');
  return found;
}

function button(scope: ParentNode, name: string): HTMLButtonElement {
  const found = Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).find(
    (element) => element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

function textbox(scope: HTMLElement): HTMLInputElement {
  const found = scope.querySelector<HTMLInputElement>('input[type="text"]');
  if (!found) throw new Error('No confirmation field');
  return found;
}

function type(field: HTMLInputElement, text: string): void {
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

function press(target: EventTarget, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CwAlertDialog', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let trigger: HTMLButtonElement;

  async function openFromTrigger(): Promise<HTMLElement> {
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    const found = alertDialog();
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

    const dialog = await openFromTrigger();

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = document.getElementById(dialog.getAttribute('aria-labelledby') ?? '');
    const description = document.getElementById(dialog.getAttribute('aria-describedby') ?? '');
    expect(title?.textContent.trim()).toBe("Supprimer l'espace « Marketing » ?");
    expect(description?.textContent).toContain('32 tâches');
    expect(document.activeElement).toBe(button(dialog, 'Annuler'));
  });

  it('cancels from Annuler and from Escape, then gives the focus back to the trigger', async () => {
    let dialog = await openFromTrigger();
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
    const dialog = await openFromTrigger();

    button(dialog, "Supprimer l'espace").click();
    await fixture.whenStable();

    expect(host.confirms).toBe(1);
    expect(alertDialog()).toBeNull();
    expect(host.open()).toBe(false);
  });

  it('stays open while the action is pending and blocks every choice until the consumer closes it', async () => {
    host.keepOpen = true;
    const dialog = await openFromTrigger();

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
    const dialog = await openFromTrigger();
    const field = textbox(dialog);
    const action = button(dialog, "Supprimer l'espace");

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
    const dialog = await openFromTrigger();

    const lines = Array.from(dialog.querySelectorAll('li'), (item) => item.textContent.trim());
    expect(lines).toHaveLength(9);
    expect(lines[0]).toBe('CAD-400');
    expect(lines[8]).toBe('+ 2 autres');
  });

  it('lists nothing for a single item, already named in the title', async () => {
    host.items.set(['CAD-400']);
    const dialog = await openFromTrigger();

    expect(dialog.querySelector('li')).toBeNull();
  });
});
