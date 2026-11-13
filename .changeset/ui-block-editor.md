---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/block-editor` entry point: `cw-block-editor`, rich text editing stored as
Markdown (`[(value)]`, Signal Forms and value accessor) on headless Tiptap, with the formatting
toolbar of the mockup, the « / » block menu (ten block types), « @ » mentions, a link panel,
Ctrl + B, I, U, E, K and Ctrl + Entrée. It reads and writes the grammar of `cw-markdown`. Only this
entry point (and the comment composer built on it) loads the editor engine.
