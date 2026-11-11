/*
 * Public API of @waypoint/ui.
 *
 * Each brick of `src/lib/<brick>/` is exported from here by name, one explicit
 * `export { … } from './lib/<brick>/<brick>'` per file: no `export *`, nothing internal, no testing
 * helper (.claude/rules/public-api.md). Removing or renaming an export is a major version, after a
 * deprecation in a minor.
 *
 * No brick has been built yet, so the module is empty on purpose: the bricks of
 * .claude/skills/wp-brick-recipes arrive one by one, each with its export line here.
 */

export {};
