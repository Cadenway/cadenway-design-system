import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwButton } from './button.component';

@Component({
  imports: [CwButton],
  template: `
    <form (submit)="$event.preventDefault(); submitted.set(true)">
      <button cwButton class="w-full" (click)="clicks.set(clicks() + 1)">Créer une tâche</button>
      <button
        cwButton
        variant="outline"
        size="sm"
        [loading]="saving()"
        (click)="clicks.set(clicks() + 1)"
      >
        Enregistrer
      </button>
      <button cwButton variant="ghost" size="icon-sm" aria-label="Plus d'actions"></button>
      <a cwButton variant="link" href="/aide" disabled>Aide</a>
    </form>
  `,
})
class Host {
  readonly clicks = signal(0);
  readonly saving = signal(false);
  readonly submitted = signal(false);
}

function byName(host: HTMLElement, name: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('button, a')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwButton', () => {
  let host: HTMLElement;
  let component: Host;
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('defaults to a non-submitting button and keeps the layout classes of the consumer', () => {
    const create = byName(host, 'Créer une tâche');
    create.click();

    expect(create.getAttribute('type')).toBe('button');
    expect(component.submitted()).toBe(false);
    expect(component.clicks()).toBe(1);
    expect(create.classList).toContain('w-full');
    expect(create.dataset['variant']).toBe('default');
  });

  it('ignores clicks while loading and stays focusable', async () => {
    component.saving.set(true);
    await fixture.whenStable();
    const save = byName(host, 'Enregistrer');

    save.click();

    expect(component.clicks()).toBe(0);
    expect(save.getAttribute('aria-busy')).toBe('true');
    expect((save as HTMLButtonElement).disabled).toBe(false);
  });

  it('disables a link through aria-disabled and the tab order', () => {
    const help = byName(host, 'Aide');

    expect(help.getAttribute('aria-disabled')).toBe('true');
    expect(help.getAttribute('tabindex')).toBe('-1');
  });

  it('names an icon button by its aria-label', () => {
    expect(byName(host, "Plus d'actions").dataset['size']).toBe('icon-sm');
  });
});
