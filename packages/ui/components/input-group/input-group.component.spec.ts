import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';

import { CwInputGroupAddon } from './input-group-addon/input-group-addon.component';
import { CwInputGroupButton } from './input-group-button/input-group-button.component';
import { CwInputGroupInput } from './input-group-input/input-group-input.directive';
import { CwInputGroupText } from './input-group-text/input-group-text.component';
import { CwInputGroupTextarea } from './input-group-textarea/input-group-textarea.directive';
import { CwInputGroup } from './input-group.component';

/**
 * Function byName
 *
 * @description
 * Finds an element by selector and accessible name or text.
 *
 * @param {HTMLElement} host - Fixture containing the element.
 * @param {string} selector - CSS selector used to find candidates.
 * @param {string} name - Accessible name or visible text to match.
 *
 * @returns {HTMLElement} Matching element.
 */
function byName(host: HTMLElement, selector: string, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>(selector),
  ).find((element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name);
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

describe('CwInputGroup', () => {
  it('groups a field with its addons and focuses the field from an addon', () => {
    /**
     * Class Host
     *
     * @description
     * Hosts an input group with text addons.
     */
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

    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const group: HTMLElement | null = host.querySelector<HTMLElement>('[role="group"]');
    const url: HTMLInputElement = byName(host, 'input', 'URL du webhook') as HTMLInputElement;

    expect(group?.dataset['size']).toBe('sm');
    expect(host.querySelector('[data-align="inline-end"]')?.textContent.trim()).toBe('heures');

    byName(host, 'cw-input-group-text', 'https://').click();
    expect(document.activeElement).toBe(url);
  });

  it('renders a ghost Button, xs by default, that never submits', () => {
    /**
     * Class Host
     *
     * @description
     * Hosts an input group with addon buttons.
     */
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
      // #region Properties
      /**
       * Property copies
       * @readonly
       *
       * @description
       * Number of copy actions.
       *
       * @type {WritableSignal<number>}
       */
      public readonly copies: WritableSignal<number> = signal(0);

      /**
       * Property submitted
       * @readonly
       *
       * @description
       * Whether the form was submitted.
       *
       * @type {WritableSignal<boolean>}
       */
      public readonly submitted: WritableSignal<boolean> = signal(false);
      // #endregion
    }

    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const copy: HTMLButtonElement = byName(host, 'button', 'Copier la clé') as HTMLButtonElement;
    const send: HTMLButtonElement = byName(host, 'button', 'Envoyer') as HTMLButtonElement;

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
    /**
     * Class ReactiveHost
     *
     * @description
     * Hosts an input group bound to a reactive form control.
     */
    @Component({
      imports: [CwInputGroup, CwInputGroupInput, ReactiveFormsModule],
      template: `
        <cw-input-group>
          <input cwInputGroupInput [formControl]="url" aria-label="URL du webhook" />
        </cw-input-group>
      `,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property url
       * @readonly
       *
       * @description
       * Reactive URL field.
       *
       * @type {FormControl<string>}
       */
      public readonly url: FormControl<string> = new FormControl<string>('', {
        nonNullable: true,
        validators: [(control) => Validators.required(control)],
      });
      // #endregion
    }

    const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
    fixture.autoDetectChanges();
    const url: HTMLInputElement = byName(
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
    /**
     * Class SignalHost
     *
     * @description
     * Hosts a textarea bound through Signal Forms.
     */
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
      // #region Properties
      /**
       * Property model
       * @readonly
       *
       * @description
       * Signal-backed comment model.
       *
       * @type {WritableSignal<{ comment: string }>}
       */
      public readonly model: WritableSignal<{ comment: string }> = signal({ comment: '' });

      /**
       * Property composer
       * @readonly
       *
       * @description
       * Signal form with a required comment.
       *
       * @type {FieldTree<{ comment: string }>}
       */
      public readonly composer: FieldTree<{ comment: string }> = form(this.model, (path) => {
        required(path.comment);
      });
      // #endregion
    }

    const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
    fixture.autoDetectChanges();
    const comment: HTMLTextAreaElement = byName(
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
