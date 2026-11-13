/** Diameter of an avatar: 20 px (`xs`, menus, mentions) to 40 px (`lg`, a member's profile). */
export type CwAvatarSize = 'xs' | 'sm' | 'default' | 'lg';

/** Presence shown by the dot: online (green), away (muted); `null` means offline, no dot. */
export type CwAvatarPresence = 'online' | 'away';

/** The hidden texts of an avatar, French by default (Avatar sheet of the Design System artifact). */
export interface CwAvatarLabels {
  /** Name read when `name` is unknown (a deleted account). */
  readonly unknown: string;
  /** Suffix read after the name of an online person, without parentheses. */
  readonly online: string;
  /** Suffix read after the name of an away person, without parentheses. */
  readonly away: string;
  /** Suffix read after the name of a deactivated account, without parentheses. */
  readonly disabled: string;
}
