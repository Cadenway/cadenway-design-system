import * as publicApi from './public-api';

describe('@cadenway/ui public API', () => {
  // Removing or renaming an export is a major version, after a deprecation in a minor
  // (.claude/rules/public-api.md). The runtime names are pinned here so that such a change is made
  // on purpose, in the same change as public-api.ts. No brick exists yet: the list is empty.
  it('exports exactly the pinned names', () => {
    expect(Object.keys(publicApi).sort()).toEqual([]);
  });
});
