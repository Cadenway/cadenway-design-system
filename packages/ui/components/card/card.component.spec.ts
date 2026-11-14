import { Component, signal, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { CwCardAction } from './card-action/card-action.component';
import { CwCardContent } from './card-content/card-content.component';
import { CwCardDescription } from './card-description/card-description.component';
import { CwCardFooter } from './card-footer/card-footer.component';
import { CwCardHeader } from './card-header/card-header.component';
import { CwCardTitle } from './card-title/card-title.component';
import { CwCard } from './card.component';

/**
 * Class Host
 * @class Host
 *
 * @description
 * Test host composing a static card, an interactive card and a selectable listbox option.
 */
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
  // #region Properties
  /**
   * Property selected
   * @readonly
   *
   * @description
   * Selection state shared by the interactive test cards.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly selected: WritableSignal<boolean> = signal(false);

  /**
   * Property opened
   * @readonly
   *
   * @description
   * Records whether the interactive card received a click.
   *
   * @type {WritableSignal<boolean>}
   * @default false
   */
  public readonly opened: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function card
 *
 * @description
 * Finds a card in the test host whose text contains the requested content.
 *
 * @param {HTMLElement} host - Container holding the cards.
 * @param {string} text - Text expected inside the card.
 *
 * @returns {HTMLElement} First matching card host.
 *
 * @throws {Error} When no card contains the requested text.
 */
function card(host: HTMLElement, text: string): HTMLElement {
  const found: HTMLElement | undefined = Array.from(
    host.querySelectorAll<HTMLElement>('cw-card'),
  ).find((element) => element.textContent.includes(text));
  if (!found) throw new Error(`No card containing ${text}`);
  return found;
}

describe('CwCard', () => {
  it('lays out its parts and leaves a static card out of the tab order', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    const members: HTMLElement = card(host, "Membres de l'espace");

    expect(members.getAttribute('tabindex')).toBeNull();
    expect(members.querySelector('button')?.textContent).toBe('Inviter');
    expect(members.querySelector('a')?.getAttribute('href')).toBe('/acces');
  });

  it('becomes a tab stop that reports clicks when interactive', () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const space: HTMLElement = card(fixture.nativeElement as HTMLElement, 'Espace Produit');

    space.click();

    expect(space.getAttribute('tabindex')).toBe('0');
    expect(space.dataset['size']).toBe('sm');
    expect(fixture.componentInstance.opened()).toBe(true);
  });

  it('announces the selection only on a role that allows aria-selected', async () => {
    const fixture: ComponentFixture<Host> = TestBed.createComponent(Host);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.selected.set(true);
    await fixture.whenStable();

    const plain: HTMLElement = card(host, 'Espace Produit');
    const option: Element | null = host.querySelector('[role="option"]');

    expect(plain.getAttribute('aria-selected')).toBeNull();
    expect(plain.hasAttribute('data-selected')).toBe(true);
    expect(option?.getAttribute('aria-selected')).toBe('true');
  });
});
