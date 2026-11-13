import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwInput } from './input.directive';

function field(host: HTMLElement, name: string): HTMLInputElement {
  const found = Array.from(host.querySelectorAll('input')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      host.querySelector(`label[for="${element.id}"]`)?.textContent.trim() === name,
  );
  if (!found) throw new Error(`No field named ${name}`);
  return found;
}

describe('CwInput', () => {
  it('keeps the native attributes and the layout classes of the consumer', () => {
    @Component({
      imports: [CwInput],
      template: `
        <label for="prefix">Préfixe des identifiants</label>
        <input cwInput id="prefix" class="w-52" size="sm" placeholder="CAD" readonly />
        <input cwInput aria-label="Adresse d'expédition" aria-invalid="true" type="email" />
      `,
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const prefix = field(host, 'Préfixe des identifiants');

    expect(prefix.readOnly).toBe(true);
    expect(prefix.placeholder).toBe('CAD');
    expect(prefix.dataset['size']).toBe('sm');
    expect(prefix.classList).toContain('w-52');
    expect(prefix.hasAttribute('aria-invalid')).toBe(false);
    expect(field(host, "Adresse d'expédition").getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps the native value accessor of a reactive form and reports invalid once touched', async () => {
    @Component({
      imports: [CwInput, ReactiveFormsModule],
      template: `<input cwInput [formControl]="name" aria-label="Nom de la tâche" />`,
    })
    class ReactiveHost {
      readonly name = new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const name = field(host, 'Nom de la tâche');

    expect(name.hasAttribute('aria-invalid')).toBe(false);
    name.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(name.getAttribute('aria-invalid')).toBe('true');

    name.value = 'Préparer la revue de sprint';
    name.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.name.value).toBe('Préparer la revue de sprint');
    expect(name.hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.name.disable();
    await fixture.whenStable();
    expect(name.disabled).toBe(true);
  });

  it('works with ngModel', async () => {
    @Component({
      imports: [CwInput, FormsModule],
      template: `<input cwInput [(ngModel)]="url" aria-label="URL de l'instance" />`,
    })
    class TemplateHost {
      readonly url = signal('https://cadenway.exemple.fr');
    }

    const fixture = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const url = field(fixture.nativeElement as HTMLElement, "URL de l'instance");

    expect(url.value).toBe('https://cadenway.exemple.fr');
    url.value = 'https://tâches.exemple.fr';
    url.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.url()).toBe('https://tâches.exemple.fr');
  });

  it('works with Signal Forms on the native element', async () => {
    @Component({
      imports: [CwInput, FormField],
      template: `<input cwInput [formField]="space.prefix" aria-label="Préfixe" />`,
    })
    class SignalHost {
      readonly model = signal({ prefix: '' });
      readonly space = form(this.model, (path) => {
        required(path.prefix);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const prefix = field(fixture.nativeElement as HTMLElement, 'Préfixe');

    prefix.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(prefix.getAttribute('aria-invalid')).toBe('true');

    prefix.value = 'CAD';
    prefix.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().prefix).toBe('CAD');
    expect(prefix.hasAttribute('aria-invalid')).toBe(false);
  });
});
