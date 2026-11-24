import * as publicApi from './public-api';

describe('@cadenway/ui/bubble public API', () => {
  // Removing or renaming an export is a major version, after a deprecation in a minor
  // (.claude/rules/public-api.md): the runtime names are pinned here.
  it('exports exactly the pinned names', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'CW_BUBBLE_DEFAULTS',
      'CW_BUBBLE_LABELS',
      'CwBubble',
      'CwBubbleGroup',
      'CwBubbleQuote',
      'CwBubbleReaction',
      'CwBubbleReactions',
      'provideCwBubbleLabels',
    ]);
  });
});
