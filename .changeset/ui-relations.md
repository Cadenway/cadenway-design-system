---
'@cadenway/ui': minor
---

Add `@cadenway/ui/components/relations`: `cw-relations`, `cw-relation-picker` and `ng-template[cwRelationLeading]`. The relations of an item grouped by the consumer's relation types (in their order, empty groups hidden), each row with the consumer's glyph, the reference, the title as a link (the whole row clickable, `open`), the path of an item that lives elsewhere, a written warning (« Non terminée ») and the assignee; a row menu (Ouvrir la tâche, Changer le type, Copier le lien, Retirer la relation), Delete and Shift + F10 on the title; « Aucune relation. » when empty. « Ajouter » opens the picker in a popover: the type in a `cw-select`, then a search in a `cw-combobox` whose results come from the consumer (`search`, `results`, `loading`), an item already related disabled with « Déjà liée »; `add`, `remove`, `changeType`.
