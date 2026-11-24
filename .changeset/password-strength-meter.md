---
'@cadenway/ui': minor
---

Add the `@cadenway/ui/components/password-strength` entry point, the strength of a new password as the mockup shows it under the field (`Inscription.dc.html`, `Reinitialisation.dc.html`): `cw-password-strength` (`exportAs` `cwPasswordStrength`) draws a `cw-meter` in `segmented` with one notch per rule (its value text is the level) and the list of rules, each read as met or not; `cw-password-strength-level` (`for`) writes the level (« Trop court » to « Excellent ») in a polite live region next to the field label. `value` is the password, `minLength` (12) sets the length rule and `rules` replaces the four default rules (length, upper and lower case, a digit, a symbol, built by `cwPasswordRules`). `score`, `total`, `level`, `empty` and `rulesId` (for the field's `aria-describedby`) are readable; the meter never validates. Texts come from `provideCwPasswordStrengthLabels` over `CW_PASSWORD_STRENGTH_LABELS`.
