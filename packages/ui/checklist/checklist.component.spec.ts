import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwChecklistAdd } from './checklist-add/checklist-add.component';
import { CwChecklist } from './checklist.component';
import type { CwChecklistAddEvent, CwChecklistMoveEvent } from './checklist.types';
import { CwChecklistItem } from './checklist-item/checklist-item.component';

interface Row {
  id: string;
  label: string;
  done: boolean;
  children: Row[];
}

function byName(host: HTMLElement, selector: string, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>(selector)).find(
    (element) =>
      (element.getAttribute('aria-label') ?? element.textContent.replace(/\s+/g, ' ').trim()) ===
      name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

function key(target: HTMLElement, name: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
}

@Component({
  imports: [CwChecklist, CwChecklistItem, CwChecklistAdd],
  template: `
    <cw-checklist
      title="Critères d'acceptation"
      [readonly]="readonly()"
      [(expanded)]="expanded"
      [(hideCompleted)]="hideDone"
      (itemAdd)="added.set($event)"
      (itemMove)="moves.set([...moves(), $event])"
    >
      @for (item of items(); track item.id) {
        <cw-checklist-item
          [itemId]="item.id"
          [label]="item.label"
          [(checked)]="item.done"
          (labelChange)="renamed.set($event)"
        >
          @for (child of item.children; track child.id) {
            <cw-checklist-item [itemId]="child.id" [label]="child.label" [(checked)]="child.done" />
          }
        </cw-checklist-item>
      }
      <cw-checklist-add />
    </cw-checklist>
  `,
})
class Host {
  readonly items = signal<Row[]>([
    { id: 'a', label: 'Les accents sont conservés dans Excel', done: true, children: [] },
    {
      id: 'b',
      label: 'Tester 10 000 lignes',
      done: false,
      children: [{ id: 'b1', label: 'Excel 365', done: true, children: [] }],
    },
    { id: 'c', label: 'Prévenir les clients concernés', done: false, children: [] },
  ]);
  readonly readonly = signal(false);
  readonly expanded = signal(true);
  readonly hideDone = signal(false);
  readonly added = signal<CwChecklistAddEvent | null>(null);
  readonly moves = signal<CwChecklistMoveEvent[]>([]);
  readonly renamed = signal<string | null>(null);
}

describe('CwChecklist', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('counts the ticked items in the header and the progress bar', async () => {
    const progress = host.querySelector('[role="progressbar"]');
    expect(progress?.getAttribute('aria-label')).toBe("Avancement de « Critères d'acceptation »");
    expect(progress?.getAttribute('aria-valuetext')).toBe('2 sur 4');
    expect(host.textContent).toContain('2 / 4');

    byName(host, '[role="checkbox"]', 'Tester 10 000 lignes').click();
    await fixture.whenStable();

    expect(component.items()[1]?.done).toBe(true);
    expect(progress?.getAttribute('aria-valuetext')).toBe('3 sur 4');
  });

  it('names the list by its title and nests the sub-items in a list of their own', () => {
    const list = host.querySelector('ul[aria-labelledby]');
    const title = document.getElementById(list?.getAttribute('aria-labelledby') ?? '');
    expect(title?.textContent.trim()).toBe("Critères d'acceptation");
    expect(host.querySelector('[role="listitem"] [role="listitem"]')?.textContent).toContain(
      'Excel 365',
    );
  });

  it('folds and unfolds the body from its title', async () => {
    const trigger = byName(host, 'button', "Critères d'acceptation");
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    trigger.click();
    await fixture.whenStable();

    expect(component.expanded()).toBe(false);
    expect(host.querySelector('cw-checklist')?.getAttribute('data-state')).toBe('closed');
  });

  it('hides the ticked items and offers to show them back', async () => {
    const toggle = byName(host, 'button', 'Masquer les éléments terminés');
    toggle.click();
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    const hidden = Array.from(host.querySelectorAll('[role="listitem"][hidden]'));
    expect(hidden).toHaveLength(2);

    byName(host, 'button', 'Afficher les 2 éléments terminés').click();
    await fixture.whenStable();
    expect(component.hideDone()).toBe(false);
  });

  it('adds an item with Enter and keeps the field open', async () => {
    byName(host, 'button', 'Ajouter un élément').click();
    await fixture.whenStable();
    const field = byName(host, 'input', 'Nouvel élément de checklist') as HTMLInputElement;
    expect(document.activeElement).toBe(field);

    field.value = 'Documenter le format dans l’aide';
    key(field, 'Enter');
    await fixture.whenStable();

    expect(component.added()).toEqual({ label: 'Documenter le format dans l’aide' });
    expect(field.value).toBe('');
    expect(field.isConnected).toBe(true);
  });

  it('edits a label from F2 on its box and emits the new label', async () => {
    key(byName(host, '[role="checkbox"]', 'Prévenir les clients concernés'), 'F2');
    await fixture.whenStable();
    const field = byName(host, 'input', "Modifier l'élément") as HTMLInputElement;
    expect(document.activeElement).toBe(field);

    field.value = 'Prévenir les clients';
    field.dispatchEvent(new Event('input'));
    key(field, 'Enter');
    await fixture.whenStable();

    expect(component.renamed()).toBe('Prévenir les clients');
  });

  it('moves an item with the keyboard from its handle, and nests it', async () => {
    const handle = byName(host, 'button', 'Déplacer « Prévenir les clients concernés »');
    key(handle, ' ');
    key(handle, 'ArrowUp');
    await fixture.whenStable();

    expect(component.moves()).toEqual([{ id: 'c', index: 1, parentId: null }]);

    key(handle, 'ArrowRight');
    await fixture.whenStable();
    expect(component.moves().at(-1)).toEqual({ id: 'c', index: 1, parentId: 'b' });
  });

  it('has no handle, menu nor add row when read-only', async () => {
    component.readonly.set(true);
    await fixture.whenStable();

    expect(host.querySelectorAll('[aria-label^="Déplacer"]')).toHaveLength(0);
    expect(host.querySelectorAll('[aria-label^="Actions de"]')).toHaveLength(0);
    expect(host.querySelector('cw-checklist-add')?.hasAttribute('hidden')).toBe(true);
  });
});
