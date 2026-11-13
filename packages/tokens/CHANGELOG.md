# @cadenway/tokens

## 0.1.1

### Patch Changes

- c1141b2: Declare the third-party dependencies the bricks are built on. `@cadenway/ui` now requires `@angular/cdk`, `@angular/aria`, `@angular/forms` and `@ng-icons/core` as peer dependencies, and depends on Tiptap (`@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-list`, `@tiptap/extensions`, `@tiptap/suggestion`, `@tiptap/markdown`), `@floating-ui/dom` and `marked` for the future `cw-block-editor` and `cw-markdown` bricks. `@cadenway/icons` depends on `@ng-icons/svgl` and `@ng-icons/flag-icons` for logos and flags. `@cadenway/tokens` takes the Inter and Geist Mono variable fonts from Fontsource as development dependencies; what it publishes is unchanged.

## 0.1.0

### Minor Changes

- 85a4d03: Bootstrap the three packages: `@cadenway/tokens` ships the structure of `tokens.css` and `theme.css` without values yet, `@cadenway/icons` exports `provideCadenwayIcons()`, and `@cadenway/ui` is an Angular library whose public API is still empty.
