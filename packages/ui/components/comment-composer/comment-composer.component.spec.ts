import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, type FieldTree } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import type { CwMentionSearch } from '@cadenway/ui/components/block-editor';
import { of } from 'rxjs';

import { CwCommentComposer } from './comment-composer.component';
import type {
  CwAttachmentDraft,
  CwCommentComposerMode,
  CwCommentComposerVariant,
  CwCommentSubmit,
} from './comment-composer.types';

/* jsdom has no layout: the editor engine measures the caret when it scrolls it into view, Floating
   UI watches sizes. These stand-ins only answer with empty boxes. */
beforeAll(() => {
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
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
 * Function settle
 *
 * @description
 * Waits for the editor and its asynchronous updates to settle.
 *
 * @param {number} ms - Delay in milliseconds before resolving.
 * @returns {Promise<void>} Promise resolved after the requested delay.
 */
function settle(ms: number = 0): Promise<void> {
  return new Promise((resolve: (value: void | PromiseLike<void>) => void) =>
    setTimeout(resolve, ms),
  );
}

/**
 * Function byName
 *
 * @description
 * Finds a fixture element by selector and accessible name or text.
 *
 * @param {HTMLElement} host - Fixture containing the requested element.
 * @param {string} selector - CSS selector used to find candidates.
 * @param {string} name - Accessible name or text to match.
 * @returns {HTMLElement} Matching fixture element.
 */
function byName(host: HTMLElement, selector: string, name: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>(selector),
  ).find(
    (element: HTMLElement) =>
      element.getAttribute('aria-label') === name || element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

/**
 * Function textbox
 *
 * @description
 * Finds the editor textbox in the fixture.
 *
 * @param {HTMLElement} host - Fixture containing the requested element.
 * @returns {HTMLElement} Editor textbox.
 */
function textbox(host: HTMLElement): HTMLElement {
  return byName(host, '[role="textbox"]', 'Commentaire');
}

/**
 * Function button
 *
 * @description
 * Finds a button by accessible name.
 *
 * @param {HTMLElement} host - Fixture containing the requested element.
 * @param {string} name - Accessible name or text to match.
 * @returns {HTMLButtonElement} Matching button.
 */
function button(host: HTMLElement, name: string): HTMLButtonElement {
  return byName(host, 'button', name) as HTMLButtonElement;
}

/**
 * Function paste
 *
 * @description
 * Dispatches a paste event with text and optional files.
 *
 * @param {HTMLElement} target - Element receiving the event.
 * @param {string} text - Text supplied by the simulated paste.
 * @param {File[]} files - Files supplied by the simulated paste.
 */
function paste(target: HTMLElement, text: string, files: File[] = []): void {
  const event: Event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
      types: files.length ? ['Files'] : ['text/plain'],
      files,
      items: [],
    },
  });
  target.dispatchEvent(event);
}

/**
 * Function press
 *
 * @description
 * Dispatches a keyboard event to a fixture element.
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
 * Component Host
 *
 * @description
 * Hosts the composer with configurable inputs and captured outputs.
 */
@Component({
  imports: [CwCommentComposer],
  template: `
    <cw-comment-composer
      [(value)]="draft"
      [(attachments)]="files"
      [variant]="variant()"
      [mode]="mode()"
      [mentionSearch]="search()"
      [sending]="sending()"
      [error]="error()"
      [disabled]="off()"
      (submit)="submitted.push($event)"
      (cancel)="cancelled = cancelled + 1"
      (retry)="retried = retried + 1"
      (filesAdded)="added.push($event)"
      (attachmentRemove)="removed.push($event)"
    />
  `,
})
class Host {
  // #region Properties
  /**
   * Property draft
   *
   * @description
   * Markdown draft controlled by the fixture.
   *
   * @type {WritableSignal<string>}
   * @readonly
   */
  public readonly draft: WritableSignal<string> = signal('');

  /**
   * Property files
   *
   * @description
   * Attachment drafts controlled by the fixture.
   *
   * @type {WritableSignal<readonly CwAttachmentDraft[]>}
   * @readonly
   */
  public readonly files: WritableSignal<readonly CwAttachmentDraft[]> = signal<
    readonly CwAttachmentDraft[]
  >([]);

  /**
   * Property variant
   *
   * @description
   * Composer variant used by the fixture.
   *
   * @type {WritableSignal<CwCommentComposerVariant>}
   * @readonly
   */
  public readonly variant: WritableSignal<CwCommentComposerVariant> =
    signal<CwCommentComposerVariant>('full');

  /**
   * Property mode
   *
   * @description
   * Composer mode used by the fixture.
   *
   * @type {WritableSignal<CwCommentComposerMode>}
   * @readonly
   */
  public readonly mode: WritableSignal<CwCommentComposerMode> =
    signal<CwCommentComposerMode>('create');

  /**
   * Property search
   *
   * @description
   * Optional mention-search function used by the fixture.
   *
   * @type {WritableSignal<CwMentionSearch | null>}
   * @readonly
   */
  public readonly search: WritableSignal<CwMentionSearch | null> = signal<CwMentionSearch | null>(
    null,
  );

  /**
   * Property sending
   *
   * @description
   * Whether the fixture simulates a send in progress.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly sending: WritableSignal<boolean> = signal(false);

  /**
   * Property error
   *
   * @description
   * Optional simulated send error.
   *
   * @type {WritableSignal<string | null>}
   * @readonly
   */
  public readonly error: WritableSignal<string | null> = signal<string | null>(null);

  /**
   * Property off
   *
   * @description
   * Whether the composer is disabled.
   *
   * @type {WritableSignal<boolean>}
   * @readonly
   */
  public readonly off: WritableSignal<boolean> = signal(false);

  /**
   * Property submitted
   *
   * @description
   * Submitted comments captured by the fixture.
   *
   * @type {CwCommentSubmit[]}
   * @readonly
   */
  public readonly submitted: CwCommentSubmit[] = [];

  /**
   * Property added
   *
   * @description
   * File batches reported by the composer.
   *
   * @type {File[][]}
   * @readonly
   */
  public readonly added: File[][] = [];

  /**
   * Property removed
   *
   * @description
   * Identifiers of removed attachments.
   *
   * @type {string[]}
   * @readonly
   */
  public readonly removed: string[] = [];

  /**
   * Property cancelled
   *
   * @description
   * Number of cancel events captured by the fixture.
   *
   * @type {number}
   */
  public cancelled: number = 0;

  /**
   * Property retried
   *
   * @description
   * Number of retry events captured by the fixture.
   *
   * @type {number}
   */
  public retried: number = 0;
  // #endregion
}

describe('CwCommentComposer', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  /**
   * Function start
   *
   * @description
   * Starts change detection and waits for the fixture to settle.
   * @returns {Promise<void>} Promise resolved when the fixture has settled.
   */
  async function start(): Promise<void> {
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await settle();
    await fixture.whenStable();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('shows the full toolbar and keeps Envoyer disabled while the text is empty', async () => {
    await start();
    expect(textbox(host).getAttribute('aria-multiline')).toBe('true');
    expect(host.querySelector('[role="toolbar"]')?.getAttribute('aria-label')).toBe(
      'Mise en forme',
    );
    for (const name of ['Gras', 'Italique', 'Lien', 'Liste à puces', 'Code', 'Joindre un fichier'])
      expect(button(host, name)).toBeTruthy();
    expect(() => button(host, 'Mentionner une personne')).toThrow();
    expect(button(host, 'Envoyer').disabled).toBe(true);
    expect(host.querySelector('cw-comment-composer')?.hasAttribute('data-empty')).toBe(true);
  });

  it('sends the Markdown with Envoyer and with Ctrl + Entrée', async () => {
    await start();
    paste(textbox(host), 'Correctif prêt');
    await fixture.whenStable();
    expect(component.draft()).toBe('Correctif prêt');
    expect(button(host, 'Envoyer').disabled).toBe(false);

    button(host, 'Envoyer').click();
    press(textbox(host), 'Enter', { ctrlKey: true });
    expect(component.submitted).toEqual([
      { markdown: 'Correctif prêt', mentions: [], attachments: [] },
      { markdown: 'Correctif prêt', mentions: [], attachments: [] },
    ]);
  });

  it('formats the selection from the toolbar', async () => {
    component.draft.set('relire');
    await start();
    press(textbox(host), 'a', { ctrlKey: true });
    button(host, 'Gras').click();
    await fixture.whenStable();
    expect(component.draft()).toBe('**relire**');
    expect(button(host, 'Gras').getAttribute('aria-pressed')).toBe('true');
  });

  it('reports the mentioned people on submit', async () => {
    component.search.set(() => of([{ id: 'karim', name: 'Karim Benali', role: 'Développement' }]));
    await start();
    paste(textbox(host), 'Merci @kar');
    await fixture.whenStable();
    await settle(200);
    await fixture.whenStable();
    press(textbox(host), 'Enter');
    await fixture.whenStable();
    press(textbox(host), 'Enter', { ctrlKey: true });
    expect(component.submitted[0]).toEqual({
      markdown: 'Merci @[Karim Benali](karim)',
      mentions: ['karim'],
      attachments: [],
    });
  });

  it('waits for uploads, sends the uploaded files and removes a file', async () => {
    component.draft.set('Voir les fichiers');
    component.files.set([
      { id: 'f1', name: 'capture-excel.png', fileSize: 319_488, state: 'done' },
      { id: 'f2', name: 'export-sprint-14.csv', state: 'uploading', progress: 64 },
    ]);
    await start();
    expect(host.querySelectorAll('cw-attachment')).toHaveLength(2);
    expect(button(host, 'Envoyer').disabled).toBe(true);

    component.files.update((files: readonly CwAttachmentDraft[]) =>
      files.map((file: CwAttachmentDraft) =>
        file.id === 'f2' ? { ...file, state: 'done' as const } : file,
      ),
    );
    await fixture.whenStable();
    button(host, 'Envoyer').click();
    expect(component.submitted[0].attachments).toEqual(['f1', 'f2']);

    button(host, 'Retirer capture-excel.png').click();
    await fixture.whenStable();
    expect(component.removed).toEqual(['f1']);
    expect(component.files().map((file: CwAttachmentDraft) => file.id)).toEqual(['f2']);
  });

  it('emits filesAdded for pasted files', async () => {
    await start();
    const file: File = new File(['a;b'], 'export.csv', { type: 'text/csv' });
    paste(textbox(host), '', [file]);
    expect(component.added).toEqual([[file]]);
  });

  it('saves or cancels in edit mode, Échap cancelling', async () => {
    component.mode.set('edit');
    component.draft.set('L’export garde les accents.');
    await start();
    expect(() => button(host, 'Envoyer')).toThrow();
    button(host, 'Enregistrer').click();
    expect(component.submitted[0].markdown).toBe('L’export garde les accents.');

    button(host, 'Annuler').click();
    press(textbox(host), 'Escape');
    expect(component.cancelled).toBe(2);
  });

  it('shows a send failure with Réessayer and keeps the text', async () => {
    component.draft.set('Peux-tu relire ?');
    component.error.set('Envoi impossible : connexion perdue. Votre texte est conservé.');
    await start();
    const alert: Element | null = host.querySelector('[role="alert"]');
    expect(alert?.textContent.trim()).toBe(
      'Envoi impossible : connexion perdue. Votre texte est conservé.',
    );
    expect(textbox(host).getAttribute('aria-invalid')).toBe('true');
    expect(textbox(host).getAttribute('aria-describedby')).toBe(alert?.id);
    button(host, 'Réessayer').click();
    expect(component.retried).toBe(1);
    expect(component.draft()).toBe('Peux-tu relire ?');
  });

  it('shows the spinner of Envoyer while sending and refuses a second send', async () => {
    component.draft.set('Envoi');
    component.sending.set(true);
    await start();
    const send: HTMLButtonElement = button(host, 'Envoyer');
    expect(send.getAttribute('aria-busy')).toBe('true');
    press(textbox(host), 'Enter', { ctrlKey: true });
    expect(component.submitted).toEqual([]);
  });

  it('is one line in compact mode and grows when the text gets the focus', async () => {
    component.variant.set('compact');
    await start();
    expect(host.querySelector('[role="toolbar"]')).toBeNull();
    expect(button(host, 'Joindre un fichier')).toBeTruthy();
    expect(button(host, 'Envoyer').disabled).toBe(true);

    textbox(host).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await fixture.whenStable();
    expect(host.querySelector('[role="toolbar"]')).not.toBeNull();
    expect(host.querySelector('cw-comment-composer')?.hasAttribute('data-expanded')).toBe(true);
  });

  it('shows the disabled text instead of the editor', async () => {
    component.off.set(true);
    await start();
    expect(host.querySelector('[role="textbox"]')).toBeNull();
    expect(host.textContent).toContain('Commentaires désactivés');
    expect(host.querySelector('cw-comment-composer')?.getAttribute('aria-disabled')).toBe('true');
  });

  describe('with template-driven forms', () => {
    /**
     * Component TemplateHost
     *
     * @description
     * Hosts a composer bound through ngModel.
     */
    @Component({
      imports: [CwCommentComposer, FormsModule],
      template: `<cw-comment-composer [(ngModel)]="text" />`,
    })
    class TemplateHost {
      // #region Properties
      /**
       * Property text
       *
       * @description
       * Markdown text synchronized with the composer.
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
      const element: HTMLElement = fixture.nativeElement as HTMLElement;
      const field: HTMLElement = textbox(element);
      const control: NgModel = fixture.debugElement
        .query(By.directive(NgModel))
        .injector.get(NgModel);
      expect(field.textContent).toBe('Initial');
      press(field, 'a', { ctrlKey: true });
      paste(field, 'Updated');
      field.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(fixture.componentInstance.text).toBe('Updated');
      expect(control.touched).toBe(true);
      control.control.disable();
      await fixture.whenStable();
      expect(element.querySelector('cw-comment-composer')?.getAttribute('aria-disabled')).toBe(
        'true',
      );
      fixture.destroy();
    });
  });

  describe('with Signal Forms', () => {
    /**
     * Component SignalHost
     *
     * @description
     * Hosts a composer bound through Signal Forms.
     */
    @Component({
      imports: [CwCommentComposer, FormField],
      template: `<cw-comment-composer [formField]="draft.text" />`,
    })
    class SignalHost {
      // #region Properties
      /**
       * Property model
       *
       * @description
       * Markdown draft synchronized with the composer.
       *
       * @type {WritableSignal<{ text: string }>}
       * @readonly
       */
      public readonly model: WritableSignal<{ text: string }> = signal({ text: 'Initial' });

      /**
       * Property draft
       *
       * @description
       * Signal Forms tree for the draft.
       *
       * @type {FieldTree<{ text: string }>}
       * @readonly
       */
      public readonly draft: FieldTree<{ text: string }> = form(this.model);
      // #endregion
    }

    it('synchronizes the value and touched state', async () => {
      const fixture: ComponentFixture<SignalHost> = TestBed.createComponent(SignalHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      await settle();
      const field: HTMLElement = textbox(fixture.nativeElement as HTMLElement);
      expect(field.textContent).toBe('Initial');
      press(field, 'a', { ctrlKey: true });
      paste(field, 'Updated');
      field.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();
      expect(fixture.componentInstance.model().text).toBe('Updated');
      expect(fixture.componentInstance.draft.text().touched()).toBe(true);
      fixture.destroy();
    });
  });

  describe('with Reactive Forms', () => {
    /**
     * Component ReactiveHost
     *
     * @description
     * Hosts the composer bound to a reactive form control.
     */
    @Component({
      imports: [CwCommentComposer, ReactiveFormsModule],
      template: `<cw-comment-composer [formControl]="control" />`,
    })
    class ReactiveHost {
      // #region Properties
      /**
       * Property control
       *
       * @description
       * Reactive form control bound to the composer.
       *
       * @type {FormControl<string>}
       * @readonly
       */
      public readonly control: FormControl<string> = new FormControl<string>('Brouillon', {
        nonNullable: true,
      });
      // #endregion
    }

    it('reads and writes the control value', async () => {
      const reactive: ComponentFixture<ReactiveHost> = TestBed.createComponent(ReactiveHost);
      reactive.autoDetectChanges();
      await reactive.whenStable();
      await settle();
      const element: HTMLElement = reactive.nativeElement as HTMLElement;
      expect(textbox(element).textContent).toBe('Brouillon');

      press(textbox(element), 'a', { ctrlKey: true });
      paste(textbox(element), 'Nouveau texte');
      await reactive.whenStable();
      expect(reactive.componentInstance.control.value).toBe('Nouveau texte');

      reactive.componentInstance.control.disable();
      await reactive.whenStable();
      expect(element.textContent).toContain('Commentaires désactivés');
      reactive.destroy();
    });
  });
});
