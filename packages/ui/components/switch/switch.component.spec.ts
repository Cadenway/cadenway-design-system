import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwSwitch } from './switch.component';

/**
 * Function control
 *
 * @description
 * Finds a test switch by its aria-label or associated native label text.
 *
 * @param {HTMLElement} host - Container holding the switches and labels.
 * @param {string} name - Exact accessible name to match.
 *
 * @returns {HTMLButtonElement} First matching switch button.
 *
 * @throws {Error} When no switch has the requested name.
 */
function control(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(
    host.querySelectorAll<HTMLButtonElement>('[role="switch"]'),
  ).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No switch named ${name}`);
  return found;
}

/**
 * Class ModelHost
 * @class ModelHost
 *
 * @description
 * Test host with a mutable switch model and a disabled labelled switch.
 */
@Component({
  imports: [CwSwitch],
  template: `
    <cw-switch
      [(checked)]="mail"
      (checkedChange)="changes.set(changes() + 1)"
      ariaLabel="Notifications par e-mail"
    />
    <cw-switch id="slack" disabled />
    <label for="slack">Notifications Slack</label>
  `,
})
class ModelHost {
  // #region Properties
  /**
   * Property mail
   * @readonly
   *
   * @description
   * Two-way checked model for the email notifications switch.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly mail: WritableSignal<boolean> = signal(false);

  /**
   * Property changes
   * @readonly
   *
   * @description
   * Counts checked-change events from the email switch.
   *
   * @type {WritableSignal<number>}
   * @default 0
   */
  public readonly changes: WritableSignal<number> = signal(0);
  // #endregion
}

describe('CwSwitch', () => {
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

    it('toggles the checked model on click and emits checkedChange', async () => {
      const mail: HTMLButtonElement = control(host, 'Notifications par e-mail');
      expect(mail.getAttribute('aria-checked')).toBe('false');

      mail.click();
      await fixture.whenStable();

      expect(component.mail()).toBe(true);
      expect(component.changes()).toBe(1);
      expect(mail.getAttribute('aria-checked')).toBe('true');

      mail.click();
      await fixture.whenStable();
      expect(component.mail()).toBe(false);
    });

    it('follows the model', async () => {
      component.mail.set(true);
      await fixture.whenStable();

      expect(control(host, 'Notifications par e-mail').getAttribute('aria-checked')).toBe('true');
    });

    it('is named by its label and stays inert when disabled', () => {
      expect(control(host, 'Notifications Slack').disabled).toBe(true);
    });
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    /**
     * Class ReactiveHost
     * @class ReactiveHost
     *
     * @description
     * Test host binding a required-true reactive control to the switch.
     */
    @Component({
      imports: [CwSwitch, ReactiveFormsModule],
      template: `<cw-switch [formControl]="sync" ariaLabel="Synchroniser le calendrier" />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property sync
       * @readonly
       *
       * @description
       * Non-nullable boolean control validating that calendar synchronization is enabled.
       *
       * @type {FormControl<boolean>}
       */
      public readonly sync: FormControl<boolean> = new FormControl<boolean>(false, {
        nonNullable: true,
        validators: [(control) => Validators.requiredTrue(control)],
      });
      // #endregion
    }

    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const sync: HTMLButtonElement = control(
      fixture.nativeElement as HTMLElement,
      'Synchroniser le calendrier',
    );

    fixture.componentInstance.sync.setValue(true);
    await fixture.whenStable();
    expect(sync.getAttribute('aria-checked')).toBe('true');

    sync.click();
    sync.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.sync.value).toBe(false);
    expect(sync.getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.sync.disable();
    await fixture.whenStable();
    expect(sync.disabled).toBe(true);
  });

  it('works with ngModel', async () => {
    /**
     * Class TemplateHost
     * @class TemplateHost
     *
     * @description
     * Test host binding the daily digest setting through template-driven `ngModel`.
     */
    @Component({
      imports: [CwSwitch, FormsModule],
      template: `<cw-switch [(ngModel)]="digest" ariaLabel="Résumé quotidien" />`,
    })
    class TemplateHost {
      // #region Properties
      /**
       * Property digest
       * @readonly
       *
       * @description
       * Boolean model updated by the template-driven switch.
       *
       * @type {WritableSignal<boolean>}
       * @default true
       */
      public readonly digest: WritableSignal<boolean> = signal(true);
      // #endregion
    }

    const fixture: ComponentFixture<TemplateHost> = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    // NgModel writes its value in a microtask after the first check.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const digest: HTMLButtonElement = control(
      fixture.nativeElement as HTMLElement,
      'Résumé quotidien',
    );
    expect(digest.getAttribute('aria-checked')).toBe('true');

    digest.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.digest()).toBe(false);
  });

  it('is a Signal Forms checkbox control', async () => {
    /**
     * Class SignalHost
     * @class SignalHost
     *
     * @description
     * Test host binding a Signal Forms privacy field to the switch.
     */
    @Component({
      imports: [CwSwitch, FormField],
      template: `<cw-switch [formField]="settings.private" ariaLabel="Espace privé" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Writable settings model containing the privacy flag.
       *
       * @type {WritableSignal<{ private: boolean }>}
       */
      public readonly model: WritableSignal<{ private: boolean }> = signal({ private: false });

      /**
       * Property settings
       * @readonly
       *
       * @description
       * Signal Forms tree that marks the privacy field as required.
       *
       * @type {FieldTree<{ private: boolean }>}
       */
      public readonly settings: FieldTree<{ private: boolean }> = form(this.model, (path) => {
        required(path.private);
      });
      // #endregion
    }

    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const privateSpace: HTMLButtonElement = control(
      fixture.nativeElement as HTMLElement,
      'Espace privé',
    );

    privateSpace.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().private).toBe(true);

    fixture.componentInstance.model.set({ private: false });
    await fixture.whenStable();
    expect(privateSpace.getAttribute('aria-checked')).toBe('false');
  });
});
