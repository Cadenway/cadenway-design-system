import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { of } from 'rxjs';

import { CwBlockEditor } from './block-editor.component';
import type { CwMentionPerson, CwMentionSearch } from './block-editor.types';

/* jsdom has no layout: the engine measures the caret when it scrolls it into view, Floating UI
   watches sizes. These stand-ins only answer with empty boxes. */
beforeAll(() => {
  const empty = (): DOMRect => new DOMRect(0, 0, 0, 0);
  Range.prototype.getBoundingClientRect = empty;
  Range.prototype.getClientRects = () => document.createElement('div').getClientRects();
  Element.prototype.scrollIntoView = () => undefined;
  document.elementFromPoint = () => null;
  if (!('ResizeObserver' in globalThis))
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: class {
        observe(): void {
          /* no layout in jsdom */
        }
        unobserve(): void {
          /* no layout in jsdom */
        }
        disconnect(): void {
          /* no layout in jsdom */
        }
      },
    });
});

const PEOPLE: CwMentionPerson[] = [
  { id: 'u-1', name: 'Karim Benali', role: 'Développement' },
  { id: 'u-2', name: 'Inès Duval', role: 'Design' },
  { id: 'u-3', name: 'Léa Martin', role: 'Produit' },
];

function settle(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function textbox(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('[role="textbox"]')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No textbox named ${name}`);
  return found;
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  const found = Array.from(host.querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

/* Typing in jsdom: ProseMirror reads typed characters from DOM mutations, which jsdom cannot
   produce from key events; a paste of plain text goes through the same transaction path (and
   the « / » and « @ » menus). */
function typeText(target: HTMLElement, text: string): void {
  const event = new Event('paste', { bubbles: true, cancelable: true });
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

/** The text assistive technologies read: without the parts hidden from them. */
function spokenText(element: Element): string {
  const copy = element.cloneNode(true) as Element;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => {
    hidden.remove();
  });
  return copy.textContent.replace(/\s+/g, ' ').trim();
}

function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  );
}

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
  readonly text = signal('');
  readonly off = signal(false);
  sent = 0;
  readonly search: CwMentionSearch = (query) =>
    of(PEOPLE.filter((person) => person.name.toLowerCase().includes(query.toLowerCase())));
}

describe('CwBlockEditor', () => {
  describe('with a model', () => {
    let fixture: ComponentFixture<ModelHost>;
    let host: HTMLElement;
    let component: ModelHost;

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
      const surface = await start('# Plan\n\nTexte **gras** et __souligné__.');
      expect(surface.getAttribute('aria-multiline')).toBe('true');
      expect(surface.getAttribute('contenteditable')).toBe('true');
      expect(surface.querySelector('h1')?.textContent).toBe('Plan');
      expect(surface.querySelector('strong')?.textContent).toBe('gras');
      expect(surface.querySelector('u')?.textContent).toBe('souligné');
    });

    it('follows a value set from outside', async () => {
      const surface = await start('Avant');
      component.text.set('- un\n- deux');
      await fixture.whenStable();
      expect(surface.querySelectorAll('li')).toHaveLength(2);
    });

    it('writes typed text back to the model', async () => {
      const surface = await start('');
      typeText(surface, 'Bonjour');
      await fixture.whenStable();
      expect(component.text()).toBe('Bonjour');
    });

    it('toggles marks from the toolbar and writes underline as __text__', async () => {
      const surface = await start('relire');
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
      const surface = await start('relire');
      press(surface, 'a', { ctrlKey: true });
      press(surface, 'i', { ctrlKey: true });
      await fixture.whenStable();
      expect(component.text()).toBe('*relire*');
    });

    it('opens the block menu with « / » and inserts the chosen block', async () => {
      const surface = await start('');
      typeText(surface, '/');
      await fixture.whenStable();
      await settle();

      const listbox = host.querySelector<HTMLElement>('[role="listbox"]');
      expect(listbox).not.toBeNull();
      expect(listbox?.getAttribute('aria-labelledby')).toBeTruthy();
      const titleId = listbox?.getAttribute('aria-labelledby') ?? '';
      expect(host.querySelector(`[id="${titleId}"]`)?.textContent.trim()).toBe('Blocs');
      const options = Array.from(listbox?.querySelectorAll('[role="option"]') ?? []);
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
      const surface = await start('');
      typeText(surface, '/cit');
      await fixture.whenStable();
      await settle();
      const options = Array.from(host.querySelectorAll('[role="option"]'));
      expect(options.map((option) => option.textContent.trim())).toEqual(['Citation>']);
    });

    it('closes the block menu with Escape and keeps the text', async () => {
      const surface = await start('');
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
      const surface = await start('');
      typeText(surface, 'Merci @in');
      await fixture.whenStable();
      await settle(200);
      await fixture.whenStable();

      const options = Array.from(host.querySelectorAll('[role="option"]'));
      expect(options.map(spokenText)).toEqual(['Inès Duval, Design', 'Léa Martin, Produit']);
      press(surface, 'Enter');
      await fixture.whenStable();
      expect(component.text()).toBe('Merci @[Inès Duval](u-2)');
      expect(surface.querySelector('[data-mention]')?.textContent).toBe('@Inès Duval');
      const editor = fixture.debugElement.children[0].componentInstance as CwBlockEditor;
      expect(editor.mentions()).toEqual(['u-2']);
    });

    it('emits ctrlEnter on Ctrl + Entrée without adding a line', async () => {
      const surface = await start('Prêt');
      press(surface, 'Enter', { ctrlKey: true });
      await fixture.whenStable();
      expect(component.sent).toBe(1);
      expect(component.text()).toBe('Prêt');
    });

    it('is read-only when disabled', async () => {
      const surface = await start('Texte');
      component.off.set(true);
      await fixture.whenStable();
      expect(surface.getAttribute('contenteditable')).toBe('false');
      expect(surface.getAttribute('aria-disabled')).toBe('true');
      expect(button(host, 'Gras').disabled).toBe(true);
    });
  });

  describe('with Reactive Forms', () => {
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
      readonly control = new FormControl('Texte **initial**', { nonNullable: true });
    }

    it('reads, writes and disables through the control', async () => {
      const fixture = TestBed.createComponent(ReactiveHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      await settle();
      const host = fixture.nativeElement as HTMLElement;
      const surface = textbox(host, 'Description');
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

  describe('with Signal Forms', () => {
    @Component({
      imports: [CwBlockEditor, FormField],
      template: `<cw-block-editor ariaLabel="Description" [formField]="draft.text" />`,
    })
    class SignalHost {
      readonly model = signal({ text: '' });
      readonly draft = form(this.model, (path) => {
        required(path.text);
      });
    }

    it('binds the field value and its required state', async () => {
      const fixture = TestBed.createComponent(SignalHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      await settle();
      const host = fixture.nativeElement as HTMLElement;
      const surface = textbox(host, 'Description');
      expect(surface.getAttribute('aria-required')).toBe('true');

      typeText(surface, 'Contexte');
      await fixture.whenStable();
      expect(fixture.componentInstance.model().text).toBe('Contexte');
      fixture.destroy();
    });
  });
});
