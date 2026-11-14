import type { TokensList } from 'marked';
import { Component, signal, type WritableSignal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { CwMarkdown } from './markdown.component';
import { ɵcreateMarked, ɵwriteMention } from './markdown.marked';

/**
 * Component Host
 *
 * @description
 * Supplies Markdown source to the renderer under test.
 */
@Component({
  imports: [CwMarkdown],
  template: `<cw-markdown [source]="source()" />`,
})
class Host {
  // #region Properties
  /**
   * Property source
   * @readonly
   *
   * @description
   * Markdown source rendered in the test.
   *
   * @type {WritableSignal<string>}
   */
  public readonly source: WritableSignal<string> = signal('');
  // #endregion
}

describe('CwMarkdown', () => {
  let fixture: ComponentFixture<Host>;
  let host: HTMLElement;

  /**
   * Function render
   *
   * @description
   * Renders source and returns the Markdown root.
   *
   * @param {string} source - Markdown source to render.
   *
   * @returns {Promise<HTMLElement>} Rendered Markdown root after the fixture stabilizes.
   */
  async function render(source: string): Promise<HTMLElement> {
    fixture.componentInstance.source.set(source);
    await fixture.whenStable();
    const root: HTMLElement | null = host.querySelector<HTMLElement>('cw-markdown');
    if (!root) throw new Error('cw-markdown missing');
    return root;
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    host = fixture.nativeElement as HTMLElement;
  });

  it('renders headings, paragraphs and line breaks', async () => {
    const root: HTMLElement = await render(
      '# Objectif\n\n## Étapes\n\n### Détail\n\nPremière ligne\nseconde ligne',
    );
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Objectif');
    expect(root.querySelector('h2')?.textContent.trim()).toBe('Étapes');
    expect(root.querySelector('h3')?.textContent.trim()).toBe('Détail');
    const paragraph: HTMLParagraphElement | null = root.querySelector('p');
    expect(paragraph?.querySelector('br')).not.toBeNull();
    expect(paragraph?.textContent).toBe('Première ligneseconde ligne');
  });

  it('renders the inline marks of the Cadenway grammar without extra spaces', async () => {
    const root: HTMLElement = await render(
      'Le **gras**, *italique*, __souligné__, ~~barré~~ et `code`.',
    );
    const paragraph: HTMLElement = root.querySelector('p') as HTMLElement;
    expect(paragraph.textContent).toBe('Le gras, italique, souligné, barré et code.');
    expect(paragraph.querySelector('strong')?.textContent).toBe('gras');
    expect(paragraph.querySelector('em')?.textContent).toBe('italique');
    expect(paragraph.querySelector('u')?.textContent).toBe('souligné');
    expect(paragraph.querySelector('del')?.textContent).toBe('barré');
    expect(paragraph.querySelector('code')?.textContent).toBe('code');
  });

  it('reads __text__ as underline, never as bold', async () => {
    const root: HTMLElement = await render('__souligné__ et **gras**');
    expect(root.querySelectorAll('strong')).toHaveLength(1);
    expect(root.querySelector('u')?.textContent).toBe('souligné');
  });

  it('keeps safe links and drops dangerous addresses', async () => {
    const root: HTMLElement = await render(
      '[Spec](https://cadenway.fr/spec) [Piège](javascript:alert(1)) [Données](data:text/html,x) [Relatif](/taches/CAD-482)',
    );
    const links: HTMLAnchorElement[] = Array.from(root.querySelectorAll('a'));
    expect(links.map((link) => link.textContent)).toEqual(['Spec', 'Relatif']);
    expect(links[0].getAttribute('href')).toBe('https://cadenway.fr/spec');
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(root.textContent).toContain('Piège');
    expect(root.textContent).toContain('Données');
  });

  it('never injects HTML: markup shows as text', async () => {
    const root: HTMLElement = await render(
      '<img src=x onerror="alert(1)">\n\nTexte <b>gras</b> & <script>x</script>',
    );
    expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('b')).toBeNull();
    expect(root.querySelector('script')).toBeNull();
    expect(root.textContent).toContain('<img src=x onerror="alert(1)">');
    expect(root.textContent).toContain('<b>gras</b>');
  });

  it('decodes the entities the editor writes', async () => {
    const root: HTMLElement = await render('a &lt; b &amp;&amp; c &gt; d');
    expect(root.querySelector('p')?.textContent).toBe('a < b && c > d');
  });

  it('renders bullet, numbered and task lists', async () => {
    const root: HTMLElement = await render(
      '- un\n- deux\n\n3. trois\n4. quatre\n\n- [ ] à faire\n- [x] fait',
    );
    const lists: NodeListOf<Element> = root.querySelectorAll('ul, ol');
    expect(lists).toHaveLength(3);
    expect(lists[0].tagName).toBe('UL');
    expect(lists[0].querySelectorAll('li')).toHaveLength(2);
    expect(lists[1].tagName).toBe('OL');
    expect(lists[1].getAttribute('start')).toBe('3');

    const boxes: HTMLInputElement[] = Array.from(
      lists[2].querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    expect(boxes.map((box) => [box.getAttribute('aria-label'), box.checked, box.disabled])).toEqual(
      [
        ['à faire', false, true],
        ['fait', true, true],
      ],
    );
  });

  it('renders quotes, separators and code blocks through cw-code-block', async () => {
    const root: HTMLElement = await render('> Citation\n\n---\n\n```ts\nconst a = 1 < 2;\n```');
    expect(root.querySelector('blockquote')?.textContent.trim()).toBe('Citation');
    expect(root.querySelector('hr')).not.toBeNull();
    const code: Element | null = root.querySelector('cw-code-block');
    expect(code).not.toBeNull();
    expect(code?.textContent).toContain('const a = 1 < 2;');
  });

  it('renders mentions, read as « mention » and the name', async () => {
    const root: HTMLElement = await render(`Merci ${ɵwriteMention('u-1', 'Karim Benali')} !`);
    const mention: Element | null = root.querySelector('[data-mention]');
    expect(mention?.textContent).toBe('mention @Karim Benali');
    expect(mention?.getAttribute('data-id')).toBe('u-1');
  });

  it('updates when the source changes', async () => {
    let root: HTMLElement = await render('Avant');
    expect(root.textContent.trim()).toBe('Avant');
    root = await render('Après');
    expect(root.textContent.trim()).toBe('Après');
  });
});

describe('ɵcreateMarked and ɵwriteMention', () => {
  it('round-trips a mention with special characters', () => {
    const written: string = ɵwriteMention('id (1)', 'Léa [Design]');
    const tokens: TokensList = ɵcreateMarked().lexer(written);
    const paragraph: { tokens: { type: string; id?: string; label?: string }[] } = tokens[0] as {
      tokens: { type: string; id?: string; label?: string }[];
    };
    expect(paragraph.tokens[0]).toMatchObject({
      type: 'mention',
      id: 'id (1)',
      label: 'Léa [Design]',
    });
  });

  it('returns a new instance on each call', () => {
    expect(ɵcreateMarked()).not.toBe(ɵcreateMarked());
  });
});
