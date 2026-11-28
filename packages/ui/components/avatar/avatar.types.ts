/**
 * Type CwAvatarSize
 *
 * @description
 * Avatar diameter from 20 px (`xs`) to 40 px (`lg`).
 *
 * @type {'xs' | 'sm' | 'default' | 'lg'}
 */
export type CwAvatarSize = 'xs' | 'sm' | 'default' | 'lg';

/**
 * Type CwAvatarPresence
 *
 * @description
 * Presence shown by the dot: online, away, do not disturb (`dnd`, a bar across the dot) or
 * invisible (connected but shown offline, a hollow dot), as the statuses of the mockup's user menu
 * (`App.dc.html`, `USER_STATUSES`); a null input means offline and shows no dot.
 *
 * @type {'online' | 'away' | 'dnd' | 'invisible'}
 */
export type CwAvatarPresence = 'online' | 'away' | 'dnd' | 'invisible';

/**
 * Type CwAvatarRing
 *
 * @description
 * Surface the avatar sits on, whose color rings the presence dot so it reads as cut out of the
 * disc: the page (`background`), the shell's canvas (the app rail), a menu or popover, a card or
 * the sidebar (mockup App.dc.html: `ring-canvas` on the rail, `ring-popover` in the user menu).
 *
 * @type {'background' | 'canvas' | 'popover' | 'card' | 'sidebar'}
 */
export type CwAvatarRing = 'background' | 'canvas' | 'popover' | 'card' | 'sidebar';

/**
 * Interface CwAvatarLabels
 *
 * @description
 * Accessible avatar text, supplied in French by default.
 */
export interface CwAvatarLabels {
  // #region Properties
  /**
   * Property unknown
   * @readonly
   *
   * @description
   * Name read when the account name is unknown.
   *
   * @type {string}
   */
  readonly unknown: string;

  /**
   * Property online
   * @readonly
   *
   * @description
   * Suffix read after the name of an online person, without parentheses.
   *
   * @type {string}
   */
  readonly online: string;

  /**
   * Property away
   * @readonly
   *
   * @description
   * Suffix read after the name of an away person, without parentheses.
   *
   * @type {string}
   */
  readonly away: string;

  /**
   * Property dnd
   * @readonly
   *
   * @description
   * Suffix read after the name of a person who does not want to be disturbed, without
   * parentheses. Optional in the type so existing label objects stay valid; `CW_AVATAR_LABELS`
   * always defines it.
   *
   * @type {string | undefined}
   */
  readonly dnd?: string;

  /**
   * Property invisible
   * @readonly
   *
   * @description
   * Suffix read after the name of a person connected but shown offline, without parentheses.
   * Optional in the type so existing label objects stay valid; `CW_AVATAR_LABELS` always defines it.
   *
   * @type {string | undefined}
   */
  readonly invisible?: string;

  /**
   * Property disabled
   * @readonly
   *
   * @description
   * Suffix read after the name of a deactivated account, without parentheses.
   *
   * @type {string}
   */
  readonly disabled: string;
  // #endregion
}

/**
 * Interface CwAvatarProvidedLabels
 *
 * @description
 * Complete default texts accepted by the provider, including dedicated input defaults.
 */
export interface CwAvatarProvidedLabels extends CwAvatarLabels {
  // #region Properties
  /**
   * Property group
   *
   * @description
   * Accessible name of the avatar group.
   *
   * @type {string}
   * @readonly
   */
  readonly group: string;

  /**
   * Property othersPrefix
   *
   * @description
   * Word before the number of other people.
   *
   * @type {string}
   * @readonly
   */
  readonly othersPrefix: string;

  /**
   * Property add
   *
   * @description
   * Accessible name of the add button.
   *
   * @type {string}
   * @readonly
   */
  readonly add: string;
  // #endregion
}
