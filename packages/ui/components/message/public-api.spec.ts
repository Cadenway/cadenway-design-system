import * as publicApi from './public-api';

describe('@cadenway/ui/message public API', () => {
  // Removing or renaming an export is a major version, after a deprecation in a minor
  // (.claude/rules/public-api.md): the runtime names are pinned here.
  it('exports exactly the pinned names', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'CW_MESSAGE_LABELS',
      'CW_MESSAGE_THREAD_LABELS',
      'CW_MESSAGE_TONE_LABELS',
      'CwMessage',
      'CwMessageActions',
      'CwMessageAvatar',
      'CwMessageFooter',
      'CwMessageGroup',
      'CwMessageNote',
      'CwMessageThread',
      'provideCwMessageLabels',
      'provideCwMessageThreadLabels',
      'provideCwMessageToneLabels',
    ]);
  });
});
