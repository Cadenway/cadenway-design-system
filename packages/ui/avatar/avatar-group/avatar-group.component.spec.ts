import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwAvatarAdd } from '../avatar-add/avatar-add.component';
import { CwAvatarGroup } from './avatar-group.component';
import { CwAvatar } from '../avatar.component';

interface Person {
  readonly id: number;
  readonly name: string;
}

@Component({
  imports: [CwAvatar, CwAvatarGroup, CwAvatarAdd],
  template: `
    <cw-avatar-group [max]="3">
      @for (person of team(); track person.id) {
        <cw-avatar [name]="person.name" />
      } @empty {
        <!-- The brick names itself (« Assigner ») and draws its own icon. -->
        <!-- eslint-disable-next-line @angular-eslint/template/elements-content -->
        <button cwAvatarAdd (click)="picks.set(picks() + 1)"></button>
      }
    </cw-avatar-group>
  `,
})
class Host {
  readonly picks = signal(0);
  readonly team = signal<Person[]>([
    { id: 1, name: 'Inès Duval' },
    { id: 2, name: 'Léa Martin' },
    { id: 3, name: 'Karim Benali' },
    { id: 4, name: 'Samuel Roux' },
  ]);
}

describe('CwAvatarGroup', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  function group(): HTMLElement {
    const found = host.querySelector<HTMLElement>('[role="group"][aria-label="Assignés"]');
    if (!found) throw new Error('No Assignés group');
    return found;
  }

  it('shows three avatars, then « +N » named by the hidden people', () => {
    const stacked = Array.from(group().querySelectorAll<HTMLElement>('cw-avatar'));

    expect(stacked.filter((avatar) => !avatar.hidden)).toHaveLength(3);
    expect(stacked[3]?.hidden).toBe(true);
    expect(stacked[0]?.dataset['size']).toBe('sm');
    expect(group().textContent).toContain('+1');
    expect(group().textContent).toContain('et Samuel Roux');
  });

  it('drops « +N » when everyone fits and offers « Assigner » when nobody is assigned', async () => {
    component.team.set([{ id: 1, name: 'Inès Duval' }]);
    await fixture.whenStable();
    expect(group().textContent).not.toContain('+');

    component.team.set([]);
    await fixture.whenStable();
    const add = group().querySelector<HTMLButtonElement>('button[aria-label="Assigner"]');
    add?.click();

    expect(add?.getAttribute('type')).toBe('button');
    expect(component.picks()).toBe(1);
  });
});
