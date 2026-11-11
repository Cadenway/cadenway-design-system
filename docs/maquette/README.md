# Mockup (read-only reference)

`source/` is a copy of the Waypoint interactive mockup (19 artboards, `*.dc.html`) and its compiled
stylesheet (`source/styles/app.css`). It is the reference for screens, states, copy and behaviors.
The live version is the Design artifact: https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE

- Never edit these files: the agent guard refuses it. When the mockup changes, replace the whole
  copy in a dedicated pull request.
- Each `.dc.html` holds markup with `{{holes}}`, `<sc-if>` and `<sc-for>`, then a
  `<script type="text/x-dc">` whose methods are the behaviors and whose `data-props` lists the states
  you can display.
- The artboards reference `support.js`, which is missing from the export. Use the Design artifact
  to inspect the interactive screens.
- The `maquette` configuration in `.claude/launch.json` serves the exported files for source inspection.
