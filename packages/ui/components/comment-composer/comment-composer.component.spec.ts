import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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

function settle(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function byName(host: HTMLElement, selector: string, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>(selector)).find(
    (element) => element.getAttribute('aria-label') === name || element.textContent.trim() === name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

function textbox(host: HTMLElement): HTMLElement {
  return byName(host, '[role="textbox"]', 'Commentaire');
}

function button(host: HTMLElement, name: string): HTMLButtonElement {
  return byName(host, 'button', name) as HTMLButtonElement;
}

function paste(target: HTMLElement, text: string, files: File[] = []): void {
  const event = new Event('paste', { bubbles: true, cancelable: true });
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

function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  );
}

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
  readonly draft = signal('');
  readonly files = signal<readonly CwAttachmentDraft[]>([]);
  readonly variant = signal<CwCommentComposerVariant>('full');
  readonly mode = signal<CwCommentComposerMode>('create');
  readonly search = signal<CwMentionSearch | null>(null);
  readonly sending = signal(false);
  readonly error = signal<string | null>(null);
  readonly off = signal(false);
  readonly submitted: CwCommentSubmit[] = [];
  readonly added: File[][] = [];
  readonly removed: string[] = [];
  cancelled = 0;
  retried = 0;
}

describe('CwCommentComposer', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

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

    component.files.update((files) =>
      files.map((file) => (file.id === 'f2' ? { ...file, state: 'done' as const } : file)),
    );
    await fixture.whenStable();
    button(host, 'Envoyer').click();
    expect(component.submitted[0].attachments).toEqual(['f1', 'f2']);

    button(host, 'Retirer capture-excel.png').click();
    await fixture.whenStable();
    expect(component.removed).toEqual(['f1']);
    expect(component.files().map((file) => file.id)).toEqual(['f2']);
  });

  it('emits filesAdded for pasted files', async () => {
    await start();
    const file = new File(['a;b'], 'export.csv', { type: 'text/csv' });
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
    const alert = host.querySelector('[role="alert"]');
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
    const send = button(host, 'Envoyer');
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

  describe('with Reactive Forms', () => {
    @Component({
      imports: [CwCommentComposer, ReactiveFormsModule],
      template: `<cw-comment-composer [formControl]="control" />`,
    })
    class ReactiveHost {
      readonly control = new FormControl('Brouillon', { nonNullable: true });
    }

    it('reads and writes the control value', async () => {
      const reactive = TestBed.createComponent(ReactiveHost);
      reactive.autoDetectChanges();
      await reactive.whenStable();
      await settle();
      const element = reactive.nativeElement as HTMLElement;
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
