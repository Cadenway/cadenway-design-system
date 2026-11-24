import { ɵwriteMention } from '@cadenway/ui/core';
import type { Tokens, TokensList } from 'marked';

import * as publicApi from './public-api';

describe('@cadenway/ui/components/markdown public API', () => {
  // Removing or renaming an export is a major version, after a deprecation in a minor
  // (.claude/rules/public-api.md): the runtime names are pinned here.
  it('exports exactly the pinned names', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'CW_MARKDOWN_LABELS',
      'CwMarkdown',
      'provideCwMarkdownLabels',
      'ɵcreateMarked',
      'ɵwriteMention',
    ]);
  });

  it('constructs a lexer for the shared grammar without arguments', () => {
    expect(publicApi.ɵwriteMention).toBe(ɵwriteMention);
    const tokens: TokensList = publicApi.ɵcreateMarked().lexer(ɵwriteMention('u-1', 'Léa'));
    const paragraph: Tokens.Paragraph = tokens[0] as Tokens.Paragraph;
    expect(paragraph.tokens[0]).toMatchObject({ type: 'mention', id: 'u-1', label: 'Léa' });
  });
});
