import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CwCardAction } from './card-action/card-action.component';
import { CwCardContent } from './card-content/card-content.component';
import { CwCardDescription } from './card-description/card-description.component';
import { CwCardFooter } from './card-footer/card-footer.component';
import { CwCardHeader } from './card-header/card-header.component';
import { CwCardTitle } from './card-title/card-title.component';
import { CwCard } from './card.component';

@Component({
  imports: [
    CwCard,
    CwCardHeader,
    CwCardTitle,
    CwCardDescription,
    CwCardAction,
    CwCardContent,
    CwCardFooter,
  ],
  template: `
    <cw-card>
      <cw-card-header>
        <cw-card-title>Membres de l'espace</cw-card-title>
        <cw-card-description>4 personnes ont accès à Produit.</cw-card-description>
        <cw-card-action><button type="button">Inviter</button></cw-card-action>
      </cw-card-header>
      <cw-card-content>Léa Martin</cw-card-content>
      <cw-card-footer><a href="/acces">Gérer les accès</a></cw-card-footer>
    </cw-card>
    <cw-card size="sm" interactive [selected]="selected()" (click)="opened.set(true)">
      Espace Produit
    </cw-card>
    <div role="listbox" aria-label="Espaces">
      <cw-card role="option" size="sm" interactive [selected]="selected()">Espace Design</cw-card>
    </div>
  `,
})
class Host {
  readonly selected = signal(false);
  readonly opened = signal(false);
}

function card(host: HTMLElement, text: string): HTMLElement {
  const found = Array.from(host.querySelectorAll<HTMLElement>('cw-card')).find((element) =>
    element.textContent.includes(text),
  );
  if (!found) throw new Error(`No card containing ${text}`);
  return found;
}

describe('CwCard', () => {
  it('lays out its parts and leaves a static card out of the tab order', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const members = card(host, "Membres de l'espace");

    expect(members.getAttribute('tabindex')).toBeNull();
    expect(members.querySelector('button')?.textContent).toBe('Inviter');
    expect(members.querySelector('a')?.getAttribute('href')).toBe('/acces');
  });

  it('becomes a tab stop that reports clicks when interactive', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const space = card(fixture.nativeElement as HTMLElement, 'Espace Produit');

    space.click();

    expect(space.getAttribute('tabindex')).toBe('0');
    expect(space.dataset['size']).toBe('sm');
    expect(fixture.componentInstance.opened()).toBe(true);
  });

  it('announces the selection only on a role that allows aria-selected', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.selected.set(true);
    await fixture.whenStable();

    const plain = card(host, 'Espace Produit');
    const option = host.querySelector('[role="option"]');

    expect(plain.getAttribute('aria-selected')).toBeNull();
    expect(plain.hasAttribute('data-selected')).toBe(true);
    expect(option?.getAttribute('aria-selected')).toBe('true');
  });
});
