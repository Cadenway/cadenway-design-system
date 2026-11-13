import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwSwitch } from './switch.component';

function control(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="switch"]')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No switch named ${name}`);
  return found;
}

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
  readonly mail = signal(false);
  readonly changes = signal(0);
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
      const mail = control(host, 'Notifications par e-mail');
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
    @Component({
      imports: [CwSwitch, ReactiveFormsModule],
      template: `<cw-switch [formControl]="sync" ariaLabel="Synchroniser le calendrier" />`,
    })
    class ReactiveHost {
      readonly sync = new FormControl(false, {
        nonNullable: true,
        validators: [(control) => Validators.requiredTrue(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const sync = control(fixture.nativeElement as HTMLElement, 'Synchroniser le calendrier');

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
    @Component({
      imports: [CwSwitch, FormsModule],
      template: `<cw-switch [(ngModel)]="digest" ariaLabel="Résumé quotidien" />`,
    })
    class TemplateHost {
      readonly digest = signal(true);
    }

    const fixture = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    // NgModel writes its value in a microtask after the first check.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
    const digest = control(fixture.nativeElement as HTMLElement, 'Résumé quotidien');
    expect(digest.getAttribute('aria-checked')).toBe('true');

    digest.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.digest()).toBe(false);
  });

  it('is a Signal Forms checkbox control', async () => {
    @Component({
      imports: [CwSwitch, FormField],
      template: `<cw-switch [formField]="settings.private" ariaLabel="Espace privé" />`,
    })
    class SignalHost {
      readonly model = signal({ private: false });
      readonly settings = form(this.model, (path) => {
        required(path.private);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const privateSpace = control(fixture.nativeElement as HTMLElement, 'Espace privé');

    privateSpace.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().private).toBe(true);

    fixture.componentInstance.model.set({ private: false });
    await fixture.whenStable();
    expect(privateSpace.getAttribute('aria-checked')).toBe('false');
  });
});
