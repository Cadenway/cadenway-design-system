---
'@cadenway/ui': minor
---

Add `@cadenway/ui/inline-edit`: `cw-inline-edit`, a text that turns into a field at the same place and size (title, list name, short description). Reading, hover, keyboard focus, editing (text selected, « Entrée pour valider · Échap pour annuler »), saving (spinner, « Enregistrement… », `aria-busy`), error (the field reopens with the typed text), empty (placeholder) and read-only states; `multiline` validates with Ctrl + Enter; `[(value)]`, `[(editing)]`, `save` and `cancel`; a Signal Forms value control and a `ControlValueAccessor`.
