import { Marked, type Tokens, type TokensList } from 'marked';

import { ɵcreateMarkdownLexer, ɵwriteMention } from './markdown.marked';

describe('the shared Markdown grammar', () => {
  it('round-trips a mention with special characters', () => {
    const written: string = ɵwriteMention('id (1)', 'Léa [Design]');
    const tokens: TokensList = ɵcreateMarkdownLexer(Marked).lexer(written);
    const paragraph: Tokens.Paragraph = tokens[0] as Tokens.Paragraph;
    expect(paragraph.tokens[0]).toMatchObject({
      type: 'mention',
      id: 'id (1)',
      label: 'Léa [Design]',
    });
  });

  it('returns a new instance on each call', () => {
    expect(ɵcreateMarkdownLexer(Marked)).not.toBe(ɵcreateMarkdownLexer(Marked));
  });
});
