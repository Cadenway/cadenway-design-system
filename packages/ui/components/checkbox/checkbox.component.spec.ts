import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwCheckbox } from './checkbox.component';

/**
 * Function box
 *
 * @description
 * Finds a checkbox by its aria-label or associated native label text.
 *
 * @param {HTMLElement} host - Container holding the checkboxes and labels.
 * @param {string} name - Exact accessible name to match.
 *
 * @returns {HTMLButtonElement} First matching checkbox button.
 *
 * @throws {Error} When no checkbox has the requested name.
 */
function box(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('[role="checkbox"]'),
  ).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No checkbox named ${name}`);
  return found;
}

/**
 * Class ModelHost
 * @class ModelHost
 *
 * @description
 * Test host with regular, mixed select-all and disabled checkboxes.
 */
@Component({
  imports: [CwCheckbox],
  template: `
    <cw-checkbox [(checked)]="accepted" ariaLabel="Accepter" />
    <cw-checkbox [(checked)]="all" [(indeterminate)]="partial" ariaLabel="Tout sélectionner" />
    <cw-checkbox id="notify" disabled />
    <label for="notify">Notifier</label>
  `,
})
class ModelHost {
  // #region Properties
  /**
   * Property accepted
   * @readonly
   *
   * @description
   * Checked model for the regular acceptance checkbox.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly accepted: WritableSignal<boolean> = signal(false);

  /**
   * Property all
   * @readonly
   *
   * @description
   * Checked model for the select-all checkbox.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly all: WritableSignal<boolean> = signal(false);

  /**
   * Property partial
   * @readonly
   *
   * @description
   * Indeterminate model representing a partial selection.
   *
   * @type {WritableSignal<boolean>}
   * @default true
   */
  public readonly partial: WritableSignal<boolean> = signal(true);
  // #endregion
}

describe('CwCheckbox', () => {
  describe('with models', () => {
    let host: HTMLElement;
    let component: ModelHost;
    let fixture: ComponentFixture<ModelHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(ModelHost);
      fixture.autoDetectChanges();
      host = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
    });

    it('toggles the checked model on click', async () => {
      const accept: HTMLButtonElement = box(host, 'Accepter');
      expect(accept.getAttribute('aria-checked')).toBe('false');

      accept.click();
      await fixture.whenStable();

      expect(component.accepted()).toBe(true);
      expect(accept.getAttribute('aria-checked')).toBe('true');
    });

    it('reads mixed when indeterminate and checks everything on click', async () => {
      const all: HTMLButtonElement = box(host, 'Tout sélectionner');
      expect(all.getAttribute('aria-checked')).toBe('mixed');

      all.click();
      await fixture.whenStable();

      expect(component.partial()).toBe(false);
      expect(component.all()).toBe(true);
    });

    it('is named by its label and stays inert when disabled', () => {
      const notify: HTMLButtonElement = box(host, 'Notifier');

      expect(notify.disabled).toBe(true);
    });
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    /**
     * Class ReactiveHost
     * @class ReactiveHost
     *
     * @description
     * Test host binding a required-true reactive control to the checkbox.
     */
    @Component({
      imports: [CwCheckbox, ReactiveFormsModule],
      template: `<cw-checkbox [formControl]="terms" ariaLabel="Conditions" />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property terms
       * @readonly
       *
       * @description
       * Non-nullable boolean control requiring the user to accept the terms.
       *
       * @type {FormControl<boolean>}
       */
      public readonly terms: FormControl<boolean> = new FormControl<boolean>(false, {
        nonNullable: true,
        validators: [(control) => Validators.requiredTrue(control)],
      });
      // #endregion
    }

    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const terms: HTMLButtonElement = box(host, 'Conditions');

    fixture.componentInstance.terms.setValue(true);
    await fixture.whenStable();
    expect(terms.getAttribute('aria-checked')).toBe('true');

    terms.click();
    terms.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.terms.value).toBe(false);
    expect(terms.getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.terms.disable();
    await fixture.whenStable();
    expect(terms.disabled).toBe(true);
  });

  it('is a Signal Forms checkbox control', async () => {
    /**
     * Class SignalHost
     * @class SignalHost
     *
     * @description
     * Test host binding a Signal Forms newsletter field to the checkbox.
     */
    @Component({
      imports: [CwCheckbox, FormField],
      template: `<cw-checkbox [formField]="settings.newsletter" ariaLabel="Newsletter" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Writable settings model containing the newsletter choice.
       *
       * @type {WritableSignal<{ newsletter: boolean }>}
       */
      public readonly model: WritableSignal<{ newsletter: boolean }> = signal({
        newsletter: false,
      });

      /**
       * Property settings
       * @readonly
       *
       * @description
       * Signal Forms tree that marks the newsletter field as required.
       *
       * @type {FieldTree<{ newsletter: boolean }>}
       */
      public readonly settings: FieldTree<{ newsletter: boolean }> = form(this.model, (path) => {
        required(path.newsletter);
      });
      // #endregion
    }

    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const newsletter: HTMLButtonElement = box(host, 'Newsletter');

    newsletter.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().newsletter).toBe(true);

    fixture.componentInstance.model.set({ newsletter: false });
    await fixture.whenStable();
    expect(newsletter.getAttribute('aria-checked')).toBe('false');
  });
});
