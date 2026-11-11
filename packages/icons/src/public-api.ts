/*
 * Public API of @waypoint/icons.
 *
 * Explicit named exports only, nothing internal and no testing helper
 * (.claude/rules/public-api.md): removing or renaming an export is a major version, after a
 * deprecation in a minor.
 */

export { provideWaypointIcons } from './lib/provide-waypoint-icons';
