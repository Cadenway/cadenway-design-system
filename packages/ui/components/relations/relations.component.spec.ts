import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwRelationLeading } from './relation-leading/relation-leading.directive';
import { CwRelationPicker } from './relation-picker/relation-picker.component';
import { CwRelations } from './relations.component';
import type {
  CwRelation,
  CwRelationAddEvent,
  CwRelationChangeTypeEvent,
  CwRelationItem,
  CwRelationType,
} from './relations.types';

const TYPES: CwRelationType[] = [
  { id: 'parent', label: 'Tâche parente' },
  { id: 'blocked-by', label: 'Bloquée par' },
  { id: 'blocks', label: 'Bloque' },
  { id: 'related', label: 'Liée à' },
];

function named(root: ParentNode, selector: string, name: string): HTMLElement {
  const found = Array.from(root.querySelectorAll<HTMLElement>(selector)).find(
    (element) =>
      (element.getAttribute('aria-label') ?? element.textContent.replace(/\s+/g, ' ').trim()) ===
      name,
  );
  if (!found) throw new Error(`No ${selector} named ${name}`);
  return found;
}

@Component({
  imports: [CwRelations, CwRelationLeading],
  template: `
    <cw-relations
      [relations]="relations()"
      [types]="types"
      [results]="results"
      [readonly]="readonly()"
      (add)="added.set($event)"
      (remove)="removed.set($event)"
      (changeType)="retyped.set($event)"
      (open)="opened.set($event)"
      (search)="query.set($event)"
    >
      <ng-template cwRelationLeading let-item>
        <span role="img" [attr.aria-label]="'Statut de ' + item.title"></span>
      </ng-template>
    </cw-relations>
  `,
})
class Host {
  readonly types = TYPES;
  readonly relations = signal<CwRelation[]>([
    {
      id: 'r1',
      type: 'blocked-by',
      item: { id: 't471', reference: 'CAD-471', title: 'Migrer les pièces jointes' },
      warning: 'Non terminée',
    },
    {
      id: 'r2',
      type: 'related',
      item: {
        id: 's2291',
        reference: 'SUP-2291',
        title: 'Export illisible dans Excel',
        path: 'Support › Tickets',
        href: '/support/SUP-2291',
      },
    },
    {
      id: 'r3',
      type: 'parent',
      item: { id: 't470', reference: 'CAD-470', title: 'Refonte des exports' },
    },
  ]);
  readonly results: CwRelationItem[] = [
    { id: 't488', reference: 'CAD-488', title: 'Importer les espaces' },
    { id: 't471', reference: 'CAD-471', title: 'Migrer les pièces jointes' },
  ];
  readonly readonly = signal(false);
  readonly added = signal<CwRelationAddEvent | null>(null);
  readonly removed = signal<CwRelation | null>(null);
  readonly retyped = signal<CwRelationChangeTypeEvent | null>(null);
  readonly opened = signal<CwRelationItem | null>(null);
  readonly query = signal('');
}

describe('CwRelations', () => {
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

  it('groups the relations by type in the given order, without empty groups', () => {
    const groups = Array.from(host.querySelectorAll('[role="group"]')).map((group) =>
      document
        .getElementById(group.getAttribute('aria-labelledby') ?? '')
        ?.firstChild?.textContent?.trim(),
    );
    expect(groups).toEqual(['Tâche parente', 'Bloquée par', 'Liée à']);
    expect(host.textContent).toContain('Non terminée');
    expect(host.textContent).toContain('Support › Tickets');
    expect(
      host.querySelector('[role="img"][aria-label^="Statut"]')?.getAttribute('aria-label'),
    ).toBe('Statut de Refonte des exports');
  });

  it('opens a related item from its title, a link when it has an address', () => {
    named(host, 'button', 'Migrer les pièces jointes').click();
    expect(component.opened()?.id).toBe('t471');

    const link = named(host, 'a', 'Export illisible dans Excel');
    expect(link.getAttribute('href')).toBe('/support/SUP-2291');
  });

  it('removes a relation with Delete on its title', () => {
    named(host, 'button', 'Refonte des exports').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }),
    );

    expect(component.removed()?.id).toBe('r3');
  });

  it('changes the type and removes from the row menu', async () => {
    named(host, 'button', 'Actions de la relation CAD-471').click();
    await fixture.whenStable();
    named(document.body, '[role="menuitem"]', 'Changer le type').click();
    await fixture.whenStable();
    named(document.body, '[role="menuitem"]', 'Bloque').click();
    await fixture.whenStable();

    expect(component.retyped()).toEqual({ relation: component.relations()[0], type: 'blocks' });
  });

  it('adds a relation from the picker: a type, then a search result', async () => {
    named(host, 'button', 'Ajouter').click();
    await fixture.whenStable();
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-label')).toBe('Ajouter une relation');

    const search = named(document.body, '[role="combobox"]', 'Rechercher une tâche');
    search.click();
    await fixture.whenStable();
    const options = Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]'));
    const linked = options.find((option) => option.textContent.includes('Migrer'));
    expect(linked?.getAttribute('aria-disabled')).toBe('true');
    expect(linked?.textContent).toContain('Déjà liée');
    options.find((option) => option.textContent.includes('Importer'))?.click();
    await fixture.whenStable();

    expect(component.added()).toEqual({ type: 'parent', item: component.results[0] });
  });

  it('writes the empty state and hides the addition when read-only', async () => {
    component.relations.set([]);
    await fixture.whenStable();
    expect(host.textContent).toContain('Aucune relation.');
    expect(named(host, 'button', 'Ajouter une relation')).toBeTruthy();

    component.readonly.set(true);
    await fixture.whenStable();
    expect(Array.from(host.querySelectorAll('button')).length).toBe(0);
  });
});

describe('CwRelationPicker', () => {
  it('proposes the default type', async () => {
    @Component({
      imports: [CwRelationPicker],
      template: `<cw-relation-picker [types]="types" defaultType="blocks" />`,
    })
    class PickerHost {
      readonly types = TYPES;
    }

    const fixture = TestBed.createComponent(PickerHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[role="combobox"]')?.textContent).toContain('Bloque');
  });
});
