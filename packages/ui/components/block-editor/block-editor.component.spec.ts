import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { FormField, form, required, type FieldTree } from '@angular/forms/signals';
import { of } from 'rxjs';

import { CwBlockEditor } from './block-editor.component';
import type { CwMentionPerson, CwMentionSearch } from './block-editor.types';

/* jsdom has no layout: the engine measures the caret when it scrolls it into view, Floating UI
   watches sizes. These stand-ins only answer with empty boxes. */
beforeAll(() => {
  const empty: () => DOMRect = (): DOMRect => new DOMRect(0, 0, 0, 0);
  Range.prototype.getBoundingClientRect = empty;
  Range.prototype.getClientRects = () => document.createElement('div').getClientRects();
  Element.prototype.scrollIntoView = () => undefined;
  document.elementFromPoint = () => null;
  if (!('ResizeObserver' in globalThis))
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: class {
        public observe(): void {
          /* no layout in jsdom */
        }
        public unobserve(): void {
          /* no layout in jsdom */
        }
        public disconnect(): void {
          /* no layout in jsdom */
        }
      },
    });
});

/**
 * Constant PEOPLE
 *
 * @description
 * People offered by the mention search fixture.
 *
 * @type {CwMentionPerson[]}
 */
const PEOPLE: CwMentionPerson[] = [
  { id: 'u-1', name: 'Karim Benali', role: 'Développement' },
  { id: 'u-2', name: 'Inès Duval', role: 'Design' },
  { id: 'u-3', name: 'Léa Martin', role: 'Produit' },
];

/**
 * Function settle
 *
 * @description
 * Waits for asynchronous editor updates.
 *
 * @param {number} ms - Delay in milliseconds.
 * @returns {Promise<void>} Promise resolved after the delay.
 */
function settle(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Function textbox
 *
 * @description
 * Finds an editor textbox by its accessible name.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} name - Accessible name to find.
 * @returns {HTMLElement} Matching textbox.
 */
function textbox(host: HTMLElement, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('[role="textbox"]'),
  ).find((element) => element.getAttribute('aria-label') === name);
  if (!found) throw new Error(`No textbox named ${name}`);
  return found;
}

/**
 * Function button
 *
 * @description
 * Finds a button by its accessible name.
 *
 * @param {HTMLElement} host - Fixture element to search.
 * @param {string} name - Accessible name to find.
 * @returns {HTMLButtonElement} Matching button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/* Typing in jsdom: ProseMirror reads typed characters from DOM mutations, which jsdom cannot
   produce from key events; a paste of plain text goes through the same transaction path (and
   the « / » and « @ » menus). */
/**
 * Function typeText
 *
 * @description
 * Pastes text into the editor in the layout-free test environment.
 *
 * @param {HTMLElement} target - Element receiving the event.
 * @param {string} text - Text to paste.
 */
function typeText(target: HTMLElement, text: string): void {
  const event: Event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
      types: ['text/plain'],
      files: [],
      items: [],
    },
  });
  target.dispatchEvent(event);
}

/**
 * Function spokenText
 *
 * @description
 * Reads text excluding content hidden from assistive technology.
 *
 * @param {Element} element - Element whose accessible text is read.
 * @returns {string} Text visible to assistive technology.
 */
function spokenText(element: Element): string {
  const copy: Element = element.cloneNode(true) as Element;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => {
    hidden.remove();
  });
  return copy.textContent.replace(/\s+/g, ' ').trim();
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to the editor.
 *
 * @param {HTMLElement} target - Element receiving the event.
 * @param {string} key - Keyboard key to dispatch.
 * @param {KeyboardEventInit} init - Additional keyboard event options.
 */
function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  );
}

/**
 * Component ModelHost
 *
 * @description
 * Hosts an editor bound to a signal model.
 */
@Component({
  imports: [CwBlockEditor],
  template: `
    <cw-block-editor
      [(value)]="text"
      [mentionSearch]="search"
      [disabled]="off()"
      (ctrlEnter)="sent = sent + 1"
    />
  `,
})
class ModelHost {
  // #region Properties
  /**
   * Property text
   *
   * @description
   * Markdown value bound to the editor.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly text: WritableSignal<string> = signal('');

  /**
   * Property off
   *
   * @description
   * Disabled state bound to the editor.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly off: WritableSignal<boolean> = signal(false);

  /**
   * Property sent
   *
   * @description
   * Number of submit shortcuts emitted by the editor.
   *
   * @type {number}
   */
  public sent: number = 0;

  /**
   * Property search
   *
   * @description
   * Mention search backed by fixture people.
   *
   * @type {CwMentionSearch}
   * @readonly
   */
  public readonly search: CwMentionSearch = (query) =>
    of(PEOPLE.filter((person) => person.name.toLowerCase().includes(query.toLowerCase())));
  // #endregion
}

describe('CwBlockEditor', () => {
  describe('with a model', () => {
    let fixture: ComponentFixture<ModelHost>;
    let host: HTMLElement;
    let component: ModelHost;

    /**
     * Function start
     *
     * @description
     * Sets the fixture value and finds the rendered editor.
     *
     * @param {string} value - Initial Markdown value.
     * @returns {Promise<HTMLElement>} Promise resolving to the editor textbox.
     */
    async function start(value: string): Promise<HTMLElement> {
      component.text.set(value);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      await settle();
      return textbox(host, 'Contenu du document');
    }

    beforeEach(() => {
      fixture = TestBed.createComponent(ModelHost);
      host = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('shows the Markdown as formatted text in a named multi-line textbox', async () => {
      const surface: HTMLElement = await start('# Plan\n\nTexte **gras** et __souligné__.');
      expect(surface.getAttribute('aria-multiline')).toBe('true');
      expect(surface.getAttribute('contenteditable')).toBe('true');
      expect(surface.querySelector('h1')?.textContent).toBe('Plan');
      expect(surface.querySelector('strong')?.textContent).toBe('gras');
      expect(surface.querySelector('u')?.textContent).toBe('souligné');
    });

    it('follows a value set from outside', async () => {
      const surface: HTMLElement = await start('Avant');
      component.text.set('- un\n- deux');
      await fixture.whenStable();
      expect(surface.querySelectorAll('li')).toHaveLength(2);
    });

    it('writes typed text back to the model', async () => {
      const surface: HTMLElement = await start('');
      typeText(surface, 'Bonjour');
      await fixture.whenStable();
      expect(component.text()).toBe('Bonjour');
    });

    it('toggles marks from the toolbar and writes underline as __text__', async () => {
      const surface: HTMLElement = await start('relire');
      expect(host.querySelector('[role="toolbar"]')?.getAttribute('aria-label')).toBe(
        'Mise en forme',
      );
      press(surface, 'a', { ctrlKey: true });
      button(host, 'Gras').click();
      await fixture.whenStable();
      expect(component.text()).toBe('**relire**');
      expect(button(host, 'Gras').getAttribute('aria-pressed')).toBe('true');

      button(host, 'Gras').click();
      button(host, 'Souligné').click();
      await fixture.whenStable();
      expect(component.text()).toBe('__relire__');
    });

    it('toggles marks with the keyboard shortcuts', async () => {
      const surface: HTMLElement = await start('relire');
      press(surface, 'a', { ctrlKey: true });
      press(surface, 'i', { ctrlKey: true });
      await fixture.whenStable();
      expect(component.text()).toBe('*relire*');
    });

    it('opens the block menu with « / » and inserts the chosen block', async () => {
      const surface: HTMLElement = await start('');
      typeText(surface, '/');
      await fixture.whenStable();
      await settle();

      const listbox: HTMLElement | null = host.querySelector<HTMLElement>('[role="listbox"]');
      expect(listbox).not.toBeNull();
      expect(listbox?.getAttribute('aria-labelledby')).toBeTruthy();
      const titleId: string = listbox?.getAttribute('aria-labelledby') ?? '';
      expect(host.querySelector(`[id="${titleId}"]`)?.textContent.trim()).toBe('Blocs');
      const options: Element[] = Array.from(listbox?.querySelectorAll('[role="option"]') ?? []);
      expect(options.map((option) => option.textContent.trim().split(/\s+/)[0])).toHaveLength(10);
      expect(surface.getAttribute('aria-activedescendant')).toBe(options[0].id);

      press(surface, 'ArrowDown');
      await fixture.whenStable();
      expect(surface.getAttribute('aria-activedescendant')).toBe(options[1].id);
      expect(options[1].getAttribute('aria-selected')).toBe('true');

      press(surface, 'Enter');
      await fixture.whenStable();
      await settle();
      expect(host.querySelector('[role="listbox"]')).toBeNull();
      typeText(surface, 'Objectif');
      await fixture.whenStable();
      expect(component.text()).toBe('# Objectif');
    });

    it('filters the block menu with the typed query', async () => {
      const surface: HTMLElement = await start('');
      typeText(surface, '/cit');
      await fixture.whenStable();
      await settle();
      const options: Element[] = Array.from(host.querySelectorAll('[role="option"]'));
      expect(options.map((option) => option.textContent.trim())).toEqual(['Citation>']);
    });

    it('inserts the selected block when Enter is pressed on its option', async () => {
      const surface: HTMLElement = await start('');
      typeText(surface, '/cit');
      await fixture.whenStable();
      await settle();
      const option: HTMLElement | null = host.querySelector<HTMLElement>('[role="option"]');
      expect(option).not.toBeNull();
      if (!option) throw new Error('Block option missing');
      press(option, 'Enter');
      await fixture.whenStable();
      await settle();
      typeText(surface, 'Note');
      await fixture.whenStable();
      expect(component.text()).toBe('> Note');
    });

    it('closes the block menu with Escape and keeps the text', async () => {
      const surface: HTMLElement = await start('');
      typeText(surface, '/');
      await fixture.whenStable();
      await settle();
      press(surface, 'Escape');
      await fixture.whenStable();
      expect(host.querySelector('[role="listbox"]')).toBeNull();
      expect(surface.getAttribute('aria-activedescendant')).toBeNull();
      expect(component.text()).toBe('/');
    });

    it('mentions a person after « @ », stored as @[name](id)', async () => {
      const surface: HTMLElement = await start('');
      typeText(surface, 'Merci @in');
      await fixture.whenStable();
      await settle(200);
      await fixture.whenStable();

      const options: Element[] = Array.from(host.querySelectorAll('[role="option"]'));
      expect(options.map(spokenText)).toEqual(['Inès Duval, Design', 'Léa Martin, Produit']);
      press(surface, 'Enter');
      await fixture.whenStable();
      expect(component.text()).toBe('Merci @[Inès Duval](u-2)');
      expect(surface.querySelector('[data-mention]')?.textContent).toBe('@Inès Duval');
      const editor: CwBlockEditor = fixture.debugElement.children[0]
        .componentInstance as CwBlockEditor;
      expect(editor.mentions()).toEqual(['u-2']);
    });

    it('emits ctrlEnter on Ctrl + Entrée without adding a line', async () => {
      const surface: HTMLElement = await start('Prêt');
      press(surface, 'Enter', { ctrlKey: true });
      await fixture.whenStable();
      expect(component.sent).toBe(1);
      expect(component.text()).toBe('Prêt');
    });

    it('is read-only when disabled', async () => {
      const surface: HTMLElement = await start('Texte');
      component.off.set(true);
      await fixture.whenStable();
      expect(surface.getAttribute('contenteditable')).toBe('false');
      expect(surface.getAttribute('aria-disabled')).toBe('true');
      expect(button(host, 'Gras').disabled).toBe(true);
    });
  });

  describe('with Reactive Forms', () => {
    /**
     * Component ReactiveHost
     *
     * @description
     * Hosts an editor bound to a reactive form control.
     */
    @Component({
      imports: [CwBlockEditor, ReactiveFormsModule],
      template: `<cw-block-editor
        variant="field"
        [toolbar]="false"
        ariaLabel="Description"
        [formControl]="control"
      />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property control
       *
       * @description
       * Reactive form control bound to the editor.
       *
       * @type {FormControl<string>}
       * @readonly
       */
      public readonly control: FormControl<string> = new FormControl<string>('Texte **initial**', {
        nonNullable: true,
      });
      // #endregion
    }

    it('reads, writes and disables through the control', async () => {
      const fixture: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      await settle();
      const host: HTMLElement = fixture.nativeElement as HTMLElement;
      const surface: HTMLElement = textbox(host, 'Description');
      expect(host.querySelector('[role="toolbar"]')).toBeNull();
      expect(surface.querySelector('strong')?.textContent).toBe('initial');

      press(surface, 'a', { ctrlKey: true });
      typeText(surface, 'Nouveau');
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe('Nouveau');

      fixture.componentInstance.control.setValue('## Titre');
      await fixture.whenStable();
      expect(surface.querySelector('h2')?.textContent).toBe('Titre');

      fixture.componentInstance.control.disable();
      await fixture.whenStable();
      expect(surface.getAttribute('contenteditable')).toBe('false');
      fixture.destroy();
    });
  });

  describe('with template-driven forms', () => {
    /**
     * Component TemplateHost
     *
     * @description
     * Hosts an editor bound through ngModel.
     */
    @Component({
      imports: [CwBlockEditor, FormsModule],
      template: `<cw-block-editor ariaLabel="Description" [(ngModel)]="text" />`,
    })
    class TemplateHost {
      // #region Properties
      /**
       * Property text
       *
       * @description
       * Markdown value synchronized with the editor.
       *
       * @type {string}
       */
      public text: string = 'Initial';
      // #endregion
    }

    it('synchronizes value, touched and disabled state', async () => {
      const fixture: ComponentFixture<TemplateHost> = TestBed.createComponent(TemplateHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      await settle();
      const host: HTMLElement = fixture.nativeElement as HTMLElement;
      const surface: HTMLElement = textbox(host, 'Description');
      const control: NgModel = fixture.debugElement
        .query(By.directive(NgModel))
        .injector.get(NgModel);
      expect(surface.textContent).toBe('Initial');
      press(surface, 'a', { ctrlKey: true });
      typeText(surface, 'Updated');
      surface.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(fixture.componentInstance.text).toBe('Updated');
      expect(control.touched).toBe(true);
      control.control.disable();
      await fixture.whenStable();
      expect(surface.getAttribute('contenteditable')).toBe('false');
      fixture.destroy();
    });
  });

  describe('with Signal Forms', () => {
    /**
     * Component SignalHost
     *
     * @description
     * Hosts an editor bound to a Signal Forms field.
     */
    @Component({
      imports: [CwBlockEditor, FormField],
      template: `<cw-block-editor ariaLabel="Description" [formField]="draft.text" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       *
       * @description
       * Signal model used by the form.
       *
       * @type {WritableSignal<{ text: string; }>}
       * @readonly
       */
      public readonly model: WritableSignal<{ text: string }> = signal({ text: '' });

      /**
       * Property draft
       *
       * @description
       * Signal Forms field tree bound to the editor.
       *
       * @type {FieldTree<{ text: string; }>}
       * @readonly
       */
      public readonly draft: FieldTree<{ text: string }> = form(this.model, (path) => {
        required(path.text);
      });
      // #endregion
    }

    it('binds the field value and its required state', async () => {
      const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      await settle();
      const host: HTMLElement = fixture.nativeElement as HTMLElement;
      const surface: HTMLElement = textbox(host, 'Description');
      expect(surface.getAttribute('aria-required')).toBe('true');

      typeText(surface, 'Contexte');
      await fixture.whenStable();
      expect(fixture.componentInstance.model().text).toBe('Contexte');
      fixture.destroy();
    });
  });
});
