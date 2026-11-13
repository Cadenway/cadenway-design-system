---
'@cadenway/ui': minor
---

Add `@cadenway/ui/components/checklist`: `cw-checklist`, `cw-checklist-item`, `cw-checklist-add` and `[cwChecklistItemMenu]`. A collapsible checklist with its « 3 / 9 » count and progress bar, items to tick (`[(checked)]`), to edit in place (click or F2, Enter, Escape, Tab nests), one level of sub-items, inline addition that stays open after Enter, « Masquer les éléments terminés » (`[(hideCompleted)]`), reordering by CDK drag-drop and from the keyboard (Space, arrows, announced), a default menu (Modifier, Ajouter un sous-élément, Convertir en tâche, Supprimer) and a `subtasks` variant whose status control is a consumer slot. The consumer owns the data: `itemAdd`, `itemMove`, `itemConvert`, `itemRemove`, `labelChange`.
