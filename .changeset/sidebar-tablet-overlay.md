---
'@cadenway/ui': minor
---

Add two opt-in inputs to `cw-sidebar` for the application shell of the mockup (`App.dc.html`). `overlayBelow="lg"` (default `md`, the phone drawer only) also floats the expanded sidebar over the content between 768 and 1023 px, with a `shadow-md`: it starts hidden there instead of showing the icon rail, closes on Escape and on a click outside it (a transparent backdrop), and stays open when an item is followed. `backdrop="container"` (default `viewport`) makes the backdrop `absolute` inside the nearest positioned ancestor instead of `fixed` over the viewport, so it leaves out the bottom tab bar of `cw-app-rail`. When a floating sidebar (the phone drawer or the tablet overlay) closes with the focus inside it, the focus now goes back to the element that opened it, or to a toggle outside it, instead of staying in the inert navigation. New types `CwSidebarOverlayBelow` and `CwSidebarBackdrop`. Defaults are unchanged.
