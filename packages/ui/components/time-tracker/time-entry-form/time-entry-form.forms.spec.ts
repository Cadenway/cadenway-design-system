import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { disabled, FormField, form, type FieldTree } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';

import type { CwTimeEntryDraft } from '../time-tracker.types';
import { CwTimeEntryForm } from './time-entry-form.component';

/**
 * Function draft
 *
 * @description
 * Creates a time-entry draft for form compatibility tests.
 *
 * @returns {CwTimeEntryDraft} Draft with a known note and date.
 */
function draft(): CwTimeEntryDraft {
  return { duration: 60_000, date: new Date(2026, 10, 12), note: 'Initial', billable: true };
}

/**
 * Component TemplateHost
 *
 * @description
 * Binds a time-entry form through template-driven forms.
 */
@Component({
  imports: [CwTimeEntryForm, FormsModule],
  template: `<cw-time-entry-form [(ngModel)]="entry" />`,
})
class TemplateHost {
  // #region Properties
  /**
   * Property entry
   *
   * @description
   * Draft synchronized with ngModel.
   *
   * @type {CwTimeEntryDraft}
   */
  public entry: CwTimeEntryDraft = draft();
  // #endregion
}

/**
 * Component ReactiveHost
 *
 * @description
 * Binds a time-entry form through a reactive control.
 */
@Component({
  imports: [CwTimeEntryForm, ReactiveFormsModule],
  template: `<cw-time-entry-form [formControl]="entry" />`,
})
class ReactiveHost {
  // #region Properties
  /**
   * Property entry
   *
   * @description
   * Reactive draft control.
   *
   * @type {FormControl<CwTimeEntryDraft>}
   * @readonly
   */
  public readonly entry: FormControl<CwTimeEntryDraft> = new FormControl<CwTimeEntryDraft>(
    draft(),
    {
      nonNullable: true,
    },
  );
  // #endregion
}

/**
 * Component SignalHost
 *
 * @description
 * Binds a time-entry form through Signal Forms.
 */
@Component({
  imports: [CwTimeEntryForm, FormField],
  template: `<cw-time-entry-form [formField]="entry" />`,
})
class SignalHost {
  // #region Properties
  /**
   * Property model
   *
   * @description
   * Writable draft synchronized with the field.
   *
   * @type {WritableSignal<CwTimeEntryDraft>}
   * @readonly
   */
  public readonly model: WritableSignal<CwTimeEntryDraft> = signal<CwTimeEntryDraft>(draft());

  /**
   * Property disabled
   *
   * @description
   * Whether the Signal Forms draft is disabled.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly disabled: WritableSignal<boolean> = signal(false);

  /**
   * Property entry
   *
   * @description
   * Signal Forms tree for the draft.
   *
   * @type {FieldTree<CwTimeEntryDraft>}
   * @readonly
   */
  public readonly entry: FieldTree<CwTimeEntryDraft> = form(this.model, (path) => {
    disabled(path, { when: () => this.disabled() });
  });
  // #endregion
}

/**
 * Function note
 *
 * @description
 * Finds the draft note input in a fixture.
 *
 * @param {HTMLElement} host - Fixture containing the form.
 * @returns {HTMLInputElement} Note input.
 */
function note(host: HTMLElement): HTMLInputElement {
  const element: HTMLInputElement | null = host.querySelector(
    'input[placeholder="Note (facultatif)"]',
  );
  if (!element) throw new Error('Note input missing');
  return element;
}

describe('CwTimeEntryForm Angular form compatibility', () => {
  it('synchronizes ngModel and marks the control touched when the note loses focus', async () => {
    const fixture: ComponentFixture<TemplateHost> = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const input: HTMLInputElement = note(fixture.nativeElement as HTMLElement);
    const model: NgModel = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);
    expect(input.value).toBe('Initial');
    input.value = 'Updated';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.entry.note).toBe('Updated');
    expect(model.touched).toBe(true);
    model.control.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    fixture.destroy();
  });

  it('synchronizes reactive values, touched and disabled states', async () => {
    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = note(fixture.nativeElement as HTMLElement);
    input.value = 'Updated';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.entry.value.note).toBe('Updated');
    expect(fixture.componentInstance.entry.touched).toBe(true);
    fixture.componentInstance.entry.markAsUntouched();
    const checkbox: HTMLButtonElement | null = (fixture.nativeElement as HTMLElement).querySelector(
      'cw-checkbox button',
    );
    expect(checkbox).not.toBeNull();
    checkbox?.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.entry.touched).toBe(true);
    const component: CwTimeEntryForm = fixture.debugElement.query(By.directive(CwTimeEntryForm))
      .componentInstance as CwTimeEntryForm;
    let cancelled: boolean = false;
    component.cancel.subscribe(() => {
      cancelled = true;
    });
    fixture.componentInstance.entry.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    (fixture.nativeElement as HTMLElement)
      .querySelector('cw-time-entry-form')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(cancelled).toBe(false);
    fixture.destroy();
  });

  it('synchronizes Signal Forms values, touched and disabled states', async () => {
    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = note(fixture.nativeElement as HTMLElement);
    input.value = 'Updated';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().note).toBe('Updated');
    expect(fixture.componentInstance.entry().touched()).toBe(true);
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    const cancel: HTMLButtonElement | null =
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
        (button) => button.textContent.trim() === 'Annuler',
      ) ?? null;
    expect(cancel?.disabled).toBe(true);
    fixture.destroy();
  });
});
