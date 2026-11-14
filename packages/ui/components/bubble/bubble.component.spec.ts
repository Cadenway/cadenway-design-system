import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwBubble } from './bubble.component';
import { CW_BUBBLE_DEFAULTS } from './bubble.token';
import { CwBubbleGroup } from './bubble-group/bubble-group.component';
import { CwBubbleQuote } from './bubble-quote/bubble-quote.component';
import { CwBubbleReaction } from './bubble-reaction/bubble-reaction.component';
import { CwBubbleReactions } from './bubble-reactions/bubble-reactions.component';

/**
 * Class Host
 *
 * @description
 * Hosts bubbles, a quote and reactions for interaction tests.
 */
@Component({
  imports: [CwBubble, CwBubbleGroup, CwBubbleQuote, CwBubbleReaction, CwBubbleReactions],
  template: `
    <cw-bubble id="plain">Correctif en revue.</cw-bubble>
    <cw-bubble id="reply" variant="secondary" align="end" (reactionAdd)="adds.set(adds() + 1)">
      <cw-bubble-quote author="Karim Benali" (navigate)="navigated.set(true)"
        >J'ai reproduit le bug.</cw-bubble-quote
      >
      Bien vu. On force l'UTF-8 avec BOM ?
      <cw-bubble-reactions>
        <button
          cwBubbleReaction
          icon="thumbs-up"
          label="D'accord"
          [count]="2"
          [(pressed)]="liked"
        ></button>
      </cw-bubble-reactions>
    </cw-bubble>
    <cw-bubble id="warning" tone="warning" title="Réponse incomplète">Limite atteinte.</cw-bubble>
    <cw-bubble-group>
      <cw-bubble>La maquette est prête.</cw-bubble>
      <cw-bubble>Vue semaine ajoutée.</cw-bubble>
      <cw-bubble>Retours avant jeudi ?</cw-bubble>
    </cw-bubble-group>
  `,
})
class Host {
  // #region Properties
  /**
   * Property liked
   * @readonly
   *
   * @description
   * Two-way reaction state.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly liked: WritableSignal<boolean> = signal(false);

  /**
   * Property adds
   * @readonly
   *
   * @description
   * Number of reaction picker requests.
   *
   * @type {WritableSignal<number>}
   */
  public readonly adds: WritableSignal<number> = signal(0);

  /**
   * Property navigated
   * @readonly
   *
   * @description
   * Whether quote navigation was requested.
   *
   * @type {WritableSignal<boolean>}
   */
  public readonly navigated: WritableSignal<boolean> = signal(false);
  // #endregion
}

/**
 * Function buttonNamed
 *
 * @description
 * Finds a fixture button by its accessible label or visible text.
 *
 * @param {HTMLElement} host - Fixture containing the button.
 * @param {string} name - Accessible label or visible button text.
 *
 * @returns {HTMLButtonElement} Matching button.
 */
function buttonNamed(host: HTMLElement, name: string): HTMLButtonElement {
  const found: HTMLButtonElement | undefined = Array.from(host.querySelectorAll('button')).find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent.trim()) === name,
  );
  if (!found) throw new Error(`No button named ${name}`);
  return found;
}

describe('CwBubble', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;
  let component: Host;

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
    component = fixture.componentInstance;
  });

  it('defaults to muted at the start and keeps the given variant and alignment', () => {
    const plain: HTMLElement | null = host.querySelector<HTMLElement>('#plain');
    const reply: HTMLElement | null = host.querySelector<HTMLElement>('#reply');

    expect(plain?.dataset['variant']).toBe('muted');
    expect(plain?.dataset['align']).toBe('start');
    expect(reply?.dataset['variant']).toBe('secondary');
    expect(reply?.dataset['align']).toBe('end');
  });

  it('reads the tone word before the title', () => {
    expect(host.querySelector('#warning')?.textContent).toContain(
      'Avertissement : Réponse incomplète',
    );
  });

  it('toggles a reaction and names it with its count', async () => {
    const reaction: HTMLButtonElement = buttonNamed(host, "D'accord : 2");
    expect(reaction.getAttribute('aria-pressed')).toBe('false');
    expect(reaction.getAttribute('type')).toBe('button');

    reaction.click();
    await fixture.whenStable();

    expect(component.liked()).toBe(true);
    expect(reaction.getAttribute('aria-pressed')).toBe('true');
    expect(reaction.getAttribute('aria-label')).toBe("D'accord : 2, dont vous");
  });

  it('emits reactionAdd from the add button and navigate from the quote', () => {
    buttonNamed(host, 'Ajouter une réaction').click();
    buttonNamed(host, 'Karim Benali').click();

    expect(component.adds()).toBe(1);
    expect(component.navigated()).toBe(true);
    expect(host.querySelector('blockquote')?.textContent).toContain("J'ai reproduit le bug.");
  });

  it('gives the bubbles of a group their positions', () => {
    const positions: (string | undefined)[] = Array.from(
      host.querySelectorAll<HTMLElement>('cw-bubble-group cw-bubble'),
    ).map((bubble) => bubble.dataset['position']);

    expect(positions).toEqual(['first', 'middle', 'last']);
    expect(host.querySelector<HTMLElement>('#plain')?.dataset['position']).toBeUndefined();
  });

  it('takes its variant, alignment and position from a container', () => {
    /**
     * Class Container
     *
     * @description
     * Supplies inherited defaults to a bubble.
     */
    @Component({
      imports: [CwBubble],
      providers: [
        {
          provide: CW_BUBBLE_DEFAULTS,
          useValue: {
            variant: signal('secondary'),
            align: signal('end'),
            position: signal('last'),
          },
        },
      ],
      template: `<cw-bubble>Je relis ce soir.</cw-bubble>`,
    })
    class Container {}

    const container: ComponentFixture<Container> = TestBed.createComponent(Container);
    container.detectChanges();
    const bubble: HTMLElement | null = (
      container.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('cw-bubble');

    expect(bubble?.dataset['variant']).toBe('secondary');
    expect(bubble?.dataset['align']).toBe('end');
    expect(bubble?.dataset['position']).toBe('last');
  });
});
