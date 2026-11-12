/*
 * Public API of @cadenway/icons.
 *
 * Explicit named exports only, nothing internal and no testing helper
 * (.claude/rules/public-api.md): removing or renaming an export is a major version, after a
 * deprecation in a minor.
 */

export { provideCadenwayIcons } from './lib/provide-cadenway-icons';
