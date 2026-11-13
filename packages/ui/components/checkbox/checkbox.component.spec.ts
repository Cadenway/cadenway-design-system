import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwCheckbox } from './checkbox.component';

function box(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="checkbox"]')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No checkbox named ${name}`);
  return found;
}

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
  readonly accepted = signal(false);
  readonly all = signal(false);
  readonly partial = signal(true);
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
      const accept = box(host, 'Accepter');
      expect(accept.getAttribute('aria-checked')).toBe('false');

      accept.click();
      await fixture.whenStable();

      expect(component.accepted()).toBe(true);
      expect(accept.getAttribute('aria-checked')).toBe('true');
    });

    it('reads mixed when indeterminate and checks everything on click', async () => {
      const all = box(host, 'Tout sélectionner');
      expect(all.getAttribute('aria-checked')).toBe('mixed');

      all.click();
      await fixture.whenStable();

      expect(component.partial()).toBe(false);
      expect(component.all()).toBe(true);
    });

    it('is named by its label and stays inert when disabled', () => {
      const notify = box(host, 'Notifier');

      expect(notify.disabled).toBe(true);
    });
  });

  it('is the value accessor of a reactive form control and reports its invalid state', async () => {
    @Component({
      imports: [CwCheckbox, ReactiveFormsModule],
      template: `<cw-checkbox [formControl]="terms" ariaLabel="Conditions" />`,
    })
    class ReactiveHost {
      readonly terms = new FormControl(false, {
        nonNullable: true,
        validators: [(control) => Validators.requiredTrue(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const terms = box(host, 'Conditions');

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
    @Component({
      imports: [CwCheckbox, FormField],
      template: `<cw-checkbox [formField]="settings.newsletter" ariaLabel="Newsletter" />`,
    })
    class SignalHost {
      readonly model = signal({ newsletter: false });
      readonly settings = form(this.model, (path) => {
        required(path.newsletter);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const newsletter = box(host, 'Newsletter');

    newsletter.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.model().newsletter).toBe(true);

    fixture.componentInstance.model.set({ newsletter: false });
    await fixture.whenStable();
    expect(newsletter.getAttribute('aria-checked')).toBe('false');
  });
});
