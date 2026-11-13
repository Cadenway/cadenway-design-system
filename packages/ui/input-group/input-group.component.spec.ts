import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';

import { CwInputGroupAddon } from './input-group-addon/input-group-addon.component';
import { CwInputGroupButton } from './input-group-button/input-group-button.component';
import { CwInputGroupInput } from './input-group-input/input-group-input.directive';
import { CwInputGroupText } from './input-group-text/input-group-text.component';
import { CwInputGroupTextarea } from './input-group-textarea/input-group-textarea.directive';
import { CwInputGroup } from './input-group.component';

function byName(host: HTMLElement, selector: string, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>(selector)).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

describe('CwInputGroup', () => {
  it('groups a field with its addons and focuses the field from an addon', () => {
    @Component({
      imports: [CwInputGroup, CwInputGroupAddon, CwInputGroupInput, CwInputGroupText],
      template: `
        <cw-input-group size="sm">
          <cw-input-group-addon
            ><cw-input-group-text>https://</cw-input-group-text></cw-input-group-addon
          >
          <input cwInputGroupInput aria-label="URL du webhook" />
          <cw-input-group-addon align="inline-end">heures</cw-input-group-addon>
        </cw-input-group>
      `,
    })
    class Host {}

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const group = host.querySelector<HTMLElement>('[role="group"]');
    const url = byName(host, 'input', 'URL du webhook') as HTMLInputElement;

    expect(group?.dataset['size']).toBe('sm');
    expect(host.querySelector('[data-align="inline-end"]')?.textContent.trim()).toBe('heures');

    byName(host, 'cw-input-group-text', 'https://').click();
    expect(document.activeElement).toBe(url);
  });

  it('renders a ghost Button, xs by default, that never submits', () => {
    @Component({
      imports: [CwInputGroup, CwInputGroupAddon, CwInputGroupButton, CwInputGroupInput],
      template: `
        <form (submit)="$event.preventDefault(); submitted.set(true)">
          <cw-input-group>
            <input cwInputGroupInput aria-label="Clé d'API" />
            <cw-input-group-addon align="inline-end">
              <button
                cwInputGroupButton
                size="icon-xs"
                aria-label="Copier la clé"
                (click)="copies.set(copies() + 1)"
              ></button>
              <button cwInputGroupButton variant="default" [loading]="true">Envoyer</button>
            </cw-input-group-addon>
          </cw-input-group>
        </form>
      `,
    })
    class Host {
      readonly copies = signal(0);
      readonly submitted = signal(false);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const copy = byName(host, 'button', 'Copier la clé') as HTMLButtonElement;
    const send = byName(host, 'button', 'Envoyer') as HTMLButtonElement;

    copy.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
    copy.click();
    send.click();

    expect(copy.type).toBe('button');
    expect(copy.hasAttribute('data-ripple')).toBe(true);
    expect(copy.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1);
    expect(copy.dataset['variant']).toBe('ghost');
    expect(copy.dataset['size']).toBe('icon-xs');
    expect(send.dataset['size']).toBe('xs');
    expect(send.getAttribute('aria-busy')).toBe('true');
    expect(fixture.componentInstance.copies()).toBe(1);
    expect(fixture.componentInstance.submitted()).toBe(false);
    expect(document.activeElement).not.toBe(byName(host, 'input', "Clé d'API"));
  });

  it('keeps the native value accessor of a reactive form and reports invalid once touched', async () => {
    @Component({
      imports: [CwInputGroup, CwInputGroupInput, ReactiveFormsModule],
      template: `
        <cw-input-group>
          <input cwInputGroupInput [formControl]="url" aria-label="URL du webhook" />
        </cw-input-group>
      `,
    })
    class ReactiveHost {
      readonly url = new FormControl('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      });
    }

    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const url = byName(
      fixture.nativeElement as HTMLElement,
      'input',
      'URL du webhook',
    ) as HTMLInputElement;

    url.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(url.getAttribute('aria-invalid')).toBe('true');

    url.value = 'hooks.exemple.fr/cadenway';
    url.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.url.value).toBe('hooks.exemple.fr/cadenway');
    expect(url.hasAttribute('aria-invalid')).toBe(false);
  });

  it('works with Signal Forms on a text area', async () => {
    @Component({
      imports: [CwInputGroup, CwInputGroupTextarea, FormField],
      template: `
        <cw-input-group>
          <textarea
            cwInputGroupTextarea
            [formField]="composer.comment"
            aria-label="Commentaire"
          ></textarea>
        </cw-input-group>
      `,
    })
    class SignalHost {
      readonly model = signal({ comment: '' });
      readonly composer = form(this.model, (path) => {
        required(path.comment);
      });
    }

    const fixture = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const comment = byName(
      fixture.nativeElement as HTMLElement,
      'textarea',
      'Commentaire',
    ) as HTMLTextAreaElement;

    comment.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(comment.getAttribute('aria-invalid')).toBe('true');

    comment.value = 'Je reprends après la revue.';
    comment.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().comment).toBe('Je reprends après la revue.');
  });
});
