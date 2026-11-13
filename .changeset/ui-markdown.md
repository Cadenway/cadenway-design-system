---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/markdown` entry point: `cw-markdown` renders stored Markdown with Angular
templates over the `marked` lexer (headings, paragraphs and breaks, bold, italic, `__underline__`,
strike, inline code, safe links, bullet, numbered and task lists, quotes, code blocks through
`cw-code-block`, separators, tables, `@[name](id)` mentions); HTML in the source is shown as text,
never injected. It owns the Markdown grammar shared with the block editor.
